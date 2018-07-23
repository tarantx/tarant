/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import TimeMachine from "./time-machine";
import uuid from "uuid/v4";

const DoNothing = () => {};
const EmptyMaterializer = {
    onActivate: DoNothing,
    onDeactivate: DoNothing,
    onReceiveMessage: DoNothing,
    onBeforePullingMessage: DoNothing,
    onAfterMessageProcessed: DoNothing,
    onError: DoNothing,
    onSubscribe: DoNothing,
    onUnsubscribe: DoNothing
};


/**
 * An Actor is the unit of state and logic of an Actor System.
 *
 */
class Actor {
    constructor(mailbox, timeMachine, materializer, initialState, id, system) {
        this.mailbox = mailbox || [];
        this.timeMachine = timeMachine || new TimeMachine();
        this.materializer = Object.assign({}, EmptyMaterializer, materializer || {});
        Object.assign(this, initialState || {});
        this.id = id || this.id || uuid();
        this.system = system;

        this.materializer.onActivate(this);
    }

    /**
     * Adds a message to the mailbox if the actor is not dead.
     * @param message
     */
    receiveMessage(message) {
        if (!this.hasBeenKilled) {
            this.mailbox.push(message);
            this.materializer.onReceiveMessage(this, message);
        }
    }

    /**
     * Kills an actor, thus not processing more new messages.
     */
    kill() {
        this.hasBeenKilled = true;
        this.materializer.onDeactivate(this);
    }

    /**
     * Pulls a new message from the mailbox (if any).
     *
     * @returns {Promise<any>} With the result of the pull.
     */
    pull() {
        if (this.busyPulling || this.mailbox.length === 0) {
            return Promise.resolve(undefined);
        }

        let notBusyAnymore = () => this.busyPulling = false;

        return new Promise((_resolve, _reject) => {
            this.busyPulling = true;

            let [ message ] = this.mailbox;
            this.materializer.onBeforePullingMessage(this, message);

            let triggerMessageProcessed = (result) => {
                this.materializer.onAfterMessageProcessed(this, message, result);
                return result;
            };
            let resolve = (result) => _resolve(triggerMessageProcessed(result));

            let triggerMessageFailed = (error) => {
                this.materializer.onError(this, message, error);
                return error;
            };
            let reject = (error) => _reject(triggerMessageFailed(error));

            try {
                let r = this.onReceive(message);
                let [ _, ...rest ] = this.mailbox;

                this.mailbox = rest;

                if (r && r.then !== undefined && r.catch !== undefined) {
                    r.then(answer => {
                        this.__saveCurrentState();
                        return answer;
                    }).then(message.answerTo)
                        .then(resolve)
                        .catch(message.failOn)
                        .catch(reject);
                } else {
                    if (message.answerTo !== undefined) {
                        message.answerTo(r);
                    }

                    this.__saveCurrentState();
                    resolve(r);
                }
            } catch (e) {
                if (message.failOn !== undefined) {
                    message.failOn(e);
                }
                reject(e);
            }
        }).then((e) => {
            notBusyAnymore();
            return e;
        }, (e) => {
            notBusyAnymore();
            throw e;
        });
    }

    /**
     * Tells a message to another actor. The new message will be processed eventually by the receiver. If the
     * receiver is dead, the message is ignored but this method will not fail.
     *
     * @see kill
     * @param actor {Actor} The receiver
     * @param message {any} The message to send
     */
    tell(actor, message) {
        actor.receiveMessage({ origin: this, message: message });
    }

    /**
     * Asks for a response to another actor. The message will be processed eventually and the promise resolved with
     * the return value of the receiver's onReceive.
     *
     * If any of the actors are dead, the message will not be delivered, thus returning a new Promise of
     * undefined.
     *
     * @see kill
     * @param actor {Actor} receiver
     * @param message {any} The message to send
     * @returns {Promise<any>} The response of the receiver actor
     */
    ask(actor, message) {
        if (actor.id === this.id) {
            throw { message: "An actor can not ask anything to itself" };
        }

        if (this.hasBeenKilled || actor.hasBeenKilled) {
            return Promise.resolve(undefined);
        }

        return new Promise((resolve, reject) => {
            let newMessage = { origin: this, message: message, answerTo: resolve, failOn: reject };
            actor.receiveMessage(newMessage);
        });
    }

    /**
     * Changes the actor state to the state saved at {index}.
     *
     * @param index
     * @returns {Actor} The same actor.
     */
    navigateTo(index) {
        let state = this.timeMachine.retrieve(index);
        return Object.assign(this, state);
    }

    /**
     * Returns the history of changes of an actor.
     *
     * @returns {*}
     */
    history() {
        return this.timeMachine.retrieveHistory();
    }

    /**
     * The method that processes messages. This must be implemented by all Actors.
     *
     * @param origin {Actor | ActorSystem} The sender of the message.
     * @param message {any} The received message.
     * @param answerTo {Function} Function to call to answer a promise. You should return a promise instead of calling this.
     * @param failOn {Function} Function to call to reject a promise. You should throw an exception or return a rejected promise instead.
     * @returns {any | Promise<any>}
     */
    onReceive({ origin, message, answerTo, failOn }) {
        throw "Not implemented";
    }

    /**
     * @private
     */
    __saveCurrentState() {
        let state = {... this};
        delete state.timeMachine;
        delete state.onReceive;
        delete state.materializer;
        delete state.busyPulling;

        this.timeMachine.save(state);
    }

    /**
     * Subscribes to a topic, enqueueing all received messages of this topic to the mailbox.
     *
     * @param topic {string} The topic name.
     * @returns {*}
     */
    subscribe(topic) {
        this.subscriptions = (this.subscriptions || {});
        this.subscriptions[topic] = this.system.eventBus.subscribe(topic, (message) => this.receiveMessage(message));
        this.materializer.onSubscribe(this, topic, this.subscriptions[topic]);
        return this.subscriptions[topic];
    }

    /**
     * Unsubscribes from a topic, ignoring further messages on this topic.
     *
     * @param topic {string}
     */
    unsubscribe(topic) {
        let id = this.subscriptions[topic];
        this.system.eventBus.unsubscribe(id);
        delete this.subscriptions[topic];
        this.materializer.onUnsubscribe(this, topic, id);
    }

    /**
     * Publishes a message to a topic. Messages in a topic will be eventually processed by all subscribed actors.
     *
     * @param topic {string}
     * @param message {any}
     */
    publish(topic, message) {
        this.system.eventBus.publish(topic, { origin: this, message });
    }

    /**
     * Request a response from all actors subscribed to a topic for a given message.
     * For example, let's imagine that we have the following two actors subscribed to the topic 'ops':
     *
     * <pre>
     * Actor1 => given a number :: returns number + 1
     * Actor2 => given a number :: returns number + 2
     * </pre>
     *
     *  If we request a message like:
     *
     * <pre><code>
     * MyActor.request('ops', 1);
     * </code></pre>
     *
     * It will return a Promise, that eventually will return [2, 3] (the order may differ).
     *
     * If any of the actors doesn't respond in the given timeout, the promise will be rejected, ignoring any
     * response. The state of other actors will not rollback.
     *
     * @param topic {string}
     * @param message {string}
     * @param timeout {number} in milliseconds
     * @returns {Promise<any>}
     */
    request(topic, message, timeout = 1000) {
        let millis = () => ((+new Date()) / 1000);
        let startTime = millis();

        return new Promise((resolve, reject) => {
            let answer = [];

            let count = this.system.eventBus.callbacks[topic].length;
            let answerTo = (m) => answer.push(m);

            this.system.eventBus.publish(topic, { origin: this, message, answerTo, failOn: reject });

            let __i = { interval: 0 };

            let waitToResolve = () => {
                let currentTime = millis();
                if ((currentTime - startTime) >= timeout) {
                    clearInterval(__i.interval);
                    return reject("timeout");
                }

                if (answer.length === count) {
                    clearInterval(__i.interval);
                    return resolve(answer);
                }
            };

            __i.interval = setInterval(waitToResolve, 1);
        });

    }
}

export default Actor;
/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import TimeMachine from "./time-machine";

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

export default /* abstract */ class Actor {
    constructor(mailbox, timeMachine, materializer) {
        this.mailbox = mailbox || [];
        this.timeMachine = timeMachine || new TimeMachine();
        this.materializer = Object.assign({}, EmptyMaterializer, materializer || {});

        setTimeout(() => this.materializer.onActivate(this), 0);
    }

    receiveMessage(message) {
        if (!this.hasBeenKilled) {
            this.mailbox.push(message);
            this.materializer.onReceiveMessage(this, message);
        }
    }

    kill() {
        this.hasBeenKilled = true;
        this.materializer.onDeactivate(this);
    }

    pull() {
        return new Promise((_resolve, _reject) => {
            if (this.mailbox.length === 0) {
                return _resolve(undefined);
            }

            let [ message, ...rest ] = this.mailbox;
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
        });
    }

    tell(actor, message) {
        actor.receiveMessage({ origin: this, message: message });
    }

    ask(actor, message) {
        if (this.hasBeenKilled) {
            return Promise.resolve(undefined);
        }

        return new Promise((resolve, reject) => {
            let newMessage = { origin: this, message: message, answerTo: resolve, failOn: reject };
            actor.receiveMessage(newMessage);
        });
    }

    navigateTo(index) {
        let state = this.timeMachine.retrieve(index);
        return Object.assign(this, state);
    }

    history() {
        return this.timeMachine.retrieveHistory();
    }

    onReceive() {
        throw "Not implemented";
    }

    __saveCurrentState() {
        let state = {... this};
        delete state.timeMachine;
        delete state.onReceive;
        delete state.materializer;

        this.timeMachine.save(state);
    }

    subscribe(topic) {
        this.subscriptions = (this.subscriptions || {});
        this.subscriptions[topic] = this.system.eventBus.subscribe(topic, (message) => this.receiveMessage(message));
        this.materializer.onSubscribe(this, topic, this.subscriptions[topic]);
        return this.subscriptions[topic];
    }

    unsubscribe(topic) {
        let id = this.subscriptions[topic];
        this.system.eventBus.unsubscribe(id);
        delete this.subscriptions[topic];
        this.materializer.onUnsubscribe(this, topic, id);
    }

    publish(topic, message) {
        this.system.eventBus.publish(topic, { origin: this, message });
    }

    request(topic, message, timeout = 1000) {
        let millis = () => ((+new Date()) / 1000);

        return new Promise((resolve, reject) => {
            let startTime = millis();

            let answer = [];

            let count = this.system.eventBus.callbacks[topic].length;
            let answerTo = (m) => answer.push(m);

            this.system.eventBus.publish(topic, { origin: this, message, answerTo, failOn: reject });

            let waitToResolve = () => {
                let currentTime = millis();
                if ((currentTime - startTime) > timeout) {
                    return reject("timeout");
                }

                if (answer.length === count) {
                    return resolve(answer);
                }

                setTimeout(waitToResolve, 1);
            };

            waitToResolve();
        });

    }
}
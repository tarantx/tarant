/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Scheduler from "./scheduler";
import Actor from "./actor";
import drop from "./supervisor/drop";
import EventBus from "./event-bus";
import uuid from "uuid/v4";

/**
 * The Actor System is the class responsible of managing actors and their lifecycle.
 */
class ActorSystem {
    /**
     * @param scheduler {Scheduler} Custom Scheduler, undefined for default.
     * @param supervisor {Supervisor} Custom supervisor, defaults to () => drop
     * @param materializer {Materializer} Custom materializer, defaults to noop.
     * @param eventBus { EventBus } Custom event bus, defaults to a new Event Bus.
     * @param defaultTicks {number} Default tick interval for the default scheduler.
     */
    constructor(scheduler, supervisor, materializer, eventBus, defaultTicks) {
        this.scheduler = scheduler || new Scheduler(() => this.__pullAllActorMailboxes(), defaultTicks);
        this.supervisor = supervisor || (() => drop);
        this.actors = {};
        this.materializer = materializer;
        this.eventBus = eventBus || new EventBus();
    }

    /**
     * Returns an Actor class that you can extend. You will need to implement yourself the onReceive method.
     *
     * @see Actor
     * @returns {class}
     * @constructor
     */
    get Actor() {
        let system = this;
        return class extends Actor {
            constructor(initialState) {
                super(undefined, undefined, system.materializer, initialState, (initialState || {}).id || uuid(), system);

                system.actors[this.id] = this;
            }
        }
    }

    /**
     * Gets an Actor instance by Id
     * @param id
     * @returns {Actor}
     */
    getActor(id) {
        return this.actors[id];
    }

    /**
     * Kills an actor and unregisters it from the Actor System. This actor will not receiver further messages,
     * but will eventually process the current mailbox.
     *
     * @param id
     */
    killActor(id) {
        let actor = this.actors[id];
        actor.kill();
        delete this.actors[id];
    }

    /**
     * Starts the ActorSystem, so it schedules messages. This is mandatory.
     */
    start() {
        this.scheduler.start();
    }

    /**
     * Stops gracefully the ActorSystem and all actors.
     * It will delay until all actors has been killed and all mailboxes processed.
     *
     * @returns {Promise<any>} Resolved when all actors has been killed.
     */
    stop() {
        Object.keys(this.actors).forEach(actorId => this.actors[actorId].kill());

        return new Promise(resolve => {
            this.scheduler.stop();

            let areAllIdle = () => Object.keys(this.actors).every(actorId => this.actors[actorId].mailbox.length === 0);
            let nextStopTick = () => {
                if (!areAllIdle()) {
                    this.__pullAllActorMailboxes();
                    setTimeout(nextStopTick, 0);
                } else {
                    resolve();
                }
            };

            nextStopTick();
        });
    }

    /**
     * @private
     */
    __pullAllActorMailboxes() {
        Object.keys(this.actors).forEach(async actorId => {
            await this.actors[actorId].pull().catch(error => this.supervisor(this, this.actors[actorId], error)(this, this.actors[actorId]));
        });
    }

    /**
     * Tels a message to an actor.
     *
     * @param id
     * @param message
     */
    tell(id, message) {
        this.getActor(id).receiveMessage({ origin: this, message });
    }

    /**
     * Asks for a message to an actor.
     *
     * @param id
     * @param message
     * @returns {Promise<any>}
     */
    ask(id, message) {
        return new Promise((resolve, reject) => {
            this.getActor(id).receiveMessage({ origin: this, message, answerTo: resolve, failOn: reject });
        });
    }
}

export default ActorSystem;
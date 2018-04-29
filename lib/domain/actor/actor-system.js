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

export default class ActorSystem {
    constructor(scheduler, supervisor, materializer, eventBus) {
        this.scheduler = scheduler || new Scheduler(() => this.pullAllActorMailboxes());
        this.supervisor = supervisor || (() => drop);
        this.actors = {};
        this.materializer = materializer;
        this.eventBus = eventBus || new EventBus();
    }

    get Actor() {
        let system = this;
        return class extends Actor {
            constructor(initialState) {
                super(undefined, undefined, system.materializer, initialState);

                this.id = uuid();
                this.system = system;

                system.actors[this.id] = this;
            }
        }
    }

    getActor(id) {
        return this.actors[id];
    }

    killActor(actorRef) {
        let actor = this.actors[actorRef.id];
        actor.kill();
        delete this.actors[actorRef.id];
    }

    start() {
        this.scheduler.start();
    }

    stop() {
        Object.keys(this.actors).forEach(actorId => this.actors[actorId].kill());

        return new Promise(resolve => {
            this.scheduler.stop();

            let areAllIdle = () => Object.keys(this.actors).every(actorId => this.actors[actorId].mailbox.length === 0);
            let nextStopTick = () => {
                if (!areAllIdle()) {
                    this.pullAllActorMailboxes();
                    setTimeout(nextStopTick, 0);
                } else {
                    resolve();
                }
            };

            nextStopTick();
        });
    }

    pullAllActorMailboxes() {
        Object.keys(this.actors).forEach(async actorId => {
            await this.actors[actorId].pull().catch(error => this.supervisor(this, this.actors[actorId], error)(this, this.actors[actorId]));
        });
    }

    tell(id, message) {
        this.getActor(id).receiveMessage({ origin: this, message });
    }

    ask(id, message) {
        return new Promise((resolve, reject) => {
            this.getActor(id).receiveMessage({ origin: this, message, answerTo: resolve, failOn: reject });
        });
    }
}
/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Scheduler from "./scheduler";
import Actor from "./actor";

export default class ActorSystem {
    constructor(scheduler) {
        this.scheduler = scheduler || new Scheduler(() => this.pullAllActorMailboxes());
        this.actors = {};
    }

    get Actor() {
        let system = this;
        return class extends Actor {
            constructor() {
                super();

                this.id = +new Date();
                this.system = system;

                system.actors[this.id] = this;
            }
        }
    }

    getActor(id) {
        return this.actors[id];
    }

    killActor(actorRef) {
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
            await this.actors[actorId].pull();
        });
    }
}
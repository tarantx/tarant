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

    killActor(actorRef) {
        delete this.actors[actorRef.id];
    }

    start() {
        this.scheduler.start();
    }

    stop() {
        this.scheduler.stop();
    }

    pullAllActorMailboxes() {
        Object.keys(this.actors).forEach(async actorId => {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.actors[actorId].pull().then(resolve, reject);
                }, 0);
            });
        });
    }
}
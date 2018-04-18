/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import TimeMachine from "./time-machine";

export default /* abstract */ class Actor {
    constructor(mailbox, timeMachine) {
        this.mailbox = mailbox || [];
        this.timeMachine = timeMachine || new TimeMachine();
    }

    receiveMessage(message) {
        this.mailbox.push(message);
    }

    pull() {
        let [ message, ...rest ] = this.mailbox;
        try {
            let r = this.onReceive(message);
            this.mailbox = rest;

            this.__saveCurrentState();

            if (r && r.then !== undefined && r.catch === undefined) {
                r.then(message.answerTo).catch(message.failOn);
            } else {
                if (message.answerTo !== undefined) {
                    message.answerTo(r);
                }
            }
        } catch (e) {
            if (message.failOn !== undefined) {
                message.failOn(e);
            }
        }

    }

    __saveCurrentState() {
        let state = {... this};
        delete state.timeMachine;
        delete state.onReceive;

        this.timeMachine.save(state);
    }

    tell(actor, message) {
        actor.receiveMessage({ origin: this, message: message });
    }

    ask(actor, message) {
        return new Promise((resolve, reject) => {
            let newMessage = { origin: this, message: message, answerTo: resolve, failOn: reject };
            actor.receiveMessage(newMessage);
        });
    }

    history() {
        return this.timeMachine.retrieveHistory();
    }

    onReceive() {
        throw "Not implemented";
    }
}
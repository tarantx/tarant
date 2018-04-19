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
        return new Promise((resolve, reject) => {
            if (this.mailbox.length === 0) {
                resolve(undefined);
            }

            let [ message, ...rest ] = this.mailbox;
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

        this.timeMachine.save(state);
    }
}
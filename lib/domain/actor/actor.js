/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default /* abstract */ class Actor {
    constructor() {
        this.mailbox = [];
    }

    receiveMessage(message) {
        this.mailbox.push(message);
    }

    pull() {
        let [ message, ...rest ] = this.mailbox;
        try {
            let r = this.onReceive(message);

            if (message.answerTo !== undefined) {
                message.answerTo(r);
            }
        } catch (e) {
            if (message.failOn !== undefined) {
                message.failOn(e);
            }
        }

        this.mailbox = rest;
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

    onReceive() {
        throw "Not implemented";
    }
}
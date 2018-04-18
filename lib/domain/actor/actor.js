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
        this.onReceive(message);
        this.mailbox = rest;
    }

    tell(actor, message) {
        actor.receiveMessage({ origin: this, message: message });
    }

    onReceive() {
        throw "Not implemented";
    }
}
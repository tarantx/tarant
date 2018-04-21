/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import uuid from "uuid/v4";

export default class EventBus {
    constructor() {
        this.subscriptions = {};
        this.callbacks = {};
    }

    subscribe(topic, callback) {
        let id = uuid();
        let curr = this.callbacks[topic] || [];

        this.subscriptions[id] = { topic, index: curr.length };
        this.callbacks[topic] = [...curr, { callback }];

        return id;
    }

    unsubscribe(subscription) {
        let { topic, index } = this.subscriptions[subscription];
        delete this.subscriptions[subscription];

        this.callbacks[topic].splice(index, 1);
    }

    publish(topic, message) {
        this.callbacks[topic].forEach(({ callback })=> callback(message));
    }
}
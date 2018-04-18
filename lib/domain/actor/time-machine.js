/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default class TimeMachine {
    constructor(history) {
        this.history = history || [];
    }

    save(state) {
        let copy = Object.freeze(Object.assign({}, state));
        this.history.push(copy);

        return this;
    }

    lastState() {
        return this.history.slice(-1)[0];
    }
}
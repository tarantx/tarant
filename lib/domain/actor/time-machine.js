/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @private
 */
class TimeMachine {
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

    retrieveHistory() {
        return this.history.slice();
    }

    retrieve(index) {
        return this.history[index] || undefined;
    }
}

export default TimeMachine;
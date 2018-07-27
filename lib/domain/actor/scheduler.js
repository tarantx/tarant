/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @private
 */
class Scheduler {
    constructor(dispatcher, interval) {
        this.dispatcher = dispatcher;
        this.interval = interval || 0;
        this.id = null;
    }

    start() {
        if (this.id === null) {
            this.id = setInterval(this.dispatcher, this.interval);
        }
    }

    stop() {
        clearInterval(this.id);
        this.id = null;
    }
}

export default Scheduler;
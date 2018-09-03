/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import drop from './drop'

/**
 * Retries at least {retries} times the offending message before dropping it.
 *
 * @param retries {number} Number of retries
 * @returns {Function}
 */
let retry = (retries) => (system, actor) => {
    let message = actor.mailbox.peek();
    if (message.retries >= (retries || system.maxRetries || 3)) {
        return drop(system, actor);
    }

    let history = actor.history();
    actor.navigateTo(history.length - 2);
    message.retries = (message.retries || 0) + 1;
    actor.mailbox.queue = [message, ...(actor.mailbox.queue.slice(1))];
    return actor;
};

export default retry;
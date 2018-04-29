/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import drop from './drop'

export default (retries) => (system, actor) => {
    if (actor.mailbox[0].retries >= (retries || system.maxRetries || 3)) {
        return drop(system, actor);
    }

    let history = actor.history();
    actor.navigateTo(history.length - 2);
    let message = actor.mailbox[0];
    message.retries = (message.retries || 0) + 1;
    actor.mailbox = [message, ...(actor.mailbox.slice(1))];
    return actor;
};
/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Drops the offending message and rollbacks the provided actor
 * to the last known state.
 *
 * @param system {ActorSystem} Parent ActorSystem
 * @param actor {Actor} Actor that failed
 * @returns {Actor} The expected actor state
 */
let drop = (system, actor) => {
    let history = actor.history();
    actor.navigateTo(history.length - 2);
    actor.mailbox.queue = actor.mailbox.queue.slice(1);
    return actor;
};

export default drop;
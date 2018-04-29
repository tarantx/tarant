/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Sets the actor state to the initial state and retries the mailbox.
 *
 * @param system {ActorSystem} The parent Actor System
 * @param actor {Actor} The offending actor
 * @returns {Actor} The expected actor state
 */
let restart = (system, actor) => {
    let mailbox = actor.mailbox;
    return { mailbox, ...(actor.navigateTo(0)) };
};

export default restart;
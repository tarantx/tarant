/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default (system, actor) => {
    let history = actor.history();
    actor.navigateTo(history.length - 2);
    actor.mailbox = actor.mailbox.slice(1);
    return actor;
};
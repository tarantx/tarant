/**
 * Copyright (c) 2018-present, Code In Brackets
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
export default (system, actor) => {
    let mailbox = actor.mailbox;
    return { mailbox, ...(actor.navigateTo(0)) };
};
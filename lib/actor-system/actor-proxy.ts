/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Mailbox from '../mailbox/mailbox'
import Message from '../mailbox/message'
import { IActor } from './actor'
import ActorMessage from './actor-message'

export default class ActorProxy {
  public static sendAndReturn(
    mailbox: Mailbox<ActorMessage>,
    actorId: string,
    methodName: string,
    args: any[],
  ): Promise<object> {
    return new Promise((resolve, reject) => {
      mailbox.push(Message.of(actorId, ActorMessage.of(methodName, args, resolve, reject)))
    })
  }

  public static of<T extends IActor>(mailbox: Mailbox<ActorMessage>, actor: T): T {
    const props = Object.getOwnPropertyNames(actor.constructor.prototype)

    return props
      .filter(e => e !== 'constructor')
      .map(
        (member): [string, any] => [
          member,
          (...args: any[]): any => ActorProxy.sendAndReturn(mailbox, actor.id, member, args),
        ],
      )
      .reduce((result, [member, method]) => ({ ...result, [member]: method }), { ref: actor, id: actor.id }) as any
  }
}

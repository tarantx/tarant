/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Mailbox from '../mailbox/mailbox'
import Message from '../mailbox/message'
import Actor from './actor'
import ActorMessage from './actor-message'

export default class ActorProxy {
  public static sendAndReturn(
    mailbox: Mailbox<ActorMessage>,
    actorId: string,
    methodName: string,
    args: IArguments,
  ): Promise<object> {
    return new Promise((resolve, reject) => {
      mailbox.push(Message.of(actorId, ActorMessage.of(methodName, (args as unknown) as any[], resolve, reject)))
    })
  }

  public static of<T extends Actor, M>(mailbox: Mailbox<ActorMessage>, actor: T): T {
    const props = Object.getOwnPropertyNames((actor as any).constructor.prototype)

    return (props
      .filter(e => e !== 'constructor')
      .map(
        member =>
          [
            member,
            function() {
              return ActorProxy.sendAndReturn(mailbox, actor.id, member, arguments)
            },
          ] as [string, any],
      )
      .reduce((result, [member, method]) => ({ ...result, [member]: method }), { ref: actor }) as unknown) as T
  }
}

/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Mailbox from '../mailbox/mailbox'
import Message from '../mailbox/message'
import Actor, { IActor } from './actor'
import ActorMessage from './actor-message'

export default class ActorProxy {
  public static sendAndReturn(
    mailbox: Mailbox<ActorMessage>,
    actorId: string,
    methodName: string,
    args: any[],
  ): Promise<object> {
    return new Promise((resolve, reject) =>
      mailbox.push(Message.of(actorId, ActorMessage.of(methodName, args, resolve, reject))),
    )
  }

  public static of<T extends IActor>(mailbox: Mailbox<ActorMessage>, actor: T): T {
    let allNames: string[] = []
    for (let o = actor; o && (o as any) !== Actor.prototype; o = Object.getPrototypeOf(o)) {
      allNames = allNames.concat(
        Object.getOwnPropertyNames(o).filter(a => typeof (o as any)[a] === 'function' && a !== 'constructor'),
      )
    }

    return allNames
      .map(
        (name: string): [string, any] => [
          name,
          (...args: any[]): any => ActorProxy.sendAndReturn(mailbox, actor.id, name, args),
        ],
      )
      .reduce((result, [member, method]) => ({ ...result, [member]: method }), { ref: actor }) as any
  }
}

/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { v4 as uuid } from 'uuid'
import Actor from '../actor-system/actor'
import ActorSystem from '../actor-system/actor-system'

type TopicSeenAs<T> = T & Topic<T>

export default class Topic<T> extends Actor {
  public static for<T>(system: ActorSystem, name: string, consumerClass: new (...args: any[]) => T): TopicSeenAs<T> {
    return system.actorOf(Topic, [name, consumerClass]) as TopicSeenAs<T>
  }

  private readonly subscriptions: Map<string, T>

  public constructor(topicName: string, consumerClass: new (...args: any[]) => T) {
    super('topics/' + topicName)
    this.subscriptions = new Map()

    const props = Object.getOwnPropertyNames(consumerClass.prototype)
    const unsafeThis = this as any
    unsafeThis.constructor = Object.assign(
      { prototype: { subscribe: this.subscribe, unsubscribe: this.unsubscribe } },
      unsafeThis.constructor,
    )

    props
      .filter(k => k !== 'constructor')
      .forEach(k => {
        unsafeThis.constructor.prototype[k] = function() {
          unsafeThis.subscriptions.forEach((actor: any) => {
            ((actor[k] as unknown) as () => void).apply(actor, (arguments as unknown) as [])
          })
        }
      })
  }

  public subscribe(t: T): string {
    const id = uuid()
    this.subscriptions.set(id, t)
    return id
  }

  public unsubscribe(id: string): void {
    this.subscriptions.delete(id)
  }
}

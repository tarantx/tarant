/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../actor-system/actor'
import ActorSystem from '../actor-system/actor-system'
import uuid from '../helper/uuid'

type TopicSeenAs<T> = T & Topic<T>

export default class Topic<T> extends Actor {
  public static for<T>(system: ActorSystem, name: string, consumerClass: new (...args: any[]) => T): TopicSeenAs<T> {
    return system.actorOf(Topic, [name, consumerClass]) as any
  }

  private readonly subscriptions: Map<string, T>

  public constructor(topicName: string, consumerClass: new (...args: any[]) => T) {
    super('topics/' + topicName)
    this.subscriptions = new Map()

    const props = Object.getOwnPropertyNames(consumerClass.prototype)
    this.constructor = Object.assign(
      { prototype: { subscribe: this.subscribe, unsubscribe: this.unsubscribe } },
      this.constructor,
    )

    props
      .filter(k => k !== 'constructor')
      .forEach(k => {
        this.constructor.prototype[k] = (...args: []) => {
          this.subscriptions.forEach((actor: any) => actor[k].apply(actor, args))
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

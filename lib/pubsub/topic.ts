/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../actor-system/actor'
import ActorSystem from '../actor-system/actor-system'
import uuid from '../helper/uuid'

type TopicSeenAs<T> = T & Topic<T> // eslint-disable-line

export default class Topic<T> extends Actor {
  /**
   * Creates a topic for the given actor system. The id of the topic will be `topics/NAME_OF_THE_TOPIC`
   *
   * @param system Actor system where the topic will live
   * @param name Name of the topic to be created
   * @param consumerClass Protocol of the topic
   */
  public static for<T>(system: ActorSystem, name: string, consumerClass: new (...args: any[]) => T): TopicSeenAs<T> {
    return system.actorOf(Topic, [name, consumerClass]) as any
  }

  private readonly subscriptions: Map<string, T>

  public constructor(topicName: string, consumerClass: new (...args: any[]) => T) {
    super('topics/' + topicName)
    this.subscriptions = new Map()

    const props = Object.getOwnPropertyNames(consumerClass.prototype)

    props
      .filter((k) => k !== 'constructor')
      .forEach((k) => {
        (this as any).constructor.prototype[k] = (...args: []) => {
          // tslint:disable-next-line
          this.subscriptions.forEach((actor: any) => actor[k].apply(actor, args)) // eslint-disable-line
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

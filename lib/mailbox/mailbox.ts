/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import uuid from '../helper/uuid'
import Message from './message'
import ISubscriber from './subscriber'
import Subscription from './subscription'

export default class Mailbox<T> {
  public static empty<T> (): Mailbox<T> {
    return new Mailbox()
  }

  private readonly subscribedPartitions: { [subscription: string]: string[] } = {}
  private readonly subscriptions: { [partition: string]: Subscription<T>[] } = {}

  public addSubscriber (subscriber: ISubscriber<T>): string {
    const id = uuid()
    const { partitions } = subscriber

    this.subscribedPartitions[id] = partitions
    partitions.forEach((partition) => {
      this.subscriptions[partition] = this.subscriptions[partition] || []
      this.subscriptions[partition].push(new Subscription(id, subscriber))
    })

    return id
  }

  public removeSubscription (subscription: string): void {
    const partitions = this.subscribedPartitions[subscription]
    partitions.forEach(
      (partition) =>
        (this.subscriptions[partition] = this.subscriptions[partition].filter((s) => s.id !== subscription))
    )

    delete this.subscribedPartitions[subscription]
  }

  public push (message: Message<T>): void {
    this.subscriptions[message.partition].forEach((subscription) => subscription.messages.push(message))
  }

  public async poll (subscription: string): Promise<void> {
    const partitions = this.subscribedPartitions[subscription]
    if (!partitions) {
      return
    }

    partitions.forEach((partition) =>
      this.subscriptions[partition]
        .filter((managedSubscription) => managedSubscription.id === subscription)
        .forEach(async (managedSubscription) => await managedSubscription.process())
    )
  }
}

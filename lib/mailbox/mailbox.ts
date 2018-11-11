import { v4 as uuid } from 'uuid'
import Message from './message'
import ISubscriber from './subscriber'
import Subscription from './subscription'

export default class Mailbox<T> {
  public static empty<T>(): Mailbox<T> {
    return new Mailbox()
  }

  private readonly subscribedPartitions: { [subscription: string]: [string] }
  private readonly subscriptions: { [partition: string]: [Subscription<T>] }

  private constructor() {
    this.subscribedPartitions = {}
    this.subscriptions = {}
  }

  public addSubscriber(subscriber: ISubscriber<T>): string {
    const id = uuid()
    const { partitions } = subscriber

    this.subscribedPartitions[id] = partitions
    partitions.forEach(partition => {
      this.subscriptions[partition] = this.subscriptions[partition] || []
      this.subscriptions[partition].push(new Subscription(id, subscriber))
    })

    return id
  }

  public removeSubscription(subscription: string): void {
    const partitions = this.subscribedPartitions[subscription]
    partitions.forEach(partition => {
      this.subscriptions[partition] = this.subscriptions[partition].filter(s => s.id !== subscription) as [
        Subscription<T>
      ]
    })

    delete this.subscribedPartitions[subscription]
  }

  public push(message: Message<T>): void {
    this.subscriptions[message.partition].forEach(subscription => {
      subscription.messages.push(message)
    })
  }

  public poll(subscription: string): void {
    const partitions = this.subscribedPartitions[subscription]
    if (partitions === undefined) {
      return
    }

    partitions.forEach(partition => {
      this.subscriptions[partition]
        .filter(managedSubscription => managedSubscription.id === subscription)
        .forEach(managedSubscription => managedSubscription.process())
    })
  }
}

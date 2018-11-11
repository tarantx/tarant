import Message from './message'
import ISubscriber from './subscriber'

export default class Subscription<T> {
  public readonly id: string
  public readonly subscriber: ISubscriber<T>
  public readonly messages: [Message<T>]

  public constructor(id: string, subscriber: ISubscriber<T>) {
    this.id = id
    this.subscriber = subscriber
    this.messages = ([] as unknown) as [Message<T>]
  }

  public process(): void {
    const message = this.messages.pop()
    if (message) {
      this.subscriber.onReceiveMessage(message)
    }
  }
}

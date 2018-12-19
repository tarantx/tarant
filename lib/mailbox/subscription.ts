import Message from './message'
import ISubscriber from './subscriber'

export default class Subscription<T> {
  public readonly id: string
  public readonly subscriber: ISubscriber<T>
  public readonly messages: Array<Message<T>>

  public constructor(id: string, subscriber: ISubscriber<T>) {
    this.id = id
    this.subscriber = subscriber
    this.messages = []
  }

  public async process(): Promise<void> {
    const message = this.messages[0]
    if (message) {
      if (await this.subscriber.onReceiveMessage(message)) {
        this.messages.pop()
      }
    }
  }
}

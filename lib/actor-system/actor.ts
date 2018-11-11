import Message from '../mailbox/message'
import ISubscriber from '../mailbox/subscriber'
import ActorMessage from './actor-message'

export default abstract class Actor implements ISubscriber<ActorMessage> {
  public readonly id: string
  public readonly partitions: [string]

  protected constructor(id: string) {
    this.id = id
    this.partitions = [id]
  }

  public onReceiveMessage(message: Message<ActorMessage>): boolean {
    const actorMessage = message.content
    try {
      const r: any = (this as any)[actorMessage.methodName](...actorMessage.arguments)
      if (r.then && r.catch) {
        r.then(actorMessage.resolve).catch(actorMessage.reject)
      } else {
        actorMessage.resolve(r)
      }
    } catch (e) {
      actorMessage.reject(e)
    }

    return true
  }
}

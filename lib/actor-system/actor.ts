import Message from '../mailbox/message'
import ISubscriber from '../mailbox/subscriber'
import ActorMessage from './actor-message'
import ActorSystem from './actor-system'

export default abstract class Actor implements ISubscriber<ActorMessage> {
  public readonly id: string
  public readonly partitions: [string]
  public readonly self: this
  public readonly system: ActorSystem
  private busy: boolean

  protected constructor(id: string) {
    this.id = id
    this.partitions = [id]
    this.busy = false
    this.self = this
    this.system = (null as unknown) as ActorSystem
  }

  public onReceiveMessage(message: Message<ActorMessage>): boolean {
    if (this.busy) {
      return false
    }

    const setBusy = () => {
      this.busy = true
    }

    const freeAgain = () => {
      this.busy = false
    }

    const actorMessage = message.content

    try {
      setBusy()

      const r: any = (this as any)[actorMessage.methodName](...actorMessage.arguments)

      if (r && r.then && r.catch) {
        r.then(actorMessage.resolve)
          .catch(actorMessage.reject)
          .finally(freeAgain)
      } else {
        actorMessage.resolve(r)
        freeAgain()
      }
    } catch (e) {
      actorMessage.reject(e)
      freeAgain()
    }

    return true
  }
}

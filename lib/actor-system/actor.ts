import Message from '../mailbox/message'
import ISubscriber from '../mailbox/subscriber'
import ActorMessage from './actor-message'
import ActorSystem from './actor-system'
import IMaterializer from './materializer/materializer'

import { v4 as uuid } from 'uuid'

export default abstract class Actor implements ISubscriber<ActorMessage> {
  public readonly id: string
  public readonly partitions: [string]
  protected readonly self: this
  protected readonly system: ActorSystem
  private readonly materializer: IMaterializer
  private busy: boolean

  protected constructor(id?: string) {
    this.id = id || uuid()
    this.partitions = [this.id]
    this.busy = false
    this.self = this
    this.system = (null as unknown) as ActorSystem
    this.materializer = (null as unknown) as IMaterializer
  }

  public onReceiveMessage(message: Message<ActorMessage>): boolean {
    if (this.busy) {
      return false
    }

    const setBusy = () => {
      this.busy = true
    }

    const freeAgain = () => {
      this.materializer.onAfterMessage(this, actorMessage)
      this.busy = false
    }

    const actorMessage = message.content

    try {
      setBusy()
      this.materializer.onBeforeMessage(this, actorMessage)

      const r: any = (this as any)[actorMessage.methodName](...actorMessage.arguments)

      if (r && r.then && r.catch) {
        r.then(actorMessage.resolve)
          .catch((e: any) => {
            this.materializer.onError(this, actorMessage, e)
            actorMessage.reject(e)
          })
          .finally(freeAgain)
      } else {
        actorMessage.resolve(r)
        freeAgain()
      }
    } catch (e) {
      this.materializer.onError(this, actorMessage, e)
      actorMessage.reject(e)
      freeAgain()
    }

    return true
  }
}

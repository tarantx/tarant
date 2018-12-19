import Message from '../mailbox/message'
import ISubscriber from '../mailbox/subscriber'
import ActorMessage from './actor-message'
import ActorSystem from './actor-system'
import IMaterializer from './materializer/materializer'

import { v4 as uuid } from 'uuid'
import IActorSupervisor, { SupervisionResponse } from './supervision/actor-supervisor'

export default abstract class Actor implements ISubscriber<ActorMessage>, IActorSupervisor {
  public readonly id: string
  public readonly partitions: [string]
  protected readonly self: this
  protected readonly system: ActorSystem
  private readonly materializer: IMaterializer
  private readonly supervisor: IActorSupervisor
  private busy: boolean

  protected constructor(id?: string) {
    this.id = id || uuid()
    this.partitions = [this.id]
    this.busy = false
    this.self = this
    this.system = (null as unknown) as ActorSystem
    this.materializer = (null as unknown) as IMaterializer
    this.supervisor = (null as unknown) as IActorSupervisor
  }

  public async onReceiveMessage(message: Message<ActorMessage>): Promise<boolean> {
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
            this.supervisor.supervise(this.self, e, actorMessage)
            actorMessage.reject(e)
          })
          .finally(freeAgain)
      } else {
        actorMessage.resolve(r)
        freeAgain()
      }
    } catch (e) {
      this.materializer.onError(this, actorMessage, e)
      this.supervisor.supervise(this.self, e, actorMessage)
      actorMessage.reject(e)
      freeAgain()
    }

    return true
  }

  public supervise(actor: Actor, exception: any, message: any): SupervisionResponse {
    return this.supervisor.supervise(actor, exception, message)
  }

  protected actorOf<T extends Actor>(classFn: new (...args: any[]) => T, values: any[]): T {
    const actor = this.system.actorOf(classFn, values)
    const unsafeActor = actor as any
    unsafeActor.ref.supervisor = this

    return actor
  }
}

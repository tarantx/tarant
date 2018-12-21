/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Message from '../mailbox/message'
import ISubscriber from '../mailbox/subscriber'
import ActorMessage from './actor-message'
import ActorSystem from './actor-system'
import IMaterializer from './materializer/materializer'

import { v4 as uuid } from 'uuid'
import IActorSupervisor, { SupervisionResponse } from './supervision/actor-supervisor'

type Cancellable = string

export default abstract class Actor implements ISubscriber<ActorMessage>, IActorSupervisor {
  public readonly id: string
  public readonly partitions: string[]
  protected readonly self: this = this
  protected readonly system?: ActorSystem
  private readonly materializer?: IMaterializer
  private readonly supervisor?: IActorSupervisor
  private readonly scheduled: Map<Cancellable, NodeJS.Timer> = new Map()
  private busy: boolean = false

  protected constructor(id?: string) {
    this.id = id || uuid()
    this.partitions = [this.id]
  }

  public async onReceiveMessage(message: Message<ActorMessage>): Promise<boolean> {
    if (this.busy) {
      return false
    }

    this.busy = true

    const actorMessage = message.content
    try {
      this.materializer!.onBeforeMessage(this, actorMessage)
      const result = await this.dispatchAndPromisify(actorMessage)

      actorMessage.resolve(result)
    } catch (ex) {
      this.materializer!.onError(this, actorMessage, ex)
      const strategy = await this.supervisor!.supervise(this.self, ex, actorMessage)

      if (strategy === 'drop-message') {
        actorMessage.reject(ex)
        return true
      } else if (strategy === 'retry-message') {
        return false
      } else {
        actorMessage.reject(ex)
        return true
      }
    } finally {
      this.busy = false
      this.materializer!.onAfterMessage(this, actorMessage)
    }

    return true
  }

  public supervise(actor: Actor, exception: any, message: any): SupervisionResponse {
    return this.supervisor!.supervise(actor, exception, message)
  }

  protected schedule(interval: number, fn: (...args: any[]) => void, values: any[]): Cancellable {
    const id = uuid()
    this.scheduled.set(id, setInterval(() => fn.apply(this, values), interval))
    return id
  }

  protected scheduleOnce(timeout: number, fn: (...args: any[]) => void, values: any[]): Cancellable {
    const id = uuid()
    this.scheduled.set(id, setTimeout(() => {
      fn.apply(this, values)
      this.scheduled.delete(id)
    }, timeout))

    return id
  }

  protected cancel(cancellable: Cancellable): void {
    const id = this.scheduled.get(cancellable) as NodeJS.Timer
    clearTimeout(id)
    clearInterval(id)

    this.scheduled.delete(cancellable)
  }

  protected actorOf<T extends Actor>(classFn: new (...args: any[]) => T, values: any[]): T {
    const actor = this.system!.actorOf(classFn, values) as any
    actor.ref.supervisor = this
    return actor
  }

  private dispatchAndPromisify(actorMessage: ActorMessage): Promise<any> {
    try {
      const r: any = this.constructor.prototype[actorMessage.methodName].apply(this, actorMessage.arguments)
      if (r && r.then && r.catch) {
        return r
      } else {
        return Promise.resolve(r)
      }
    } catch (ex) {
      return Promise.reject(ex)
    }
  }
}

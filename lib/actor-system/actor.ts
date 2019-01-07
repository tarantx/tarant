/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Message from '../mailbox/message'
import ISubscriber from '../mailbox/subscriber'
import IMaterializer from '../materializer/materializer'
import ActorMessage from './actor-message'
import ActorSystem from './actor-system'

import { Topic } from '..'
import uuid from '../helper/uuid'
import ActorProxy from './actor-proxy'
import IActorSupervisor, { SupervisionStrategies } from './supervision/actor-supervisor'

type Cancellable = string
export interface IActor extends ISubscriber<ActorMessage>, IActorSupervisor {
  ref: this
  id: string
}
/**
 * Class that must be extended by all actors. All defined public methods in actors should be
 * asynchronous (return a Promise<T>) or return void.
 */
export default abstract class Actor implements IActor {
  public readonly id: string
  public readonly partitionSet: Set<string> = new Set()
  public readonly ref: this = this
  public partitions: string[]
  protected readonly self: this = this
  protected readonly system?: ActorSystem
  private readonly materializers: IMaterializer[] = []
  private readonly supervisor?: IActorSupervisor
  private readonly scheduled: Map<Cancellable, NodeJS.Timer> = new Map()
  private readonly topicSubscriptions: Map<string, string> = new Map()
  private busy: boolean = false
  private shouldRefreshMailboxOnce: boolean = false

  protected constructor(id?: string) {
    this.id = id || uuid()
    this.partitionSet.add(this.id)
    this.partitions = Array.from(this.partitionSet.values())
  }

  /**
   * Method called by the mailbox when there are messages to be processed. This should
   * not be overriden by the actor.
   *
   * @param message Message received from the mailbox
   */
  public async onReceiveMessage(message: Message<ActorMessage>): Promise<boolean> {
    if (this.busy) {
      return false
    }

    this.busy = true

    const actorMessage = message.content
    try {
      this.materializers.forEach(materializer => materializer.onBeforeMessage(this, actorMessage))
      const result = await this.dispatchAndPromisify(actorMessage)

      actorMessage.resolve(result)
    } catch (ex) {
      this.materializers.forEach(materializer => materializer.onError(this, actorMessage, ex))
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
      this.materializers.forEach(materializer => materializer.onAfterMessage(this, actorMessage))
    }

    return true
  }

  /**
   * Supervision method, called when a child actor failed.
   * The default strategy is to delegate the supervision to this actor supervisor.
   *
   * @param actor Actor that raised the exception
   * @param exception Exception that raised the actor
   * @param message Message that we failed to process
   */
  public supervise(actor: Actor, exception: any, message: any): SupervisionStrategies {
    return this.supervisor!.supervise(actor, exception, message)
  }

  /**
   * Schedules a message to this actor every {interval} milliseconds. Returns a cancellable, that
   * can be passed to #cancel to stop the scheduled message.
   *
   * @param interval Interval, in ms, between messages
   * @param fn Message to send to this current actor, in form of a method reference (like this.myMethod)
   * @param values Parameters to pass with the message (parameters of the method to call)
   *
   * @see Actor#cancel
   */
  protected schedule(interval: number, fn: (...args: any[]) => void, values: any[]): Cancellable {
    const id = uuid()
    setTimeout(() => {
      const sysAny = this.system as any
      this.scheduled.set(
        id,
        setInterval(() => ActorProxy.sendAndReturn(sysAny.mailbox, this.id, fn.name, values), interval),
      )
    }, 0)
    return id
  }

  /**
   * Schedules a message to this actor once, after {timeout} milliseconds. Returns a cancellable, that
   * can be passed to #cancel to stop the scheduled message.
   *
   * @param timeout Time to send the message, in ms
   * @param fn Message to send to this current actor, in form of a method reference (like this.myMethod)
   * @param values Parameters to pass with the message (parameters of the method to call)
   *
   * @see Actor#cancel
   */
  protected scheduleOnce(timeout: number, fn: (...args: any[]) => void, values: any[]): Cancellable {
    const id = uuid()
    setTimeout(() => {
      const sysAny = this.system as any
      this.scheduled.set(
        id,
        setTimeout(() => {
          ActorProxy.sendAndReturn(sysAny.mailbox, this.id, fn.name, values)
          this.scheduled.delete(id)
        }, timeout),
      )
    }, 0)
    return id
  }

  /**
   * Cancels a scheduled action created by #schedule or #scheduleOnce
   *
   * @param cancellable Cancellable reference
   * @see Actor#schedule
   * @see Actor#scheduleOnce
   */
  protected cancel(cancellable: Cancellable): void {
    setTimeout(() => {
      const id = this.scheduled.get(cancellable) as NodeJS.Timer
      clearTimeout(id)
      clearInterval(id)

      this.scheduled.delete(cancellable)
    }, 0)
  }

  /**
   * Creates a child actor of this actor. The current actor will behave as the supervisor
   * of the created actor.
   *
   * @param classFn Constructor of the actor to build
   * @param values Values to pass as the constructor parameters
   */
  protected actorOf<T extends IActor>(classFn: new (...args: any[]) => T, values: any[]): T {
    const actor = this.system!.actorOf(classFn, values) as any
    actor.ref.supervisor = this
    return actor
  }

  protected subscribeToTopic(topic: Topic<Actor>): void {
    setTimeout(async () => {
      const topicSubscription = await topic.subscribe(this)
      this.topicSubscriptions.set(topic.id, topicSubscription)
    }, 0)
  }

  protected unsubscribeFromTopic(topic: Topic<Actor>): void {
    const id = this.topicSubscriptions.get(topic.id)
    if (id === undefined) {
      return
    }

    topic.unsubscribe(id)
    this.topicSubscriptions.delete(topic.id)
  }

  protected refreshMailbox() {
    if (this.system === undefined) {
      this.shouldRefreshMailboxOnce = true
    } else {
      this.partitions = Array.from(this.partitionSet.values())
      this.system!.resetSubscriptionsFor(this)
    }
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

  private initialized(): void {
    if (this.shouldRefreshMailboxOnce) {
      this.shouldRefreshMailboxOnce = false
      this.refreshMailbox()
    }
    this.materializers.forEach(materializer => materializer.onInitialize(this))
  }
}

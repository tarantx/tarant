/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Fiber from '../fiber/fiber'
import IProcessor from '../fiber/processor'
import Mailbox from '../mailbox/mailbox'
import IMaterializer from '../materializer/materializer'
import IResolver from '../resolver/resolver'
import Actor, { IActor } from './actor'
import ActorMessage from './actor-message'
import ActorProxy from './actor-proxy'
import IActorSystemConfiguration from './configuration/actor-system-configuration'
import ActorSystemConfigurationBuilder from './configuration/actor-system-configuration-builder'
import FunctionActor from './function'
import IActorSupervisor from './supervision/actor-supervisor'

export default class ActorSystem implements IProcessor {
  public static for(configuration: IActorSystemConfiguration): ActorSystem {
    return new ActorSystem(configuration)
  }

  public static default(): ActorSystem {
    return new ActorSystem(ActorSystemConfigurationBuilder.define().done())
  }

  public readonly requirements: string[] = ['default']
  private readonly actors: Map<string, IActor> = new Map()
  private readonly subscriptions: Map<string, string> = new Map()
  private readonly mailbox: Mailbox<ActorMessage>
  private readonly fiber: Fiber
  private readonly materializers: IMaterializer[]
  private readonly resolvers: IResolver[]
  private readonly supervisor: IActorSupervisor

  private constructor(configuration: IActorSystemConfiguration) {
    const { mailbox, resources, tickInterval, materializers, resolvers: resolvers, supervisor } = configuration
    this.mailbox = mailbox
    this.materializers = materializers
    this.resolvers = resolvers
    this.supervisor = supervisor
    this.fiber = Fiber.with({ resources, tickInterval })
    this.fiber.acquire(this)
  }

  public async process(): Promise<void> {
    this.actors.forEach(async v => {
      await this.mailbox.poll(this.subscriptions.get(v.id) as string)
    })
  }

  /**
   * Stops the actor system and frees all actors
   */
  public free(): void {
    setTimeout(() => this.fiber.free(), 0)
  }

  /**
   * Creates a new root actor.
   *
   * @param classFn Constructor of the actor to create
   * @param values Parameters to pass to the constructor
   */
  public actorOf<T extends IActor>(classFn: new (...args: any[]) => T, values: any[]): T {
    const instance = new classFn(...values)
    const proxy = ActorProxy.of(this.mailbox, instance)
    const subscription = this.mailbox.addSubscriber(instance)

    this.actors.set(instance.id, instance)
    this.subscriptions.set(instance.id, subscription)

    this.setupInstance(instance, proxy)
    return proxy
  }

  /**
   * Looks for an existing actor in this actor system. If none exist,
   * it will try to resolve the actor, by id, with the provided resolvers.
   *
   * @param id Id of the actor to find
   */
  public async actorFor<T extends IActor>(id: string): Promise<T> {
    let instance: T = this.actors.get(id) as T
    if (instance === undefined) {
      for (const resolver of this.resolvers) {
        try {
          instance = (await resolver.resolveActorById(id)) as T
          break
        } catch (_) {
          //
        }
      }
      if (instance === undefined) {
        return Promise.reject(`unable to resolve actor ${id}`)
      }

      this.actors.set(id, instance)
      this.subscriptions.set(instance.id, this.mailbox.addSubscriber(instance))

      const proxy = ActorProxy.of(this.mailbox, instance)
      this.setupInstance(instance, proxy)

      return proxy
    }

    return ActorProxy.of(this.mailbox, instance as T)
  }

  /**
   * Converts a function to a function actor, with the same signature. Function actors behave the same way as
   * actors, but can be called as ordinary functions.
   *
   * Like actors, there is a limitation on the signature of the function. It can receive any number and type
   * of parameters, but it *must* return a Promise.
   *
   * @param fn Function to be wrapped in an actor
   */
  public functionFor<T>(fn: T): T {
    return (FunctionActor.for(this, fn) as unknown) as T
  }

  /**
   * Tries to find an actor, if it doesn't exist, creates a new one.
   *
   * @param id Id of the actor to find
   * @param elseClass Constructor of the actor to create, if doesn't exist
   * @param values Parameters of the constructor
   */
  public async resolveOrNew<T extends IActor>(
    id: string,
    elseClass: new (...args: any[]) => T,
    values: any[],
  ): Promise<T> {
    try {
      return await this.actorFor(id)
    } catch (_) {
      return this.actorOf(elseClass, values)
    }
  }

  private setupInstance(instance: any, proxy: any): void {
    instance.self = proxy
    instance.system = this
    instance.materializers = this.materializers
    instance.supervisor = this.supervisor
    instance.initialized()
  }
}

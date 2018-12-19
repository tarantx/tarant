import Fiber from '../fiber/fiber'
import IProcessor from '../fiber/processor'
import Mailbox from '../mailbox/mailbox'
import Actor from './actor'
import ActorMessage from './actor-message'
import ActorProxy from './actor-proxy'
import IActorSystemConfiguration from './configuration/actor-system-configuration'
import ActorSystemConfigurationBuilder from './configuration/actor-system-configuration-builder'
import IMaterializer from './materializer/materializer'
import IResolver from './resolver/resolver'
import IActorSupervisor from './supervision/actor-supervisor'

export default class ActorSystem implements IProcessor {
  public static for(configuration: IActorSystemConfiguration): ActorSystem {
    return new ActorSystem(configuration)
  }

  public static default(): ActorSystem {
    return new ActorSystem(ActorSystemConfigurationBuilder.define().done())
  }

  public readonly requirements: [string] = ['default']
  private readonly mailbox: Mailbox<ActorMessage>
  private readonly fiber: Fiber
  private readonly actors: Map<string, Actor>
  private readonly subscriptions: Map<string, string>
  private readonly materializer: IMaterializer
  private readonly resolver: IResolver
  private readonly supervisor: IActorSupervisor

  private constructor(configuration: IActorSystemConfiguration) {
    this.mailbox = configuration.mailbox
    this.fiber = Fiber.with({ resources: configuration.resources, tickInterval: configuration.tickInterval })
    this.fiber.acquire(this)
    this.actors = new Map()
    this.subscriptions = new Map()
    this.materializer = configuration.materializer
    this.resolver = configuration.resolver
    this.supervisor = configuration.supervisor
  }

  public async process(): Promise<void> {
    this.actors.forEach(async v => {
      await this.mailbox.poll(this.subscriptions.get(v.id) as string)
    })
  }

  public free(): void {
    this.fiber.free()
  }

  public actorOf<T extends Actor>(classFn: new (...args: any[]) => T, values: any[]): T {
    const instance = new classFn(...values)
    const proxy = ActorProxy.of(this.mailbox, instance)
    const subscription = this.mailbox.addSubscriber(instance)

    this.actors.set(instance.id, instance)
    this.subscriptions.set(instance.id, subscription)

    this.setupInstance(instance, proxy)
    return proxy
  }

  public async actorFor<T extends Actor>(id: string): Promise<T | undefined> {
    const instance = this.actors.get(id)
    if (instance === undefined) {
      const resolvedActor = await this.resolver.resolveActorById(id)
      if (resolvedActor === undefined) {
        return undefined
      }

      this.actors.set(id, resolvedActor)
      return ActorProxy.of(this.mailbox, resolvedActor as T)
    }

    return ActorProxy.of(this.mailbox, instance as T)
  }

  private setupInstance(instance: any, proxy: any): void {
    instance.self = proxy
    instance.system = this
    instance.materializer = this.materializer
    instance.supervisor = this.supervisor
    this.materializer.onInitialize(instance)
  }
}

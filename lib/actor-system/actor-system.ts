import Fiber from '../fiber/fiber'
import IProcessor from '../fiber/processor'
import Mailbox from '../mailbox/mailbox'
import Actor from './actor'
import ActorMessage from './actor-message'
import ActorProxy from './actor-proxy'
import IMaterializer from './materializer/materializer'
import IResolver from './resolver/resolver'

export default class ActorSystem implements IProcessor {
  public static default(materializer: IMaterializer, resolver: IResolver): ActorSystem {
    return new ActorSystem(materializer, resolver)
  }

  public readonly requirements: [string] = ['default']
  private readonly mailbox: Mailbox<ActorMessage>
  private readonly fiber: Fiber
  private readonly actors: Map<string, Actor>
  private readonly subscriptions: Map<string, string>
  private readonly materializer: IMaterializer
  private readonly resolver: IResolver

  private constructor(materializer: IMaterializer, resolver: IResolver) {
    this.mailbox = Mailbox.empty()
    this.fiber = Fiber.with({ resources: ['default'], tickInterval: 1 })
    this.fiber.acquire(this)
    this.actors = new Map()
    this.subscriptions = new Map()
    this.materializer = materializer
    this.resolver = resolver
  }

  public process(): void {
    this.actors.forEach(v => {
      this.mailbox.poll(this.subscriptions.get(v.id) as string)
    })
  }

  public free(): void {
    this.fiber.free()
  }

  public new<T extends Actor>(classFn: new (...args: any[]) => T, values: any[]): T {
    const instance = new classFn(...values)
    const proxy = ActorProxy.of(this.mailbox, instance)
    const subscription = this.mailbox.addSubscriber(instance)

    this.actors.set(instance.id, instance)
    this.subscriptions.set(instance.id, subscription)

    this.setupInstance(instance, proxy)
    return proxy
  }

  public async find<T extends Actor>(id: string): Promise<T | undefined> {
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
    this.materializer.onInitialize(instance)
  }
}

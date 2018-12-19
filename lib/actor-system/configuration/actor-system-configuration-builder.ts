import ActorMessage from '../actor-message'
import ActorSystemConfiguration from './actor-system-configuration'

import IMaterializer from '../materializer/materializer'
import IResolver from '../resolver/resolver'

import Mailbox from '../../mailbox/mailbox'
import NoopMaterializer from '../materializer/noop-materializer'
import NoopResolver from '../resolver/noop-resolver'
import IActorSupervisor from '../supervision/actor-supervisor'
import NoopActorSupervisor from '../supervision/noop-supervisor'

export default class ActorSystemConfigurationBuilder {
  public static define(): ActorSystemConfigurationBuilder {
    return new ActorSystemConfigurationBuilder()
  }

  public materializer: IMaterializer
  public resolver: IResolver
  public resources: [string]
  public tickInterval: number
  public mailbox: Mailbox<ActorMessage>
  public supervisor: IActorSupervisor

  private constructor() {
    this.materializer = new NoopMaterializer()
    this.resolver = new NoopResolver()
    this.resources = ['default']
    this.tickInterval = 1
    this.mailbox = Mailbox.empty()
    this.supervisor = new NoopActorSupervisor()
  }

  public withMaterializer(materializer: IMaterializer): ActorSystemConfigurationBuilder {
    this.materializer = materializer
    return this
  }

  public withResolver(resolver: IResolver): ActorSystemConfigurationBuilder {
    this.resolver = resolver
    return this
  }

  public withResources(resources: [string]): ActorSystemConfigurationBuilder {
    this.resources = resources
    return this
  }

  public withTickInterval(tickInterval: number): ActorSystemConfigurationBuilder {
    this.tickInterval = tickInterval
    return this
  }

  public withMailbox(mailbox: Mailbox<ActorMessage>): ActorSystemConfigurationBuilder {
    this.mailbox = mailbox
    return this
  }

  public withTopSupervisor(supervisor: IActorSupervisor): ActorSystemConfigurationBuilder {
    this.supervisor = supervisor
    return this
  }

  public done(): ActorSystemConfiguration {
    return this as ActorSystemConfiguration
  }
}

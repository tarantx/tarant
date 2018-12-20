/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Mailbox from '../../mailbox/mailbox'
import ActorMessage from '../actor-message'
import IMaterializer from '../materializer/materializer'
import NoopMaterializer from '../materializer/noop-materializer'
import NoopResolver from '../resolver/noop-resolver'
import IResolver from '../resolver/resolver'
import IActorSupervisor from '../supervision/actor-supervisor'
import NoopActorSupervisor from '../supervision/noop-supervisor'
import ActorSystemConfiguration from './actor-system-configuration'

export default class ActorSystemConfigurationBuilder {
  public static define(): ActorSystemConfigurationBuilder {
    return new ActorSystemConfigurationBuilder()
  }

  public materializer: IMaterializer = new NoopMaterializer()
  public resolver: IResolver = new NoopResolver()
  public resources: [string] = ['default']
  public tickInterval: number = 1
  public mailbox: Mailbox<ActorMessage> = Mailbox.empty()
  public supervisor: IActorSupervisor = new NoopActorSupervisor()

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

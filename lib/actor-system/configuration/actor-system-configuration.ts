import Mailbox from '../../mailbox/mailbox'
import ActorMessage from '../actor-message'
import IMaterializer from '../materializer/materializer'
import IResolver from '../resolver/resolver'
import ActorSystemConfigurationBuilder from './actor-system-configuration-builder'

type Readonly<T> = { readonly [P in keyof T]: T[P] }

export default interface IActorSystemConfiguration extends Readonly<ActorSystemConfigurationBuilder> {}

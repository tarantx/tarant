import ActorSystemConfigurationBuilder from './actor-system-configuration-builder'

type Readonly<T> = { readonly [P in keyof T]: T[P] }

export default interface IActorSystemConfiguration extends Readonly<ActorSystemConfigurationBuilder> {}

/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import ActorSystemConfigurationBuilder from './actor-system-configuration-builder'

type Readonly<T> = { readonly [P in keyof T]: T[P] }

export default interface IActorSystemConfiguration extends Readonly<ActorSystemConfigurationBuilder> {}

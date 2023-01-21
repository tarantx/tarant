/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../actor'
import ActorMessage from '../actor-message'

export default interface IMaterializer {
  onInitialize(actor: Actor): void
  onBeforeMessage(actor: Actor, message: ActorMessage): void
  onAfterMessage(actor: Actor, message: ActorMessage): void
  onError(actor: Actor, message: ActorMessage, error: any): void
  onBeforeRelease(actor: Actor): void
  onAfterRelease(actor: Actor): void
}

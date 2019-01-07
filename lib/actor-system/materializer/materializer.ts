/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import IActor from '../actor'
import ActorMessage from '../actor-message'
import { IEvent, IEventSourced } from '../event-sourcing/event-sourced'

export default interface IMaterializer {
  onInitialize(actor: IActor): void
  onBeforeMessage(actor: IActor, message: ActorMessage): void
  onAfterMessage(actor: IActor, message: ActorMessage): void
  onAppliedEvent(sourced: IEventSourced, event: IEvent): void
  onError(actor: IActor, message: ActorMessage, error: any): void
}

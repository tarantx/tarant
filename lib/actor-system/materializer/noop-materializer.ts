/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../actor'
import ActorMessage from '../actor-message'
import IMaterializer from './materializer'

export default class NoopMaterializer implements IMaterializer {
  public onInitialize(actor: Actor): void {
    //
  }

  public onBeforeMessage(actor: Actor, message: ActorMessage): void {
    //
  }

  public onAfterMessage(actor: Actor, message: ActorMessage): void {
    //
  }

  public onError(actor: Actor, message: ActorMessage, error: any): void {
    //
  }
}

/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventSourcedActor } from '../../../lib/event-sourcing/event-sourced-actor'

export default class PublisherActor extends EventSourcedActor {
  constructor() {
    super()
  }

  public somethingHappens(): void {
    this.apply(this.somethingHappened, [], 'somethingHappened')
  }

  public somethingHappened(): void {
    return
  }
}

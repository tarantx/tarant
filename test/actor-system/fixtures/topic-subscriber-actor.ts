/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Actor from '../../../lib/actor-system/actor'

export default class TopicSubscriberActor extends Actor {
  private readonly callback: any

  public constructor(callback: any) {
    super()

    this.callback = callback
  }

  public doSomething(withString: string): void {
    this.callback(withString)
  }
}

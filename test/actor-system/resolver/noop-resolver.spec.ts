/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import NoopResolver from '../../../lib/actor-system/resolver/noop-resolver'
import * as faker from 'faker'

describe('NoopResolver', () => {
  const resolver = new NoopResolver()

  it('should return a promise that resolves to undefined', async () => {
    let result = resolver.resolveActorById(faker.random.uuid())
    const resultValue = await result
    expect(result).toBeInstanceOf(Promise)
    expect(resultValue).toBeUndefined()
  })
})

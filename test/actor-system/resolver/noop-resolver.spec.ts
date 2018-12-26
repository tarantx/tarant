/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as faker from 'faker'
import NoopResolver from '../../../lib/actor-system/resolver/noop-resolver'

describe('NoopResolver', () => {
  const resolver = new NoopResolver()

  it('should return a promise that resolves to undefined', async () => {
    const result = resolver.resolveActorById(faker.random.uuid())
    const resultValue = await result
    expect(result).toBeInstanceOf(Promise)
    expect(resultValue).toBeUndefined()
  })
})

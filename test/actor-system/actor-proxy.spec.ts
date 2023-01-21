/**
 * Copyright (c) 2018-present, tarant
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const mailboxMock = {
  push: jest.fn(),
}
const messageMock = {
  of: jest.fn(),
}
const actorMessageMock = {
  of: jest.fn(),
}

jest.mock('../../lib/mailbox/mailbox', () => ({
  __esModule: true,
  default: jest.fn(() => mailboxMock),
}))
jest.mock('../../lib/mailbox/message', () => ({ __esModule: true, default: messageMock }))
jest.mock('../../lib/actor-system/actor-message', () => ({ __esModule: true, default: actorMessageMock }))

import { faker } from '@faker-js/faker'
import { Actor } from '../../lib'
import ActorMessage from '../../lib/actor-system/actor-message'
import ActorProxy from '../../lib/actor-system/actor-proxy'
import Mailbox from '../../lib/mailbox/mailbox'
import Message from '../../lib/mailbox/message'

class SomeActor extends Actor {
  constructor() {
    super()
  }
  public aFunction() {
    //
  }
  public yetAnotherFunction() {
    //
  }
}

// tslint:disable-next-line:max-classes-per-file
class AnotherActor extends SomeActor {
  constructor() {
    super()
  }
  public anotherFunction() {
    //
  }
}

describe('actor proxy', () => {
  beforeEach(() => {
    mailboxMock.push.mockReset()
    messageMock.of.mockReset()
    actorMessageMock.of.mockReset()
  })

  describe('send and return', () => {
    it('should return a promise that pass and push the message to the mailbox', async () => {
      const mailbox = new Mailbox<ActorMessage>()
      const actorId = faker.datatype.uuid()
      const methodName = faker.datatype.uuid()
      const resultActorMessage = faker.datatype.uuid()
      const resultMessage = faker.datatype.uuid()
      const expectedResult = faker.datatype.uuid()
      const args = [faker.datatype.uuid(), faker.datatype.uuid()]
      const actor = { id: actorId }

      actorMessageMock.of.mockImplementation((_, __, resolve, ___) => {
        resolve(expectedResult)
        return resultActorMessage
      })
      messageMock.of.mockReturnValue(resultMessage)

      const result = await ActorProxy.sendAndReturn(mailbox, actor, methodName, args)

      expect(actorMessageMock.of).toBeCalledWith(methodName, args, expect.any(Function), expect.any(Function))
      expect(messageMock.of).toBeCalledWith(actorId, resultActorMessage)
      expect(mailboxMock.push).toBeCalledWith(resultMessage)
      expect(result).toEqual(expectedResult)
    })

    it('should return a promise that fails and push the message to the mailbox if fails', async () => {
      const mailbox = new Mailbox<ActorMessage>()
      const actorId = faker.datatype.uuid()
      const methodName = faker.datatype.uuid()
      const resultMessage = faker.datatype.uuid()
      const expectedResult = faker.datatype.uuid()
      const args = [faker.datatype.uuid(), faker.datatype.uuid()]
      const actor = { id: actorId }

      actorMessageMock.of.mockImplementation((_, __, ___, reject) => {
        reject(expectedResult)
      })
      messageMock.of.mockReturnValue(resultMessage)

      try {
        await ActorProxy.sendAndReturn(mailbox, actor, methodName, args)
        fail()
      } catch (_) {
        //
      }
    })
  })

  it('should proxy request to multiple levels of abstraction', () => {
    const mailbox = new Mailbox<ActorMessage>()
    const actor = new AnotherActor()
    const result: any = ActorProxy.of(mailbox, actor)
    expect(result.ref).toEqual(actor)
    expect(result.anotherFunction).toBeDefined()
    expect(result.aFunction).toBeDefined()
    expect(result.yetAnotherFunction).toBeDefined()
    expect(result.self).toBeUndefined()
  })
})

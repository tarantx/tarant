/**
 * Copyright (c) 2018-present, wind-js
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

type AnswerFunction = (r: any) => void

export default class ActorMessage {
  public static of(method: string, args: any[], resolve: AnswerFunction, reject: AnswerFunction): ActorMessage {
    return new ActorMessage(method, args, resolve, reject)
  }

  public readonly methodName: string
  public readonly arguments: any[]
  public readonly resolve: AnswerFunction
  public readonly reject: AnswerFunction

  private constructor(methodName: string, args: any[], resolve: AnswerFunction, reject: AnswerFunction) {
    this.methodName = methodName
    this.arguments = args
    this.resolve = resolve
    this.reject = reject
  }
}

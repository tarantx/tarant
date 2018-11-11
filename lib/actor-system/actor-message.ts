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

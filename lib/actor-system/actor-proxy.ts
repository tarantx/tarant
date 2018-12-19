import Mailbox from '../mailbox/mailbox'
import Message from '../mailbox/message'
import Actor from './actor'
import ActorMessage from './actor-message'

function sendAndReturn(
  mailbox: Mailbox<ActorMessage>,
  actorId: string,
  methodName: string,
  args: IArguments,
): Promise<object> {
  return new Promise((resolve, reject) => {
    mailbox.push(Message.of(actorId, ActorMessage.of(methodName, (args as unknown) as any[], resolve, reject)))
  })
}

export default class ActorProxy {
  public static of<T extends Actor, M>(mailbox: Mailbox<ActorMessage>, actor: T): T {
    const props = Object.getOwnPropertyNames((actor as any).constructor.prototype)

    return (props
      .filter(e => e !== 'constructor')
      .map(
        member =>
          [
            member,
            function() {
              return sendAndReturn(mailbox, actor.id, member, arguments)
            },
          ] as [string, any],
      )
      .reduce((result, [member, method]) => ({ ...result, [member]: method }), { ref: actor }) as unknown) as T
  }
}

import { Actor } from '../..'

export default interface IActorSupervisor {
  supervise(actor: Actor, exception: any): void
}

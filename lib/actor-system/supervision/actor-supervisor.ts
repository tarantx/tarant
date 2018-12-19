import { Actor } from '../..'
import ActorMessage from '../actor-message'

export type SupervisionResponse = 'drop-message' | 'retry-message' | 'kill-actor'

export default interface IActorSupervisor {
  supervise(actor: Actor, exception: any, message: any): SupervisionResponse
}

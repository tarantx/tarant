import { Actor } from '../..'

export type SupervisionResponse = 'drop-message' | 'retry-message' | 'kill-actor'

export default interface IActorSupervisor {
  supervise(actor: Actor, exception: any): SupervisionResponse
}

import { Actor } from '../..'
import IActorSupervisor from './actor-supervisor'
import { SupervisionResponse } from './actor-supervisor'

export default class NoopActorSupervisor implements IActorSupervisor {
  public supervise(actor: Actor, exception: any, message: any): SupervisionResponse {
    return 'drop-message'
  }
}

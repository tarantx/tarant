import Actor from '../../actor-system/actor'
import IResolver from './resolver'

export default class NoopResolver implements IResolver {
  public async resolveActorById(id: string): Promise<Actor | undefined> {
    return undefined
  }
}

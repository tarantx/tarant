import Actor from '../../actor-system/actor'

export default interface IResolver {
  resolveActorById(id: string): Promise<Actor | undefined>
}

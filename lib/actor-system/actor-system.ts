export default class ActorSystem {
  public static default(): ActorSystem {
    return new ActorSystem()
  }

  public free(): void {
    return
  }

  public new<T>(constructor: new (...args: [any]) => T, values: [any]): T {
    return new constructor(...values)
  }
}

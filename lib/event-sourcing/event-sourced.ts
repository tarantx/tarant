export interface IEvent {
  family: string
  stream: string
  name: string
  data: any[]
  version: number
}

export interface IEventToApply {
  event: (...args: any[]) => void
  data: any[]
}

/**
 * Base interface for all event sourced entities.
 */
export interface IEventSourced {
  id: string

  /**
   * Applies an event to the current entity. This should be called with a reference
   * to the event handler, and the parameters as an array. For example:
   *
   * this.apply(this.transactionCommited, [ { amount: 150.0 } ])
   *
   * @param event Event to write in the journal
   * @param data Data to be wrote in the journal along the event information
   */
  apply(event: (...args: any[]) => void, data: any[]): void

  /**
   * Applies a set pf events to the current entity, in the order provided. The entity will
   * not be released to process new messages until all events are applied.
   *
   * @param event Event to write in the journal
   * @param data Data to be wrote in the journal along the event information
   */
  applyAll(...events: IEventToApply[]): void

  /**
   * Returns the journal of processed events. It might happen that a delivered event is still not in the journal
   * because it's pending to be processed.
   */
  journal(): IEvent[]

  /**
   * Sources the entity with a list of events to be processed. They will be eventually processed in guaranteed order.
   * @param events The list of events to process
   */
  source(events: IEvent[]): void

  /**
   * Returns the current version of the sourced entity.
   */
  version(): number
}

import Partition from './Partition'

export default class Message<T> {
  public static of<T>(partition: Partition, content: T): Message<T> {
    return new Message(partition, content)
  }

  public static ofJson(partition: Partition, content: object): Message<object> {
    return new Message(partition, content)
  }

  public readonly partition: Partition
  public readonly content: T

  private constructor(partition: Partition, content: T) {
    this.partition = partition
    this.content = content
  }
}

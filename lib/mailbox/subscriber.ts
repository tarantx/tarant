import Message from './message'
import Partition from './partition'

export default interface ISubscriber<T> {
  partitions: [Partition]
  onReceiveMessage(message: Message<T>): Promise<boolean>
}

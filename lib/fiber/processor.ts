export default interface IProcessor {
  requirements: [string]
  process(): void
}

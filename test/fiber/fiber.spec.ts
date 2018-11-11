import Fiber from '../../lib/fiber/fiber'
import IProcessor from '../../lib/fiber/processor'

describe('Fiber', () => {
  let fiber: Fiber

  beforeEach(() => {
    fiber = Fiber.with({ resources: ['my-resource'], pollInterval: 1 })
  })

  afterEach(() => {
    fiber.free()
  })

  test('should acquire a processor if matches the requirements', () => {
    const processor = dummyProcessor(['my-resource'])
    expect(fiber.acquire(processor)).toBeTruthy()
    expect(fiber.name).toStrictEqual('fiber-with-my-resource')
  })

  test('should not acquire a processor if doesn\t match the requirements', () => {
    const processor = dummyProcessor(['another-resource'])
    expect(fiber.acquire(processor)).toBeFalsy()
  })
})

function dummyProcessor(requirements: [string]): IProcessor {
  return { process: () => null, requirements }
}

jest.mock( "../../../../lib/domain/actor/actor-system", () => ({
    composeMaterializers:jest.fn(() => ({
        onActivate: jest.fn()
    }))
}))

import Actor from "../../../../lib/domain/actor/actor";
import faker from "faker";

describe("Actor Initializers", () => {


    class coolActor extends Actor{}
    class notCoolActor extends Actor{}

    test("calling constructor directly should throw", () => {
        expect(() => new coolActor(faker.random.uuid(), {}, {})).toThrow(`private constructor`)
    })

    test("should have get method that retrieves existing actor from system", () => {
        let id = faker.random.uuid()
        let context = { system: {getActor : jest.fn() } }
        let instanceCoolActor = coolActor.create(id, {}, context)
        context.system.getActor.mockReturnValue(instanceCoolActor)
        let result = coolActor.get(id, context)
        expect(result).toEqual(instanceCoolActor)
        expect(context.system.getActor).toBeCalledWith(id)
    })

    test("should have get method that returns undefined if actor of other class", () => {
        let id = faker.random.uuid()
        let context = { system: {getActor : jest.fn() } }
        let instanceCoolActor = coolActor.create(id, {}, context)
        context.system.getActor.mockReturnValue(instanceCoolActor)
        expect(() => notCoolActor.get(id, context)).toThrow(`Actor with id ${id} does not exist in this system`)
    })

    test("should have create method that returns new actor", () => {
        let id = faker.random.uuid()
        let context = { system: {getActor : jest.fn() } }
        let instanceCoolActor = coolActor.create(id, {}, context)
        expect(instanceCoolActor).toBeInstanceOf(coolActor)
    })

    test("should have create method that throws an exception if the actor already exists", () => {
        let id = faker.random.uuid()
        let context = { system: {getActor : jest.fn() } }
        let instanceCoolActor = coolActor.create(id, {}, context)
        context.system.getActor.mockReturnValue(instanceCoolActor)
        expect(context.system.getActor).toBeCalledWith(id)
        expect(() => coolActor.create(id, {}, context)).toThrow(`Actor with id ${id} already exists in this system`)
    })
})
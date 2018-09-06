jest.mock( "../../../../lib/domain/actor/actor-system", () => ({
    getActor: jest.fn(),
    composeMaterializers:jest.fn(() => ({
        onActivate: jest.fn()
    }))
}))

import ActorSystem from "../../../../lib/domain/actor/actor-system";
import Actor from "../../../../lib/domain/actor/actor";
import faker from "faker";

describe("Actor Initializers", () => {


    class coolActor extends Actor{}
    class notCoolActor extends Actor{}

    test("should have get method that retrieves existing actor from system", () => {
        let id = faker.random.uuid()
        let instanceCoolActor = coolActor.create('id')
        ActorSystem.getActor.mockReturnValue(instanceCoolActor)
        let result = coolActor.get(id)
        expect(result).toEqual(instanceCoolActor)
        expect(ActorSystem.getActor).toBeCalledWith(id)
    })

    test("should have get method that returns undefined if actor of other class", () => {
        let id = faker.random.uuid()
        let instanceCoolActor = coolActor.create(id)
        ActorSystem.getActor.mockReturnValue(instanceCoolActor)
        let result = notCoolActor.get(id)
        expect(result).toEqual(undefined)
    })

    test("should have create method that returns new actor", () => {
        // console.log(coolActor.create("pepe"))
    })
})
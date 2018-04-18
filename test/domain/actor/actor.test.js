import Actor from "../../../lib/domain/actor/actor";

let createActor = () => {
    return new (class extends Actor {

    })();
};

describe("Actor", () => {
    test("mailbox", () => {
        let actor = createActor();
        actor.receiveMessage(1);

        let [ message ] = actor.mailbox;
        expect(message).toBe(1);
    });
});
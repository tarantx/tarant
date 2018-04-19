import ActorSystem from "../../../lib/domain/actor/actor-system";

let sleep = async (ms) => {
    return new Promise(r => setTimeout(r, ms));
};

describe("ActorSystem", () => {
    test("should register an actor", () => {
        let system = new ActorSystem();
        let actor = new system.Actor();

        expect(system.actors[actor.id]).toBe(actor);
    });

    test("should deregister an actor", () => {
        let system = new ActorSystem();
        let actor = new system.Actor();

        system.killActor(actor);

        expect(system.actors[actor.id]).toBe(undefined);
    });

    test("should use the scheduler to pull messages from actors", async () => {
        let system = new ActorSystem();
        system.start();

        let actor = new (class extends system.Actor {
            constructor() {
                super();

                this.onReceive = jest.fn();
            }
        });

        actor.receiveMessage("");
        await sleep(5);
        system.stop();

        expect(actor.onReceive.mock.calls.length).toBe(1);

    });
});

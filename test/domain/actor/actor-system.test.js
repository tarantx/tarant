import ActorSystem from "../../../lib/domain/actor/actor-system";
import drop from "../../../lib/domain/actor/supervisor/drop";
import Actor from "../../../lib/domain/actor/actor";

let sleep = async (ms) => {
    return new Promise(r => setTimeout(r, ms));
};

describe("ActorSystem", () => {
    test("should register an actor", () => {
        let system = new ActorSystem();
        let actor = new system.Actor();

        expect(system.getActor(actor.id)).toBe(actor);
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

                this.onReceive = jest.fn().mockImplementation(c => console.log("=====>", c));
            }
        });

        actor.receiveMessage("some message");
        await sleep(15);

        expect(actor.onReceive.mock.calls.length).toBe(1);
        await system.stop();
    });

    test("should wait until all messages have been processed", async () => {
        let system = new ActorSystem();

        let actor = new (class extends system.Actor {
            constructor() {
                super();

                this.onReceive = jest.fn();
            }
        });

        actor.receiveMessage("");
        actor.receiveMessage("");
        actor.receiveMessage("");
        actor.receiveMessage("");
        actor.receiveMessage("");

        system.start();
        await system.stop();

        expect(actor.onReceive.mock.calls.length).toBe(5);
    });

    test("stopping a system will kill all actors", async () => {
        let system = new ActorSystem();

        let actor = new (class extends system.Actor {
            constructor() {
                super();

                this.kill = jest.fn();
            }
        });

        await system.stop();
        expect(actor.kill.mock.calls.length).toBe(1);
    });

    test("should call the supervisor when an unhandled exception", async () => {
        let fn = jest.fn();
        fn.mockReturnValue(drop);

        let system = new ActorSystem(undefined, fn);
        let actor = new (class extends system.Actor {
            constructor() {
                super();

                this.onReceive = () => Promise.reject("foo");
            }
        });

        actor.receiveMessage("");
        system.start();
        await system.stop();

        expect(fn.mock.calls[0]).toEqual([system, actor, "foo"]);
    });

    test("should tell a message to an actor", () => {
        let system = new ActorSystem();
        let actor = new system.Actor();

        system.tell(actor.id, "hello");

        expect(actor.mailbox[0]).toEqual({ origin: system, message: "hello" });
    });
});

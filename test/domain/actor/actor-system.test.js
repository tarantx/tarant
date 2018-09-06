import ActorSystem from "../../../lib/domain/actor/actor-system";
import drop from "../../../lib/domain/actor/supervisor/drop";
import Actor from "../../../lib/domain/actor/actor";

let sleep = async (ms) => {
    return new Promise(r => setTimeout(r, ms));
};

describe("ActorSystem", () => {
    test("should register an actor", () => {
        let system = new ActorSystem();
        let actor = system.Actor.create();

        expect(system.getActor(actor.id)).toBe(actor);
    });

    test("should deregister an actor", () => {
        let system = new ActorSystem();
        let actor = system.Actor.create();

        system.killActor(actor.id);

        expect(system.actors[actor.id]).toBe(undefined);
    });

    test("should use the scheduler to pull messages from actors", async () => {
        let system = new ActorSystem();
        system.start();

        let actor = (class extends system.Actor {
            static create() {
                let instance = super.create();
                instance.onReceive = jest.fn();
                return instance
            }
        }).create();

        system.tell(actor.id, "some message");
        await sleep(15);

        expect(actor.onReceive.mock.calls.length).toBe(1);
        await system.stop();
    });

    test("should wait until all messages have been processed", async () => {
        let system = new ActorSystem();

        let actor = (class extends system.Actor {
            static create() {
                let instance = super.create();
                instance.onReceive = jest.fn();
                return instance
            }
        }).create();

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

        let actor = (class extends system.Actor {
            static create() {
                let instance = super.create();
                instance.kill = jest.fn();
                return instance
            }
        }).create();

        await system.stop();
        expect(actor.kill.mock.calls.length).toBe(1);
    });

    test("should call the supervisor when an unhandled exception happens", async () => {
        let fn = jest.fn();
        fn.mockReturnValue(drop);

        let system = new ActorSystem({ supervisor: fn });
        let actor = (class extends system.Actor {
            static create() {
                let instance = super.create();
                instance.onReceive = () => Promise.reject("foo");
                return instance
            }
        }).create();

        actor.receiveMessage("");
        system.start();
        await system.stop();

        expect(fn.mock.calls[0]).toEqual([system, actor, "foo"]);
    });

    test("should tell a message to an actor", () => {
        let system = new ActorSystem();
        let actor = system.Actor.create();

        system.tell(actor.id, "hello");

        expect(actor.mailbox.queue[0]).toEqual({ origin: system, message: "hello" });
    });

    test("should ask an actor", async () => {
        let system = new ActorSystem();
        let actor = (class extends system.Actor {
            onReceive() {
                return 1;
            }
        }).create();

        system.start();
        let promise = system.ask(actor.id, "what?");
        await system.stop();

        expect(await promise).toEqual(1);
    });

    test("should stop the scheduler in case of three idle ticks", () => {
        let system = new ActorSystem();
        system.scheduler.stop = jest.fn();

        system.__pullAllActorMailboxes();
        system.__pullAllActorMailboxes();
        system.__pullAllActorMailboxes();

        expect(system.scheduler.stop).toHaveBeenCalledTimes(1);
    });

    test("that composition of materializers work", () => {
        let fn1 = jest.fn();
        let fn2 = jest.fn();

        let system = ActorSystem.Builder()
            .withMaterializer( { onActivate: fn1 })
            .withMaterializer( { onActivate: fn2 })
            .build();

        system.Actor.create();

        expect(fn1.mock.calls.length).toEqual(1);
        expect(fn2.mock.calls.length).toEqual(1);
    });
});

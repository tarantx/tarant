import Actor from "../../../lib/domain/actor/actor";
import EventBus from "../../../lib/domain/actor/event-bus";

let createActor = (cb) => {
    return new (class extends Actor {
        constructor() {
            super();

            this.onReceive = cb || jest.fn();
        }
    })();
};

let receiveAndPull = async (actor, message) => {
    actor.receiveMessage(message);
    return await actor.pull();
};

describe("Actor", () => {
    test("should put the received message at the end of the mailbox", () => {
        let actor = createActor();
        actor.receiveMessage(1);

        let [ message ] = actor.mailbox;
        expect(message).toBe(1);
    });

    test("should pull a message and call onReceive with that message", () => {
        let actor = createActor();
        actor.receiveMessage(1);

        actor.pull();

        expect(actor.mailbox).toEqual([]);
        expect(actor.onReceive.mock.calls[0][0]).toBe(1);
    });

    test("should tell a message to another actors mailbox", () => {
        let sender = createActor();
        let receiver = createActor();

        sender.tell(receiver, "message");

        let [ { origin, message } ] = receiver.mailbox;

        expect(origin).toEqual(sender);
        expect(message).toBe("message");
    });

    test("ask should use the return value of an actor onReceive call", async () => {
        let sender = createActor();
        let receiver = createActor(() => 1);

        let promise = sender.ask(receiver, "whatever");
        await receiver.pull();

        expect(promise).resolves.toBe(1);
    });

    test("ask should return a failed promise in case of an error in the target actor", async () => {
        let sender = createActor();
        let receiver = createActor(() => { throw "error" });

        let promise = sender.ask(receiver, "whatever");
        try {
            await receiver.pull();
        } catch (e) {
        }

        expect(promise).rejects.toThrow("error");
    });

    test("ask should use the return value of an actor onReceive call for async result", async () => {
        let sender = createActor();
        let receiver = createActor(() => Promise.resolve(1));

        let promise = sender.ask(receiver, "whatever");
        await receiver.pull();

        expect(promise).resolves.toBe(1);
    });

    test("ask should return a failed promise in case of an error in the target actor for async result", () => {
        let sender = createActor();
        let receiver = createActor(() => Promise.reject("error"));

        let promise = sender.ask(receiver, "whatever");
        try {
            receiver.pull();
        } catch (e) {
        }

        expect(promise).rejects.toThrow("error");
    });

    test("should store the current state in case of a success synchronous pull", () => {
        let actor = createActor(function () { this.color = "blue" });
        actor.receiveMessage("");

        actor.pull();
        expect(actor.history()).toEqual([{ color: "blue", mailbox: [] }]);
    });

    test("should not store the current state in case of an failing pull", async () => {
        let actor = createActor(() => { throw "lol" });
        actor.receiveMessage("");

        try {
            await actor.pull();
        } catch (e) {
        }

        expect(actor.history()).toEqual([]);
    });

    test("should store the current state in case of a successful asynchronous pull", async () => {
        let actor = createActor(function () {
            return new Promise((resolve) => {
                this.color = "blue";
                resolve(this.color);
            });
        });

        actor.receiveMessage("");

        await actor.pull();
        expect(actor.history()).toEqual([{color: "blue", mailbox: []}]);
    });

    test("should not store the current state in case of a failing asynchronous pull", async () => {
        let actor = createActor(function () { return Promise.reject("X"); });
        actor.receiveMessage("");

        try {
            await actor.pull();
        } catch (e) {

        }
        expect(actor.history()).toEqual([]);
    });

    test("should be able to navigate to a known status", async () => {
        let actor = createActor(function (message) { this.color = message });
        await receiveAndPull(actor, "red");
        await receiveAndPull(actor, "green");
        await receiveAndPull(actor, "blue");

        actor.navigateTo(1);

        expect(actor.color).toBe('green');
    });

    test("should not receive more messages when killed", () => {
        let actor = createActor();
        actor.kill();

        actor.receiveMessage("whatever");
        expect(actor.mailbox).toEqual([]);
    });

    test("ask should not do anything when the actor has been killed", () => {
        let sender = createActor();
        let receiver = createActor(() => Promise.reject("error"));

        sender.kill();
        sender.ask(receiver, "whatever");

        expect(receiver.mailbox).toEqual([]);
    });

    test("onReceive should fail if not implemented", () => {
        expect(() => (new Actor()).onReceive()).toThrow();
    });

    test("pull should return an undefined promise", () => {
        expect((new Actor()).pull()).resolves.toEqual(undefined);
    });

    test("subscribes to a topic and puts received messages in the mailbox", () => {
        let actor = createActor();
        actor.system = { eventBus: new EventBus() };

        actor.subscribe("topic");
        actor.publish("topic", "message");

        expect(actor.mailbox[0].message).toEqual("message");
    });

    test("unsubscribes from a topic ", () => {
        let actor = createActor();
        actor.system = { eventBus: new EventBus() };

        actor.subscribe("topic");
        actor.unsubscribe("topic");

        actor.publish("topic", "message");

        expect(actor.mailbox).toEqual([]);
    });

    test("request response in a topic", async () => {
        let eventBus = new EventBus();
        let requester = createActor();
        requester.system = { eventBus };

        let a = createActor(() => 1);
        a.system = { eventBus };

        let b = createActor(() => 2);
        b.system = { eventBus };

        a.subscribe("topic");
        b.subscribe("topic");

        let answer = requester.request("topic", "whatever");
        await a.pull();
        await b.pull();

        expect(await answer).toEqual([1, 2]);
    });
});
import Actor from "../../../lib/domain/actor/actor";
import EventBus from "../../../lib/domain/actor/event-bus";
import uuid from "uuid/v4";

describe("Actor", () => {
    let createActorFactory = system => (cb, materializer) => {
        return new (class extends Actor {
            constructor() {
                super(uuid(), {}, { materializer, system });

                this.onReceive = cb || jest.fn();
            }
        })();
    };

    let receiveAndPull = async (actor, message) => {
        actor.receiveMessage(message);
        return await actor.pull();
    };

    let sleep = async (ms) => {
        return new Promise(r => setTimeout(r, ms));
    };

    let createActor = undefined;

    beforeEach(() => {
        createActor = createActorFactory({ requestTime: jest.fn() });
    });

    test("should put the received message at the end of the mailbox", () => {
        let actor = createActor();
        actor.receiveMessage(1);

        let [message] = actor.mailbox.queue;
        expect(message).toBe(1);
        expect(actor.system.requestTime).toHaveBeenCalledWith(actor.id);
    });

    test("if the mailbox is empty after pulling, it should not ask for time to the system", async () => {
        let actor = createActor();
        actor.receiveMessage(1);

        actor.system.requestTime.mockClear();
        await actor.pull();

        expect(actor.system.requestTime).not.toHaveBeenCalledWith(actor.id);
    });

    test("if the mailbox is not empty after pulling, it should ask for time to the system", async () => {
        let actor = createActor();
        actor.receiveMessage(1);
        actor.receiveMessage(1);

        actor.system.requestTime.mockClear();
        await actor.pull();

        expect(actor.system.requestTime).toHaveBeenCalledWith(actor.id);
    });

    test("should support recursive messages in the same actor", async () => {
        let actor = createActor(function () { this.tell(this, "hi!") });
        await receiveAndPull(actor, 1);

        expect(actor.mailbox.queue[0].message).toBe("hi!");
    });

    test("should not ask to itself", () => {
        let actor = createActor();
        expect(() => actor.ask(actor, "asd")).toThrow();
    });

    test("should not pull a new message until the current one is not processed", async () => {
        let resolvePromise = null;
        let actor = createActor(() => new Promise(r => resolvePromise = r));
        actor.receiveMessage(1);
        actor.receiveMessage(2);
        let firstMessage = actor.pull(); // The actor hangs until we call resolvePromise
        await actor.pull(); // should not do anything so it returns
        expect(actor.mailbox.queue).toEqual([1, 2]);
        resolvePromise();
        await firstMessage;
        let secondMessage = actor.pull();
        resolvePromise();
        await secondMessage;
        expect(actor.mailbox.queue).toEqual([]);
    });

    test("should pull a message and call onReceive with that message", async () => {
        let actor = createActor();
        await receiveAndPull(actor, 1);

        expect(actor.mailbox.queue).toEqual([]);
        expect(actor.onReceive.mock.calls[0][0]).toBe(1);
    });

    test("should tell a message to another actors mailbox", () => {
        let sender = createActor();
        let receiver = createActor();

        sender.tell(receiver, "message");

        let [{origin, message}] = receiver.mailbox.queue;

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
        let receiver = createActor(() => {
            throw "error"
        });

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

    test("should throw an exception if onReceive not implemented", async () => {
        let promise = new Actor([1]).pull();
        expect(promise).rejects.toThrow();
    });

    test("should store the current state in case of a success synchronous pull", async () => {
        let actor = createActor(function () {
            this.color = "blue"
        });

        await receiveAndPull(actor, "");
        expect(actor.history()).toMatchObject([{color: "blue", mailbox: { queue: [] }, id: actor.id }]);
    });

    test("should not store the current state in case of an failing pull", async () => {
        let actor = createActor(() => {
            throw "lol"
        });
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
        expect(actor.history()).toMatchObject([{color: "blue", mailbox: { queue: [] }, id: actor.id }]);
    });

    test("should not store the current state in case of a failing asynchronous pull", async () => {
        let actor = createActor(function () {
            return Promise.reject("X");
        });
        actor.receiveMessage("");

        try {
            await actor.pull();
        } catch (e) {

        }
        expect(actor.history()).toEqual([]);
    });

    test("should be able to navigate to a known status", async () => {
        let actor = createActor(function (message) {
            this.color = message
        });
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
        expect(actor.mailbox.queue).toEqual([]);
    });

    test("ask should not do anything when the actor has been killed", () => {
        let sender = createActor();
        let receiver = createActor(() => Promise.reject("error"));

        sender.kill();
        sender.ask(receiver, "whatever");

        expect(receiver.mailbox.queue).toEqual([]);
    });

    test("onReceive should fail if not implemented", () => {
        expect(() => (new Actor()).onReceive()).toThrow();
    });

    test("pull should return an undefined promise", () => {
        expect((new Actor()).pull()).resolves.toEqual(undefined);
    });

    test("subscribes to a topic and puts received messages in the mailbox", () => {
        let actor = createActor();
        actor.system.eventBus = new EventBus();

        actor.subscribe("topic");
        actor.publish("topic", "message");

        expect(actor.mailbox.queue[0].message).toEqual("message");
    });

    test("unsubscribes from a topic ", () => {
        let actor = createActor();
        actor.system.eventBus = new EventBus();

        actor.subscribe("topic");
        actor.unsubscribe("topic");

        actor.publish("topic", "message");

        expect(actor.mailbox.queue).toEqual([]);
    });

    test("request response in a topic", async () => {
        let eventBus = new EventBus();
        let requester = createActor();
        requester.system.eventBus = eventBus;

        let a = createActor(() => 1);
        a.system.eventBus = eventBus;

        let b = createActor(() => 2);
        b.system.eventBus = eventBus;

        a.subscribe("topic");
        b.subscribe("topic");

        let answer = requester.request("topic", "whatever");
        await a.pull();
        await b.pull();

        expect(answer).resolves.toEqual([1, 2]);
    });

    test("request response in a topic should timeout", async () => {
        let eventBus = new EventBus();
        let requester = createActor();
        requester.system.eventBus = eventBus;

        let a = createActor(() => 1);
        a.system.eventBus = eventBus;

        a.subscribe("topic");

        let answer = requester.request("topic", "whatever", 0).catch(_ => console.error("timeout"));
        let r = sleep(5).then(a.pull()).then(answer);

        expect(r).rejects.toThrow("timeout");
    });

    test("should eventually call the materializer onActivate method when constructed", () => {
        let onActivate = jest.fn();
        let actor = createActor(undefined, {onActivate});

        expect(onActivate.mock.calls[0]).toEqual([actor]);
    });

    test("should call onDeactivate when an actor is killed", () => {
        let onDeactivate = jest.fn();
        let actor = createActor(undefined, {onDeactivate});

        actor.kill();
        expect(onDeactivate.mock.calls[0]).toEqual([actor]);
    });

    test("should call onReceiveMessage when an actor receives a message on the mailbox", () => {
        let onReceiveMessage = jest.fn();
        let actor = createActor(undefined, {onReceiveMessage});

        actor.receiveMessage("");
        expect(onReceiveMessage.mock.calls[0]).toEqual([actor, ""]);
    });

    test("should call onBeforePullingMessage when an actor is going to pull a message and the mailbox is not empty", () => {
        let onBeforePullingMessage = jest.fn();
        let actor = createActor(undefined, {onBeforePullingMessage});

        actor.receiveMessage("");
        actor.pull();

        expect(onBeforePullingMessage.mock.calls[0]).toEqual([actor, ""]);
    });

    test("should not call onBeforePullingMessage when the mailbox is empty", () => {
        let onBeforePullingMessage = jest.fn();
        let actor = createActor(undefined, {onBeforePullingMessage});

        actor.pull();

        expect(onBeforePullingMessage.mock.calls).toEqual([]);
    });

    test("should call onAfterMessageProcessed when the message has been processed successfully", async () => {
        let onAfterMessageProcessed = jest.fn();
        let actor = createActor(() => 1, {onAfterMessageProcessed});

        await receiveAndPull(actor, 0);

        expect(onAfterMessageProcessed.mock.calls[0]).toEqual([actor, 0, 1]);
    });

    test("should not call onAfterMessageProcessed when the message has been failed to process", async () => {
        let onAfterMessageProcessed = jest.fn();
        let actor = createActor(() => {
            throw "expected"
        }, {onAfterMessageProcessed});

        try {
            await receiveAndPull(actor, 0);
        } catch (e) {
        }

        expect(onAfterMessageProcessed.mock.calls).toEqual([]);
    });

    test("should call onError when the message has been failed to process", async () => {
        let onError = jest.fn();
        let actor = createActor(() => {
            throw "expected"
        }, {onError});

        try {
            await receiveAndPull(actor, 0);
        } catch (e) {
        }

        expect(onError.mock.calls[0]).toEqual([actor, 0, "expected"]);
    });

    test("should call onSubscribe when the actor subscribes to a topic", () => {
        let eventBus = new EventBus();
        let onSubscribe = jest.fn();

        let actor = createActor(undefined, {onSubscribe});
        actor.system.eventBus = eventBus;

        let subscription = actor.subscribe("topic");

        expect(onSubscribe.mock.calls[0]).toEqual([actor, "topic", subscription]);
    });

    test("should call onUnsubscribe when the actor unsubscribes from a topic", () => {
        let eventBus = new EventBus();
        let onUnsubscribe = jest.fn();

        let actor = createActor(undefined, {onUnsubscribe});
        actor.system.eventBus = eventBus;

        let subscription = actor.subscribe("topic");
        actor.unsubscribe("topic");

        expect(onUnsubscribe.mock.calls[0]).toEqual([actor, "topic", subscription]);
    });
});
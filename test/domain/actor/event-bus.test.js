import EventBus from "../../../lib/domain/actor/event-bus";

describe("EventBus", () => {
    test("should call a subscriber when a message arrives to the topic", () => {
        let fn = jest.fn();
        let bus = new EventBus();

        bus.subscribe("topic", fn);
        bus.publish("topic", "hi");

        expect(fn.mock.calls[0][0]).toEqual("hi");
    });

    test("should not call an old subscriber", () => {
        let fn = jest.fn();
        let bus = new EventBus();

        let subscription = bus.subscribe("topic", fn);
        bus.unsubscribe(subscription);

        bus.publish("topic", "hi");

        expect(fn.mock.calls.length).toEqual(0);
    });
});
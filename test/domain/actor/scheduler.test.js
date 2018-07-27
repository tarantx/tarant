import Scheduler from "../../../lib/domain/actor/scheduler";

let sleep = async (ms) => {
    return new Promise(r => setTimeout(r, ms));
};

describe("Scheduler", () => {
    test("should tick a function", async () => {
        let dispatcher = jest.fn();
        let scheduler = new Scheduler(dispatcher);

        scheduler.start();
        await sleep(1);
        scheduler.stop();

        expect(dispatcher.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    test("that start is be idempotent", () => {
        let scheduler = new Scheduler(jest.fn());
        scheduler.start();

        let id = scheduler.id;
        scheduler.start();

        let sameId = scheduler.id;
        scheduler.stop();

        expect(id).toEqual(sameId);
    });
});

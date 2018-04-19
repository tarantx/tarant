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
});

import drop from "../../../../lib/domain/actor/supervisor/drop";
import Actor from "../../../../lib/domain/actor/actor";
import TimeMachine from "../../../../lib/domain/actor/time-machine";

describe("Drop strategy", () => {
    test("should drop the latest message and return to the latest known state", () => {
        let actor = new Actor([1, 2], new TimeMachine([{state: 1}, {state: 2}]));
        let result = drop(undefined, actor);

        expect(result.state).toEqual(1);
        expect(result.mailbox).toEqual([2]);
    });
});
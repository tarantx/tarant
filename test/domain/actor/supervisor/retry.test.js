import Actor from "../../../../lib/domain/actor/actor";
import TimeMachine from "../../../../lib/domain/actor/time-machine";
import retry from "../../../../lib/domain/actor/supervisor/retry";

describe("Retry strategy", () => {
    test("should retry the latest message with the old state", () => {
        let actor = new Actor([{ message: 1 }, { message: 2 }], new TimeMachine([{state: 1}, {state: 2}]));
        let result = retry(undefined, actor);

        expect(result.state).toEqual(1);
        expect(result.mailbox).toEqual([{ message: 1, retries: 1 }, { message: 2 }]);
    });
});
import Actor from "../../../../lib/domain/actor/actor";
import TimeMachine from "../../../../lib/domain/actor/time-machine";
import retry from "../../../../lib/domain/actor/supervisor/retry";

const system = {maxRetries: 2};
describe("Retry strategy", () => {
    test("should retry the latest message with the old state", () => {
        let _retry = retry();
        let actor = new Actor([{ message: 1 }, { message: 2 }], new TimeMachine([{state: 1}, {state: 2}]));

        let result = _retry(system, actor);

        expect(result.state).toEqual(1);
        expect(result.mailbox).toEqual([{ message: 1, retries: 1 }, { message: 2 }]);
    });

    test("should retry at most the maximum times specified in the system and drop the message", () => {
        let _retry = retry();

        let actor = new Actor([{ message: 1 }, { message: 2 }], new TimeMachine([{state: 1}, {state: 2}]));
        _retry(system, actor);
        _retry(system, actor);
        let result = _retry(system, actor);

        expect(result.state).toEqual(1);
        expect(result.mailbox).toEqual([{ message: 2 }]);
    });

    test("should use the number of retries specified in the constructor, and then drop the message", () => {
        let _retry = retry(1);

        let actor = new Actor([{ message: 1 }, { message: 2 }], new TimeMachine([{state: 1}, {state: 2}]));
        _retry(system, actor);
        let result = _retry(system, actor);

        expect(result.state).toEqual(1);
        expect(result.mailbox).toEqual([{ message: 2 }]);
    })
});
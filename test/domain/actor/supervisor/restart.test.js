import restart from "../../../../lib/domain/actor/supervisor/restart";
import Actor from "../../../../lib/domain/actor/actor";
import TimeMachine from "../../../../lib/domain/actor/time-machine";

describe("Restart strategy", () => {
    test("should restart the actor and retry the message", () => {
        let actor = Actor.create(undefined, undefined, { mailbox: [1, 2], timeMachine: new TimeMachine([{state: 'initial'}, {state: 1}, {state: 2}]) });
        let result = restart(undefined, actor);

        expect(result.state).toEqual('initial');
        expect(result.mailbox.queue).toEqual([1, 2]);
    });
});
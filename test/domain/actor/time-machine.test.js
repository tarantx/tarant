import TimeMachine from "../../../lib/domain/actor/time-machine";

describe("TimeMachine", () => {
    test("should save a copy of the passed object", () => {
        let state = { copy: true };
        let machine = new TimeMachine();
        machine.save(state);
        state.copy = false;

        let lastSavedState = machine.lastState();
        expect(lastSavedState.copy).toBe(true);
    })
});
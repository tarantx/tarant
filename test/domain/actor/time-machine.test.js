import TimeMachine from "../../../lib/domain/actor/time-machine";

describe("TimeMachine", () => {
    test("should save a copy of the passed object", () => {
        let state = { copy: true };
        let machine = new TimeMachine();
        machine.save(state);
        state.copy = false;

        let lastSavedState = machine.lastState();
        expect(lastSavedState.copy).toBe(true);
    });

    test("should return a list of saved states", () => {
        let first = { a: 1 };
        let second = { a: 2 };

        let machine = new TimeMachine();
        machine.save(first).save(second);

        let history = machine.retrieveHistory();
        expect(history).toEqual([ first, second ]);
    })
});
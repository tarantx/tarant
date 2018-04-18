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

        let machine = new TimeMachine([first, second]);
        let history = machine.retrieveHistory();

        expect(history).toEqual([ first, second ]);
    });

    test("should return an item from the history", () => {
        let first = { a: 1 };
        let second = { a: 2 };

        let machine = new TimeMachine([first, second]);
        let firstState = machine.retrieve(0);

        expect(firstState).toEqual(first);
    });

    test("should return undefined if the item is not in the history", () => {
        let machine = new TimeMachine();
        let state = machine.retrieve(0);

        expect(state).toEqual(undefined);
    });
});
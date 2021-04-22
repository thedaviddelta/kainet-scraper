import { retrieve } from "../src/suggestions";

it("returns youtube songs with all data correctly", async () => {
    const suggestions = await retrieve();
    expect(suggestions).not.toBeNull();
    suggestions?.forEach(row => (
        row.forEach(suggestion =>
            Object.values(suggestion).forEach(val => (
                expect(val).toBeTruthy()
            ))
        )
    ));
});

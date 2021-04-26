import { retrieve } from "../src/suggestions";

it("returns suggested playlists with all data correctly", async () => {
    const suggestions = await retrieve();
    expect(suggestions).not.toBeNull();
    suggestions?.forEach(suggestion =>
        Object.values(suggestion).forEach(val => (
            expect(val).toBeTruthy()
        )
    ));
});

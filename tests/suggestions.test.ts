import { retrieveSuggestions } from "../src";

it("returns suggested playlists correctly", () => (
    retrieveSuggestions()
        .then(suggestions => expect(suggestions).not.toStrictEqual([]))
));

import { retrieveSuggestions } from "../src";

it("returns suggested playlists with all data correctly", () => (
    retrieveSuggestions()
        .then(suggestions => expect(suggestions).not.toBeNull())
));

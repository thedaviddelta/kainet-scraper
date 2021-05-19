import { retrieveSuggestions } from "../src";
// @ts-ignore
import { expectNoUndefined } from "./testUtils";

it("returns suggested playlists correctly", () => (
    retrieveSuggestions()
        .then(suggestions => {
            expect(suggestions).not.toStrictEqual([]);
            suggestions.forEach(list => expectNoUndefined(list));
        })
));

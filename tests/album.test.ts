import { getAlbum } from "../src";
// @ts-ignore
import { expectFromQueries, expectFromWrong, expectNoUndefined } from "./testUtils";

const queries = [
    "MPREb_6MwY5ApCXas",
    "MPREb_teWeMEZeVOQ",
    "MPREb_b3D2y9bdjNa"
];

it("returns album item with a songs array correctly", () => (
    expectFromQueries(queries, getAlbum, album => {
        expect(album).not.toBeNull();
        expect(album?.tracks).not.toStrictEqual([]);
        album && expectNoUndefined(album);
        album?.tracks?.forEach(track => expectNoUndefined(track));
    })
));

it("returns null on no album result", () => (
    expectFromWrong(getAlbum)
));

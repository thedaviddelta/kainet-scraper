import { getAlbum } from "../src";
// @ts-ignore
import { expectFromQueries, expectFromWrong } from "./testUtils";

const queries = [
    "MPREb_6MwY5ApCXas",
    "MPREb_teWeMEZeVOQ",
    "MPREb_b3D2y9bdjNa"
];

it("returns album item with a songs array correctly", () => (
    expectFromQueries(queries, getAlbum, album => {
        expect(album).not.toBeNull();
        expect(album?.songs).not.toStrictEqual([]);
    })
));

it("returns null on no album result", () => (
    expectFromWrong(getAlbum)
));

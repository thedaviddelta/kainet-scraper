import { getSongsFromAlbum } from "../src";
// @ts-ignore
import { expectFromQueries, expectFromWrong } from "./testUtils";

const queries = [
    "MPREb_6MwY5ApCXas",
    "MPREb_teWeMEZeVOQ",
    "MPREb_b3D2y9bdjNa"
];

it("returns album songs with all data correctly", () => (
    expectFromQueries(queries, getSongsFromAlbum)
));

it("returns null on no album result", () => (
    expectFromWrong(getSongsFromAlbum)
));

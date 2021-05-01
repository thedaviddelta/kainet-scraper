import { getPlaylist } from "../src";
// @ts-ignore
import { expectFromQueries, expectFromWrong } from "./testUtils";

const queries = [
    "VLRDCLAK5uy_lePvUIRtka0fZSLEEjKByNMYbxfyr7rGM",
    "VLRDCLAK5uy_n-Ui9UKxkshzIhAkII26G0DLugeFfRoS0",
    "VLPL5eNRayL5QIRiH9BR6dku6886u_LJmpth"
];

it("returns playlist item with a songs array correctly", () => (
    expectFromQueries(queries, getPlaylist, playlist => {
        expect(playlist).not.toBeNull();
        expect(playlist?.songs).not.toStrictEqual([]);
    })
));

it("returns null on no playlist result", () => (
    expectFromWrong(getPlaylist)
));

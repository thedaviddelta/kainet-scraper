import { search, SearchType } from "../src";
// @ts-ignore
import { expectFromQueries, expectFromWrong, expectNoUndefined } from "./testUtils";

const queries = [
    "queen",
    "the wall",
    "despacito"
];

const expectFromType = (type: typeof SearchType[keyof typeof SearchType]): Promise<void> => (
    expectFromQueries(queries, text => search(type, text), result => {
        expect(result).not.toStrictEqual([]);
        result.forEach(item => expectNoUndefined(item));
    })
);

const expectWrongFromType = (type: typeof SearchType[keyof typeof SearchType]): Promise<void> => (
    expectFromWrong(text => search(type, text), [])
);

describe("songs", () => {
    it("returns youtube songs correctly", () => (
        expectFromType(SearchType.SONGS)
    ));

    it("returns empty array on no songs results", () => (
        expectWrongFromType(SearchType.SONGS)
    ));
});

describe("videos", () => {
    it("returns youtube videos correctly", () => (
        expectFromType(SearchType.VIDEOS)
    ));

    it("returns empty array on no videos results", () => (
        expectWrongFromType(SearchType.VIDEOS)
    ));
});

describe("albums", () => {
    it("returns youtube albums correctly", () => (
        expectFromType(SearchType.ALBUMS)
    ));

    it("returns empty array on no albums results", () => (
        expectWrongFromType(SearchType.ALBUMS)
    ));
});

describe("playlists", () => {
    it("returns youtube playlists correctly", () => (
        expectFromType(SearchType.PLAYLISTS)
    ));

    it("returns empty array on no playlists results", () => (
        expectWrongFromType(SearchType.PLAYLISTS)
    ));
});

describe("artists", () => {
    it("returns youtube artists correctly", () => (
        expectFromType(SearchType.ARTISTS)
    ));

    it("returns empty array on no artists results", () => (
        expectWrongFromType(SearchType.ARTISTS)
    ));
});

import faker from "faker";
import { getSongs } from "../src/search";

describe("songs", () => {
    const queries = [
        "gangnam style",
        "el diluvi",
        "a night at the opera"
    ];

    const resFromQueries = <T>(callback: (query: string) => Promise<T>): Promise<T[]> => Promise.all(queries.map(query => callback(query)));

    it("returns youtube response correctly", async () => {
        const results = await resFromQueries(getSongs);
        results.forEach(songList => expect(songList).not.toBeNull());
    });

    it("returns all data correctly", async () => {
        const results = await resFromQueries(getSongs);
        results.forEach(songList => (
            songList?.forEach(song => (
                Object.values(song).forEach(val => (
                    expect(val).toBeTruthy()
                ))
            ))
        ));
    });

    it("returns null on no results", async () => {
        const songs = await getSongs(faker.git.commitSha());
        expect(songs).toBeNull();
    });
});

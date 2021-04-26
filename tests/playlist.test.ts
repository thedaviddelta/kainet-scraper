import { getSongs, Song, Video } from "../src/playlist";

it("returns playlist songs with all data correctly", async () => {
    const songs = await getSongs("VLRDCLAK5uy_ns0zdPCT6SFehpoLv5OqYHJZoqmbXwsTM");
    expect(songs).not.toBeNull();
    songs?.forEach((song: Song | Video) => (
        Object.values(song).forEach(val => (
            expect(val).toBeTruthy()
        ))
    ));
});

it("returns null on no playlist result", async () => {
    const songs = await getSongs("");
    expect(songs).toBeNull();
});

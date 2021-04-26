import { getSongs } from "../src/album";

it("returns album songs with all data correctly", async () => {
    const songs = await getSongs("MPREb_2mrJ3bwriqS");
    expect(songs).not.toBeNull();
    songs?.forEach(song => (
        Object.values(song).forEach(val => (
            expect(val).toBeTruthy()
        ))
    ));
});

it("returns null on no album result", async () => {
    const songs = await getSongs("");
    expect(songs).toBeNull();
});

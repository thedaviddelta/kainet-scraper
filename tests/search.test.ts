import faker from "faker";
import { getSongs, getVideos, getAlbums, getPlaylists, getArtists } from "../src/search";

const queries = [
    "queen",
    "the wall",
    "despacito"
];

const resFromQueries = <T>(callback: (query: string) => Promise<T>): Promise<T[]> => Promise.all(queries.map(query => callback(query)));

describe("songs", () => {
    it("returns youtube songs with all data correctly", async () => {
        const results = await resFromQueries(getSongs);
        results.forEach(songList => {
            expect(songList).not.toBeNull();
            songList?.forEach(song => (
                Object.values(song).forEach(val => (
                    expect(val).toBeTruthy()
                ))
            ));
        });
    });

    it("returns null on no songs results", async () => {
        const songs = await getSongs(faker.git.commitSha());
        expect(songs).toBeNull();
    });
});

describe("videos", () => {
    it("returns youtube videos with all data correctly", async () => {
        const results = await resFromQueries(getVideos);
        results.forEach(videoList => {
            expect(videoList).not.toBeNull();
            videoList?.forEach(video => (
                Object.values(video).forEach(val => (
                    expect(val).toBeTruthy()
                ))
            ));
        });
    });

    it("returns null on no videos results", async () => {
        const videos = await getVideos(faker.git.commitSha());
        expect(videos).toBeNull();
    });
});

describe("albums", () => {
    it("returns youtube albums with all data correctly", async () => {
        const results = await resFromQueries(getAlbums);
        results.forEach(albumList => {
            expect(albumList).not.toBeNull();
            albumList?.forEach(album => (
                Object.values(album).forEach(val => (
                    expect(val).toBeTruthy()
                ))
            ));
        });
    });

    it("returns null on no albums results", async () => {
        const albums = await getAlbums(faker.git.commitSha());
        expect(albums).toBeNull();
    });
});

describe("playlists", () => {
    it("returns youtube playlists with all data correctly", async () => {
        const results = await resFromQueries(getPlaylists);
        results.forEach(playlistList => {
            expect(playlistList).not.toBeNull();
            playlistList?.forEach(playlist => (
                Object.values(playlist).forEach(val => (
                    expect(val).toBeTruthy()
                ))
            ));
        });
    });

    it("returns null on no playlists results", async () => {
        const playlists = await getPlaylists(faker.git.commitSha());
        expect(playlists).toBeNull();
    });
});

describe("artists", () => {
    it("returns youtube artists with all data correctly", async () => {
        const results = await resFromQueries(getArtists);
        results.forEach(artistList => {
            expect(artistList).not.toBeNull();
            artistList?.forEach(artist => (
                Object.values(artist).forEach(val => (
                    expect(val).toBeTruthy()
                ))
            ));
        });
    });

    it("returns null on no artists results", async () => {
        const artists = await getArtists(faker.git.commitSha());
        expect(artists).toBeNull();
    });
});

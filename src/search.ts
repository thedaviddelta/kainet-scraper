import client from "./utils/client";
import * as parse from "./utils/parse";
import {
    Columns,
    MenuSearch,
    NavigationEndpoint,
    Overlay,
    PlaylistItemData,
    Thumbnail
} from "./utils/types";

const endpoint = "search";

const parseSearch = <T extends SearchResultData>(data: SearchData<T>) => (
    data.contents?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents?.map(el => el?.musicResponsiveListItemRenderer)
);

export type SearchData<T extends SearchResultData> = {
    contents?: {
        sectionListRenderer?: {
            contents?: {
                musicShelfRenderer?: {
                    contents?: {
                        musicResponsiveListItemRenderer: T
                    }[]
                }
            }[]
        }
    }
};

export type SearchResultData = SearchSongData | SearchVideoData | SearchAlbumData | SearchPlaylistData | SearchArtistData;

export type SearchSongData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    playlistItemData?: PlaylistItemData
};

export type SearchVideoData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    playlistItemData?: PlaylistItemData
};

export type SearchPlaylistData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    menu?: MenuSearch,
    overlay?: Overlay
    navigationEndpoint?: NavigationEndpoint
};

export type SearchAlbumData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    menu?: MenuSearch,
    overlay?: Overlay
    navigationEndpoint?: NavigationEndpoint
};

export type SearchArtistData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    navigationEndpoint?: NavigationEndpoint
};

interface Song {
    id?: string,
    title?: string,
    artist?: string,
    album?: string,
    duration?: number,
    durationText?: string,
    thumbnail?: (string|undefined)[]
}

interface Video {
    id?: string,
    title?: string,
    artist?: string,
    duration?: number,
    durationText?: string,
    thumbnail?: (string|undefined)[],
    views?: bigint
}

interface Album {
    id?: string,
    browseId?: string,
    title?: string,
    artist?: string,
    thumbnail?: (string|undefined)[],
    year?: string
}

interface Playlist {
    id?: string,
    browseId?: string,
    title?: string,
    thumbnail?: (string|undefined)[],
    songCount?: number
}

interface Artist {
    id?: string,
    name?: string,
    thumbnail?: (string|undefined)[],
    subCount?: bigint
}

const parseId = {
    songOrVideo: (data?: SearchSongData | SearchVideoData) => (
        data?.playlistItemData?.videoId
        ?? data?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId
    ),
    albumOrPlaylist: (data?: SearchAlbumData | SearchPlaylistData) => (
        data?.menu?.menuRenderer?.items?.[4]?.menuNavigationItemRenderer?.toggleMenuServiceItemRenderer?.toggledServiceEndpoint?.likeEndpoint?.target?.playlistId
        ?? data?.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId
    )
};

const scrape = {
    songs: (data?: SearchSongData): Song => ({
        id: parseId.songOrVideo(data),
        title: parse.text(data?.flexColumns, 0, 0),
        artist: parse.text(data?.flexColumns, 1, 0),
        album: parse.text(data?.flexColumns, 1, -3),
        duration: parse.duration.fromText(parse.text(data?.flexColumns, 1, -1)),
        durationText: parse.text(data?.flexColumns, 1, -1),
        thumbnail: parse.thumbnails(data?.thumbnail),
    }),
    videos: (data?: SearchVideoData): Video => ({
        id: parseId.songOrVideo(data),
        title: parse.text(data?.flexColumns, 0, 0),
        artist: parse.text(data?.flexColumns, 1, 0),
        duration: parse.duration.fromText(parse.text(data?.flexColumns, 1, -1)),
        durationText: parse.text(data?.flexColumns, 1, -1),
        thumbnail: parse.thumbnails(data?.thumbnail),
        views: parse.num.big(parse.text(data?.flexColumns, 1, -3))
    }),
    albums: (data?: SearchAlbumData): Album => ({
        id: parseId.albumOrPlaylist(data),
        browseId: parse.id.browse(data),
        title: parse.text(data?.flexColumns, 0, 0),
        artist: parse.text(data?.flexColumns, 1, 2),
        thumbnail: parse.thumbnails(data?.thumbnail),
        year: parse.text(data?.flexColumns, 1, -1)
    }),
    playlist: (data?: SearchPlaylistData): Playlist => ({
        id: parseId.albumOrPlaylist(data),
        browseId: parse.id.browse(data),
        title: parse.text(data?.flexColumns, 0, 0),
        thumbnail: parse.thumbnails(data?.thumbnail),
        songCount: parse.num.simple(parse.text(data?.flexColumns, 1, 2))
    }),
    artist: (data?: SearchArtistData): Artist => ({
        id: parse.id.browse(data),
        name: parse.text(data?.flexColumns, 0, 0),
        thumbnail: parse.thumbnails(data?.thumbnail),
        subCount: parse.num.big(parse.text(data?.flexColumns, 1, 2))
    })
};

export const getSongs = (query: string): Promise<Song[] | null> => (
    client(endpoint, {
        params: "Eg-KAQwIARAAGAAgACgAMABqChAEEAUQAxAKEAk%3D",
        query
    }).then(res =>
        parseSearch<SearchSongData>(res.data)?.map(scrape.songs) ?? null
    ).catch(
        () => null
    )
);

export const getVideos = (query: string): Promise<Video[] | null> => (
    client(endpoint, {
        params: "Eg-KAQwIABABGAAgACgAMABqChAEEAUQAxAKEAk%3D",
        query
    }).then(res =>
        parseSearch<SearchVideoData>(res.data)?.map(scrape.videos) ?? null
    ).catch(
        () => null
    )
);

export const getAlbums = (query: string): Promise<Album[] | null> => (
    client(endpoint, {
        params: "Eg-KAQwIABAAGAEgACgAMABqChAEEAUQAxAKEAk%3D",
        query
    }).then(res =>
        parseSearch<SearchAlbumData>(res.data)?.map(scrape.albums) ?? null
    ).catch(
        () => null
    )
);

export const getPlaylists = (query: string): Promise<Playlist[] | null> => (
    client(endpoint, {
        params: "Eg-KAQwIABAAGAAgACgBMABqChAEEAUQAxAKEAk%3D",
        query
    }).then(res =>
        parseSearch<SearchPlaylistData>(res.data)?.map(scrape.playlist) ?? null
    ).catch(
        () => null
    )
);

export const getArtists = (query: string): Promise<Artist[] | null> => (
    client(endpoint, {
        params: "Eg-KAQwIABAAGAAgASgAMABqChAEEAUQAxAKEAk%3D",
        query
    }).then(res =>
        parseSearch<SearchArtistData>(res.data)?.map(scrape.artist) ?? null
    ).catch(
        () => null
    )
);

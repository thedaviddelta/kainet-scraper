import request from "./utils/request";
import * as parse from "./utils/parse";
import {
    YtMusicSong,
    YtMusicVideo,
    YtMusicAlbum,
    YtMusicPlaylist,
    YtMusicArtist
} from "./utils/interfaces";
import {
    Columns,
    MenuSearch,
    NavigationEndpoint,
    Overlay,
    PlaylistItemData,
    Thumbnail
} from "./utils/types";

type SearchData<T extends SearchResultData> = {
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

type SearchResults = {
    songs: SearchSongData,
    videos: SearchVideoData,
    albums: SearchAlbumData,
    playlists: SearchPlaylistData,
    artists: SearchArtistData
};

type SearchTypes = keyof SearchResults;

type SearchResultData = SearchResults[SearchTypes];

type SearchSongData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    playlistItemData?: PlaylistItemData
};

type SearchVideoData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    playlistItemData?: PlaylistItemData
};

type SearchPlaylistData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    menu?: MenuSearch,
    overlay?: Overlay
    navigationEndpoint?: NavigationEndpoint
};

type SearchAlbumData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    menu?: MenuSearch,
    overlay?: Overlay
    navigationEndpoint?: NavigationEndpoint
};

type SearchArtistData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: Thumbnail,
    navigationEndpoint?: NavigationEndpoint
};

const parseSearch = <T extends SearchResultData>(data: SearchData<T>) => (
    data.contents?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents?.map(el => el?.musicResponsiveListItemRenderer)
);

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

const scrape: Record<
    SearchTypes,
    (data?: SearchResults[SearchTypes]) => SearchModels[SearchTypes]
> = {
    songs: (data?: SearchSongData): YtMusicSong => ({
        id: parseId.songOrVideo(data)!,
        title: parse.text(data?.flexColumns, 0, 0)!,
        artist: parse.text(data?.flexColumns, 1, 0),
        album: parse.text(data?.flexColumns, 1, -3),
        duration: parse.duration.fromText(parse.text(data?.flexColumns, 1, -1)),
        durationText: parse.text(data?.flexColumns, 1, -1),
        thumbnail: parse.thumbnails(data?.thumbnail),
    }),
    videos: (data?: SearchVideoData): YtMusicVideo => ({
        id: parseId.songOrVideo(data)!,
        title: parse.text(data?.flexColumns, 0, 0)!,
        artist: parse.text(data?.flexColumns, 1, 0),
        duration: parse.duration.fromText(parse.text(data?.flexColumns, 1, -1)),
        durationText: parse.text(data?.flexColumns, 1, -1),
        thumbnail: parse.thumbnails(data?.thumbnail),
        views: parse.num.big(parse.text(data?.flexColumns, 1, -3))
    }),
    albums: (data?: SearchAlbumData): YtMusicAlbum => ({
        id: parseId.albumOrPlaylist(data)!,
        browseId: parse.id.browse(data)!,
        title: parse.text(data?.flexColumns, 0, 0)!,
        artist: parse.text(data?.flexColumns, 1, 2),
        thumbnail: parse.thumbnails(data?.thumbnail),
        year: parse.text(data?.flexColumns, 1, -1)
    }),
    playlists: (data?: SearchPlaylistData): YtMusicPlaylist => ({
        id: parseId.albumOrPlaylist(data)!,
        browseId: parse.id.browse(data)!,
        title: parse.text(data?.flexColumns, 0, 0)!,
        thumbnail: parse.thumbnails(data?.thumbnail),
        songCount: parse.num.simple(parse.text(data?.flexColumns, 1, 2))
    }),
    artists: (data?: SearchArtistData): YtMusicArtist => ({
        id: parse.id.browse(data)!,
        name: parse.text(data?.flexColumns, 0, 0)!,
        thumbnail: parse.thumbnails(data?.thumbnail),
        subCount: parse.num.big(parse.text(data?.flexColumns, 1, 2))
    })
};

type SearchModels = {
    songs: YtMusicSong,
    videos: YtMusicVideo,
    albums: YtMusicAlbum,
    playlists: YtMusicPlaylist,
    artists: YtMusicArtist
};

const searchParams: Record<
    SearchTypes,
    string
> = {
    songs: "Eg-KAQwIARAAGAAgACgAMABqChAEEAUQAxAKEAk%3D",
    videos: "Eg-KAQwIABABGAAgACgAMABqChAEEAUQAxAKEAk%3D",
    albums: "Eg-KAQwIABAAGAEgACgAMABqChAEEAUQAxAKEAk%3D",
    playlists: "Eg-KAQwIABAAGAAgACgBMABqChAEEAUQAxAKEAk%3D",
    artists: "Eg-KAQwIABAAGAAgASgAMABqChAEEAUQAxAKEAk%3D"
};

export const SearchType: Record<
    Uppercase<SearchTypes>,
    SearchTypes
> = {
    SONGS: "songs",
    VIDEOS: "videos",
    ALBUMS: "albums",
    PLAYLISTS: "playlists",
    ARTISTS: "artists"
};

export const search = <T extends SearchTypes>(type: T, query: string) => (
    request("search").with({ params: searchParams[type], query })
        .then(res =>
            parseSearch<SearchResults[T]>(res.data)?.map(
                el => scrape[type](el) as SearchModels[T]
            ) ?? null
        ).catch(
            () => null
        )
);

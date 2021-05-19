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
    ThumbnailSearch
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

type SearchResultData = SearchResults[keyof SearchResults];

type SearchSongData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: ThumbnailSearch,
    playlistItemData?: PlaylistItemData
};

type SearchVideoData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: ThumbnailSearch,
    playlistItemData?: PlaylistItemData
};

type SearchPlaylistData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: ThumbnailSearch,
    menu?: MenuSearch,
    overlay?: Overlay
    navigationEndpoint?: NavigationEndpoint
};

type SearchAlbumData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: ThumbnailSearch,
    menu?: MenuSearch,
    overlay?: Overlay
    navigationEndpoint?: NavigationEndpoint
};

type SearchArtistData = {
    flexColumns?: Columns<"Flex">,
    thumbnail?: ThumbnailSearch,
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
        type: "song",
        id: parseId.songOrVideo(data)!,
        title: parse.text.columns(data?.flexColumns, 0, 0)!,
        artist: parse.text.columns(data?.flexColumns, 1, 0),
        album: parse.text.columns(data?.flexColumns, 1, -3),
        duration: parse.duration.fromText(parse.text.columns(data?.flexColumns, 1, -1)),
        durationText: parse.text.columns(data?.flexColumns, 1, -1),
        thumbnails: parse.thumbnails(data?.thumbnail?.musicThumbnailRenderer?.thumbnail)
    }),
    videos: (data?: SearchVideoData): YtMusicVideo => ({
        type: "video",
        id: parseId.songOrVideo(data)!,
        title: parse.text.columns(data?.flexColumns, 0, 0)!,
        artist: parse.text.columns(data?.flexColumns, 1, 0),
        duration: parse.duration.fromText(parse.text.columns(data?.flexColumns, 1, -1)),
        durationText: parse.text.columns(data?.flexColumns, 1, -1),
        thumbnails: parse.thumbnails(data?.thumbnail?.musicThumbnailRenderer?.thumbnail),
        views: parse.num.big(parse.text.columns(data?.flexColumns, 1, -3))?.toString()
    }),
    albums: (data?: SearchAlbumData): YtMusicAlbum => ({
        type: "album",
        id: parseId.albumOrPlaylist(data)!,
        browseId: parse.id.browse(data)!,
        title: parse.text.columns(data?.flexColumns, 0, 0)!,
        artist: parse.text.columns(data?.flexColumns, 1, 2),
        thumbnails: parse.thumbnails(data?.thumbnail?.musicThumbnailRenderer?.thumbnail),
        year: parse.text.columns(data?.flexColumns, 1, -1)
    }),
    playlists: (data?: SearchPlaylistData): YtMusicPlaylist => ({
        type: "playlist",
        id: parseId.albumOrPlaylist(data)!,
        browseId: parse.id.browse(data)!,
        title: parse.text.columns(data?.flexColumns, 0, 0)!,
        thumbnails: parse.thumbnails(data?.thumbnail?.musicThumbnailRenderer?.thumbnail),
        trackCount: parse.num.simple(parse.text.columns(data?.flexColumns, 1, 2))
    }),
    artists: (data?: SearchArtistData): YtMusicArtist => ({
        type: "artist",
        id: parse.id.browse(data)!,
        name: parse.text.columns(data?.flexColumns, 0, 0)!,
        thumbnails: parse.thumbnails(data?.thumbnail?.musicThumbnailRenderer?.thumbnail),
        subCount: parse.num.big(parse.text.columns(data?.flexColumns, 1, 2))?.toString()
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

export const SearchType = {
    SONGS: "songs",
    VIDEOS: "videos",
    ALBUMS: "albums",
    PLAYLISTS: "playlists",
    ARTISTS: "artists"
} as const;

export type SearchTypes = typeof SearchType[keyof typeof SearchType];

/**
 * Retrieves a list of search results based on the queried type and the query text
 * @param type - The type of item to search, as listed in {@link SearchType}
 * @param query - The text to query for
 * @returns An array of elements of the specified type
 */
export const search = <T extends SearchTypes>(type: T, query: string): Promise<SearchModels[T][]> => (
    request("search").with({ params: searchParams[type], query })
        .then(res =>
            parseSearch<SearchResults[T]>(
                res.data
            )?.map(result =>
                scrape[type](result) as SearchModels[T]
            )?.filter(
                parse.filter
            )?.map(
                parse.undefinedFields
            ) ?? []
        ).catch(
            () => []
        )
);

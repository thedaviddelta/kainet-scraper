import request from "./utils/request";
import * as parse from "./utils/parse";
import * as filter from "./utils/filter";
import {
    YtMusicAlbum,
    YtMusicPlaylist,
    YtMusicSong,
    YtMusicVideo
} from "./utils/interfaces";
import {
    MusicResponsiveListItemRenderer,
    Header,
    MusicTrack,
    MusicAlbumRelease
} from "./utils/types";

type PlaylistData = {
    contents?: {
        singleColumnBrowseResultsRenderer?: {
            tabs?: {
                tabRenderer?: {
                    content?: {
                        sectionListRenderer?: {
                            contents?: {
                                [key in "musicShelfRenderer" | "musicPlaylistShelfRenderer"]?: {
                                    contents?: {
                                        musicResponsiveListItemRenderer?: MusicResponsiveListItemRenderer
                                    }[]
                                }
                            }[]
                        }
                    }
                }
            }[]
        }
    },
    header?: Header
};

type AlbumData = {
    frameworkUpdates?: {
        entityBatchUpdate?: {
            mutations?: {
                payload?: {
                    musicTrack?: MusicTrack,
                    musicAlbumRelease?: MusicAlbumRelease
                }
            }[]
        }
    }
};

const parsePlaylist = {
    songs: (data?: PlaylistData) => {
        const content = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0];
        const renderer = content?.musicPlaylistShelfRenderer ?? content?.musicShelfRenderer;
        return renderer?.contents?.map(el => scrape.playlistSong(el?.musicResponsiveListItemRenderer))?.filter(Boolean) ?? [];
    },
    id: (header?: Header) => (
        header?.musicDetailHeaderRenderer?.menu?.menuRenderer?.items?.[0]?.menuNavigationItemRenderer?.navigationEndpoint?.watchPlaylistEndpoint?.playlistId
    )
};

const parseAlbum = {
    info: (data?: AlbumData) => (
        data?.frameworkUpdates?.entityBatchUpdate?.mutations?.find(el => el?.payload?.musicAlbumRelease)?.payload?.musicAlbumRelease
    ),
    songs: (data?: AlbumData) => (
        data?.frameworkUpdates?.entityBatchUpdate?.mutations?.map(el => el?.payload?.musicTrack)?.filter(Boolean)?.map(scrape.albumSong) ?? []
    )
};

const scrape = {
    playlist: (data: PlaylistData | undefined, browseId: string): YtMusicPlaylist => ({
        id: parsePlaylist.id(data?.header)!,
        browseId,
        title: parse.text.header(data?.header, 0)!,
        thumbnails: parse.thumbnails(data?.header?.musicDetailHeaderRenderer?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail),
        songCount: parse.num.simple(parse.text.header(data?.header, 0, "secondSubtitle")),
        songs: parsePlaylist.songs(data).filter(filter.songs)
    }),
    playlistSong: (song?: MusicResponsiveListItemRenderer): YtMusicSong & YtMusicVideo => ({
        id: song?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId!,
        title: parse.text.columns(song?.flexColumns, 0, 0)!,
        artist: parse.text.columns(song?.flexColumns, 1, 0),
        album: parse.text.columns(song?.flexColumns, 2, 0),
        duration: parse.duration.fromText(parse.text.columns(song?.fixedColumns, 0, 0, "Fixed")),
        durationText: parse.text.columns(song?.fixedColumns, 0, 0, "Fixed"),
        thumbnails: parse.thumbnails(song?.thumbnail?.musicThumbnailRenderer?.thumbnail)
    }),
    album: (data: AlbumData | undefined, browseId: string): YtMusicAlbum | undefined => {
        const info = parseAlbum.info(data);
        return info && {
            id: info.audioPlaylistId!,
            browseId,
            title: info.title!,
            thumbnails: parse.thumbnails(info.thumbnailDetails),
            artist: info.artistDisplayName,
            year: info.releaseDate?.year?.toString(),
            songs: parseAlbum.songs(data).filter(filter.songs)
        };
    },
    albumAsPlaylist: (data: PlaylistData | undefined, browseId: string): YtMusicAlbum => ({
        id: parsePlaylist.id(data?.header)!,
        browseId,
        title: parse.text.header(data?.header, 0)!,
        thumbnails: parse.thumbnails(data?.header?.musicDetailHeaderRenderer?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail),
        artist: parse.text.header(data?.header, 2, "subtitle"),
        year: parse.text.header(data?.header, -1, "subtitle"),
        songs: parsePlaylist.songs(data).filter(filter.songs)
    }),
    albumSong: (song?: MusicTrack): YtMusicSong => ({
        id: song?.videoId!,
        title: song?.title!,
        artist: song?.artistNames,
        duration: song?.lengthMs && Math.floor(song?.lengthMs / 1000),
        durationText: parse.duration.toText(song?.lengthMs && Math.floor(song?.lengthMs / 1000)),
        thumbnails: parse.thumbnails(song?.thumbnailDetails)
    })
};

/**
 * Retrieves a YTMusic playlist containing a list with its music
 * @param browseId - The internal YTMusic ID for the playlist, as obtained in the search
 * @returns A YTMusic playlist item with an array of both YTMusic songs & videos, or null if something went wrong
 */
export const getPlaylist = (browseId: string): Promise<YtMusicPlaylist | null> => (
    request("browse").with({ browseId })
        .then(res =>
            scrape.playlist(res.data, browseId)
        ).then(list =>
            filter.playlists(list) ? list : null
        ).catch(
            () => null
        )
);

/**
 * Retrieves a YTMusic album containing a list with its songs
 * @param browseId - The internal YTMusic ID for the album, as obtained in the search
 * @returns A YTMusic album item with an array of the songs, or null if something went wrong
 */
export const getAlbum = (browseId: string): Promise<YtMusicAlbum | null> => (
    request("browse").with({ browseId })
        .then(res =>
            scrape.album(res.data, browseId) ?? scrape.albumAsPlaylist(res.data, browseId)
        ).then(list =>
            filter.albums(list) ? list : null
        ).catch(
            () => null
        )
);

import request from "./utils/request";
import * as parse from "./utils/parse";
import {
    YtMusicAlbum,
    YtMusicPlaylist,
    YtMusicSong,
    YtMusicTrack
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
    tracks: (data?: PlaylistData) => {
        const content = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.[0];
        const renderer = content?.musicPlaylistShelfRenderer ?? content?.musicShelfRenderer;
        return renderer?.contents?.map(el => scrape.playlistTrack(el?.musicResponsiveListItemRenderer))?.filter(Boolean) ?? [];
    },
    id: (header?: Header) => (
        header?.musicDetailHeaderRenderer?.menu?.menuRenderer?.items?.[0]?.menuNavigationItemRenderer?.navigationEndpoint?.watchPlaylistEndpoint?.playlistId
    )
};

const parseAlbum = {
    info: (data?: AlbumData) => (
        data?.frameworkUpdates?.entityBatchUpdate?.mutations?.find(el => el?.payload?.musicAlbumRelease)?.payload?.musicAlbumRelease
    ),
    tracks: (data?: AlbumData) => (
        data?.frameworkUpdates?.entityBatchUpdate?.mutations?.map(el => el?.payload?.musicTrack)?.filter(Boolean)?.map(scrape.albumTrack) ?? []
    )
};

const scrape = {
    playlist: (data: PlaylistData | undefined, browseId: string): YtMusicPlaylist => ({
        type: "playlist",
        id: parsePlaylist.id(data?.header)!,
        browseId,
        title: parse.text.header(data?.header, 0)!,
        thumbnails: parse.thumbnails(data?.header?.musicDetailHeaderRenderer?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail),
        trackCount: parse.num.simple(parse.text.header(data?.header, 0, "secondSubtitle")),
        tracks: parsePlaylist.tracks(data).filter(parse.filter).map(parse.undefinedFields)
    }),
    playlistTrack: (song?: MusicResponsiveListItemRenderer): YtMusicTrack => ({
        type: parse.text.columns(song?.flexColumns, 2, 0)
            ? "song"
            : "video",
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
            type: "album",
            id: info.audioPlaylistId!,
            browseId,
            title: info.title!,
            thumbnails: parse.thumbnails(info.thumbnailDetails),
            artist: info.artistDisplayName,
            year: info.releaseDate?.year?.toString(),
            tracks: parseAlbum.tracks(data).filter(parse.filter).map(parse.undefinedFields)
        };
    },
    albumAsPlaylist: (data: PlaylistData | undefined, browseId: string): YtMusicAlbum => ({
        type: "album",
        id: parsePlaylist.id(data?.header)!,
        browseId,
        title: parse.text.header(data?.header, 0)!,
        thumbnails: parse.thumbnails(data?.header?.musicDetailHeaderRenderer?.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail),
        artist: parse.text.header(data?.header, 2, "subtitle"),
        year: parse.text.header(data?.header, -1, "subtitle"),
        tracks: parsePlaylist.tracks(data).filter(parse.filter).map(track =>
            (track.type = "song") && parse.undefinedFields(track) as YtMusicSong
        )
    }),
    albumTrack: (song?: MusicTrack): YtMusicSong => ({
        type: "song",
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
        .doing(res => {
            const list = scrape.playlist(res.data, browseId);
            return parse.filter(list)
                ? parse.undefinedFields(list)
                : null;
        }, null)
);

/**
 * Retrieves a YTMusic album containing a list with its songs
 * @param browseId - The internal YTMusic ID for the album, as obtained in the search
 * @returns A YTMusic album item with an array of the songs, or null if something went wrong
 */
export const getAlbum = (browseId: string): Promise<YtMusicAlbum | null> => (
    request("browse").with({ browseId })
        .doing(res => {
            const list = scrape.album(res.data, browseId) ?? scrape.albumAsPlaylist(res.data, browseId);
            return parse.filter(list)
                ? parse.undefinedFields(list)
                : null;
        }, null)
);

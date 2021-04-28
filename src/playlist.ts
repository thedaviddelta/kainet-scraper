import request from "./utils/request";
import * as parse from "./utils/parse";
import { YtMusicSong, YtMusicVideo } from "./utils/interfaces";
import { Columns, Thumbnail } from "./utils/types";

type PlaylistData = {
    contents?: {
        singleColumnBrowseResultsRenderer?: {
            tabs?: {
                tabRenderer?: {
                    content?: {
                        sectionListRenderer?: {
                            contents?: {
                                musicPlaylistShelfRenderer?: {
                                    contents?: {
                                        musicResponsiveListItemRenderer?: {
                                            fixedColumns?: Columns<"Fixed">,
                                            flexColumns?: Columns<"Flex">,
                                            thumbnail?: Thumbnail
                                        }
                                    }[]
                                }
                            }[]
                        }
                    }
                }
            }[]
        }
    }
};

const parsePlaylist = (data: PlaylistData) => (
    data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
     ?.contents?.[0]?.musicPlaylistShelfRenderer?.contents?.map(el => el?.musicResponsiveListItemRenderer)
);

/**
 * Retrieves the music contained in a YTMusic playlist
 * @param browseId - The internal YTMusic ID for the playlist, as obtained in the search
 * @returns An array of both YTMusic songs & videos, depending on the found item, or null if something went wrong
 */
export const getMusicFromPlaylist = (browseId: string): Promise<(YtMusicSong & YtMusicVideo)[] | null> => (
    request("browse").with({ browseId })
        .then(res =>
            parsePlaylist(res.data)?.map(song => ({
                id: song?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId!,
                title: parse.text(song?.flexColumns, 0, 0)!,
                artist: parse.text(song?.flexColumns, 1, 0),
                album: parse.text(song?.flexColumns, 2, 0),
                duration: parse.duration.fromText(parse.text(song?.fixedColumns, 0, 0, "Fixed")),
                durationText: parse.text(song?.fixedColumns, 0, 0, "Fixed"),
                thumbnail: parse.thumbnails(song?.thumbnail)
            })) ?? null
        ).catch(
            () => null
        )
);

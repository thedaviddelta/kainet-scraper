import client from "./utils/client";
import * as parse from "./utils/parse";
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

// type PlaylistResultData = {
//     fixedColumns?: Columns<"Fixed">,
//     flexColumns?: Columns<"Flex">,
//     thumbnail?: Thumbnail
// };

export interface Song {
    id?: string,
    title?: string,
    artist?: string,
    album?: string,
    duration?: number,
    durationText?: string,
    thumbnail?: (string|undefined)[]
}

export interface Video {
    id?: string,
    title?: string,
    artist?: string,
    duration?: number,
    durationText?: string,
    thumbnail?: (string|undefined)[],
    views?: bigint
}

const parsePlaylist = (data: PlaylistData) => (
    data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer
     ?.contents?.[0]?.musicPlaylistShelfRenderer?.contents?.map(el => el?.musicResponsiveListItemRenderer)
);

export const getSongs = (browseId: string): Promise<Song[] | Video[] | null> => (
    client("browse", { browseId }).then(res =>
        parsePlaylist(res.data)?.map(song => ({
            id: song?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId,
            title: parse.text(song?.flexColumns, 0, 0),
            artist: parse.text(song?.flexColumns, 1, 0),
            album: parse.text(song?.flexColumns, 2, 0),
            duration: parse.duration.fromText(parse.text(song?.fixedColumns, 0, 0, "Fixed")),
            durationText: parse.text(song?.fixedColumns, 0, 0, "Fixed"),
            thumbnail: parse.thumbnails(song?.thumbnail)
        })) ?? null
    )
);

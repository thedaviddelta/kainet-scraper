import client from "./utils/client";
import * as parse from "./utils/parse";
import { MusicTrack } from "./utils/types";

type AlbumData = {
    frameworkUpdates?: {
        entityBatchUpdate?: {
            mutations?: {
                payload?: {
                    musicTrack?: MusicTrack
                }
            }[]
        }
    }
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

const parseAlbum = (data: AlbumData) => (
    data?.frameworkUpdates?.entityBatchUpdate?.mutations?.map(el => el?.payload?.musicTrack)
);

export const getSongs = (browseId: string): Promise<Song[] | null> => (
    client("browse", { browseId }).then(res =>
        parseAlbum(res.data)?.filter(Boolean)?.map(song => ({
            id: song?.videoId,
            title: song?.title,
            artist: song?.artistNames,
            duration: song?.lengthMs && Math.floor(song?.lengthMs / 1000),
            durationText: parse.duration.toText(song?.lengthMs && Math.floor(song?.lengthMs / 1000)),
            thumbnail: song?.thumbnailDetails?.thumbnails?.map(t => t?.url)
        })) ?? null
    )
);

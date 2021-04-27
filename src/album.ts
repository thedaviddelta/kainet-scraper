import request from "./utils/request";
import * as parse from "./utils/parse";
import { YtMusicSong } from "./utils/interfaces";
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

const parseAlbum = (data: AlbumData) => (
    data?.frameworkUpdates?.entityBatchUpdate?.mutations?.map(el => el?.payload?.musicTrack)
);

export const getSongsFromAlbum = (browseId: string): Promise<YtMusicSong[] | null> => (
    request("browse").with({ browseId })
        .then(res =>
            parseAlbum(res.data)?.filter(Boolean)?.map(song => ({
                id: song?.videoId!,
                title: song?.title!,
                artist: song?.artistNames,
                duration: song?.lengthMs && Math.floor(song?.lengthMs / 1000),
                durationText: parse.duration.toText(song?.lengthMs && Math.floor(song?.lengthMs / 1000)),
                thumbnail: song?.thumbnailDetails?.thumbnails?.map(t => t?.url)?.filter((url): url is string => !!url) ?? []
            })) ?? null
        )?.catch(
            () => null
        )
);

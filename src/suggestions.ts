import request from "./utils/request";
import * as parse from "./utils/parse";
import { YtMusicPlaylist } from "./utils/interfaces";
import { MusicTwoRowItemRenderer } from "./utils/types";

type SuggestionsData = {
    contents?: {
        singleColumnBrowseResultsRenderer?: {
            tabs?: {
                tabRenderer?: {
                    content?: {
                        sectionListRenderer?: {
                            contents?: {
                                [key in "musicCarouselShelfRenderer" | "musicImmersiveCarouselShelfRenderer"]?: {
                                    contents?: {
                                        musicTwoRowItemRenderer?: MusicTwoRowItemRenderer
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

const parseSuggestions = (data: SuggestionsData) => (
    data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents
     ?.map(el => el?.musicCarouselShelfRenderer?.contents ?? el?.musicImmersiveCarouselShelfRenderer?.contents)
);

const scrapePlaylist = (item?: { musicTwoRowItemRenderer?: MusicTwoRowItemRenderer }): YtMusicPlaylist => ({
    id: item?.musicTwoRowItemRenderer?.menu?.menuRenderer?.items?.[4]?.toggleMenuServiceItemRenderer?.toggledServiceEndpoint?.likeEndpoint?.target?.playlistId!,
    browseId: parse.id.browse(item?.musicTwoRowItemRenderer)!,
    title: item?.musicTwoRowItemRenderer?.title?.runs?.[0]?.text!,
    thumbnails: parse.thumbnails(item?.musicTwoRowItemRenderer?.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail),
});

/**
 * Retrieves a list of suggested playlist, as on the YTMusic homepage
 * @returns An array of playlists, or null if something went wrong
 */
export const retrieveSuggestions = (): Promise<YtMusicPlaylist[] | null> => (
    request("browse").with()
        .then(res =>
            parseSuggestions(res.data)?.flatMap(row => (
                row?.map(scrapePlaylist)
            ))?.filter(
                (el): el is YtMusicPlaylist => !!el
            ) ?? null
        ).catch(
            () => null
        )
);

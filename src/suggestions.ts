import client from "./utils/client";
import * as parse from "./utils/parse";
import { MenuSuggestions, NavigationEndpoint, Thumbnail, Title } from "./utils/types";

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
                                        musicTwoRowItemRenderer?: {
                                            title?: Title,
                                            menu?: MenuSuggestions,
                                            thumbnailRenderer?: Thumbnail,
                                            navigationEndpoint?: NavigationEndpoint
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

interface Playlist {
    id?: string,
    browseId?: string,
    title?: string,
    thumbnail?: (string|undefined)[]
}

const parseSuggestions = (data: SuggestionsData) => (
    data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents
     ?.map(el => el?.musicCarouselShelfRenderer?.contents ?? el?.musicImmersiveCarouselShelfRenderer?.contents)
);

export const retrieve = (): Promise<Playlist[] | null> => (
    client("browse").then(res =>
        parseSuggestions(res.data)?.flatMap(row => (
            row?.map(item => ({
                id: item?.musicTwoRowItemRenderer?.menu?.menuRenderer?.items?.[4]?.toggleMenuServiceItemRenderer?.toggledServiceEndpoint?.likeEndpoint?.target?.playlistId,
                browseId: parse.id.browse(item?.musicTwoRowItemRenderer),
                title: item?.musicTwoRowItemRenderer?.title?.runs?.[0]?.text,
                thumbnail: parse.thumbnails(item?.musicTwoRowItemRenderer?.thumbnailRenderer)
            }) as Playlist)
        ))?.filter(
            (el): el is Playlist => !!el
        ) ?? null
    )
);

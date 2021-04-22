import client from "./client";

const url = "browse?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";

type BrowseData = {
    contents?: {
        singleColumnBrowseResultsRenderer?: {
            tabs?: {
                tabRenderer?: {
                    content?: {
                        sectionListRenderer?: {
                            contents?: ResultData[]
                        }
                    }
                }
            }[]
        }
    }
};

type ResultData = {
    [key in "musicCarouselShelfRenderer" | "musicImmersiveCarouselShelfRenderer"]?: {
        contents?: {
            musicTwoRowItemRenderer?: {
                title?: {
                    runs: {
                        text?: string
                    }[]
                },
                menu?: {
                    menuRenderer?: {
                        items?: {
                            toggleMenuServiceItemRenderer?: {
                                toggledServiceEndpoint?: {
                                    likeEndpoint?: {
                                        target?: {
                                            playlistId?: string
                                        }
                                    }
                                }
                            }
                        }[]
                    }
                },
                thumbnailRenderer?: {
                    musicThumbnailRenderer?: {
                        thumbnail?: {
                            thumbnails?: {
                                url?: string
                            }[]
                        }
                    }
                }
            }
        }[]
    }
};

interface Playlist {
    id?: string,
    title?: string,
    thumbnail?: (string|undefined)[]
}

export const retrieve = (): Promise<Playlist[][] | null> => (
    client(url, {
        params: "Eg-KAQwIABAAGAEgACgAMABqChAEEAUQAxAKEAk%3D",
    }).then(res => {
        const data: BrowseData = res.data;
        const results = data.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents;
        return results?.map(resultData => {
            const carousel = resultData?.musicCarouselShelfRenderer ?? resultData?.musicImmersiveCarouselShelfRenderer;
            return carousel?.contents?.map(item => ({
                id: item?.musicTwoRowItemRenderer?.menu?.menuRenderer?.items?.[4]?.toggleMenuServiceItemRenderer?.toggledServiceEndpoint?.likeEndpoint?.target?.playlistId,
                title: item?.musicTwoRowItemRenderer?.title?.runs?.[0]?.text,
                thumbnail: item?.musicTwoRowItemRenderer?.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.map(t => t.url)
            }) as Playlist);
        })?.filter(
            (arr): arr is Playlist[] => !!arr
        ) ?? null;
    })
);

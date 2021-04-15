import client from "./client";

const url = "search?alt=json&key=AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";

type SearchData<T extends ResultData> = {
    contents?: {
        sectionListRenderer?: {
            contents?: {
                musicShelfRenderer?: {
                    contents?: T[]
                }
            }[]
        }
    }
};

type ResultData = SongData;

type SongData = {
    musicResponsiveListItemRenderer?: {
        flexColumns?: {
            musicResponsiveListItemFlexColumnRenderer?: {
                text?: {
                    runs?: {
                        text?: string,
                        navigationEndpoint?: {
                            watchEndpoint?: {
                                videoId?: string
                            }
                        }
                    }[]
                }
            }
        }[],
        thumbnail?: {
            musicThumbnailRenderer?: {
                thumbnail?: {
                    thumbnails?: {
                        url?: string
                    }[]
                }
            }
        }
    }
};

const parseSearch = <T extends ResultData>(data: SearchData<T>) => (
    data.contents?.sectionListRenderer?.contents?.[0]?.musicShelfRenderer?.contents
);

interface Song {
    id?: string,
    title?: string,
    artist?: string,
    album?: string,
    duration?: number,
    durationText?: string,
    thumbnail?: string
}

export const getSongs = (query: string, lang?: string): Promise<Song[] | null> => {
    const extractText = (data: SongData, colIndex: number, runIndex: number) => (
        data.musicResponsiveListItemRenderer?.flexColumns?.[colIndex]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[runIndex]?.text
    );

    const durationToSeconds = (text?: string) => {
        const parts = text?.split(":");
        if (!parts || parts.length < 2 || parts.length > 3)
            return undefined;
        if (parts.length === 3) {
            const [hours, mins, secs] = parts;
            return +hours * 3600 + +mins * 60 + +secs;
        }
        const [mins, secs] = parts;
        return +mins * 60 + +secs;
    };

    return client(
        url,
        {
            params: "Eg-KAQwIARAAGAAgACgAMABqChAEEAUQAxAKEAk%3D",
            query
        },
        lang
    ).then(res => {
        const songs = parseSearch<SongData>(res.data);
        return songs?.map(data => ({
            title: extractText(data, 0, 0),
            artist: extractText(data, 1, 0),
            album: extractText(data, 1, 2),
            durationText: extractText(data, 1, 4),
            duration: durationToSeconds(extractText(data, 1, 4)),
            id: data.musicResponsiveListItemRenderer?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId,
            thumbnail: data.musicResponsiveListItemRenderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url
        })) ?? null;
    }).catch(
        () => null
    );
};

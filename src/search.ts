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

type ResultData = SongData | VideoData | AlbumData | PlaylistData;

type SongData = {
    musicResponsiveListItemRenderer?: {
        flexColumns?: FlexColumns,
        thumbnail?: Thumbnail,
        playlistItemData?: PlaylistItemData,
    }
};

type VideoData = {
    musicResponsiveListItemRenderer?: {
        flexColumns?: FlexColumns,
        thumbnail?: Thumbnail,
        playlistItemData?: PlaylistItemData,
    }
};

type AlbumData = {
    musicResponsiveListItemRenderer?: {
        flexColumns?: FlexColumns,
        thumbnail?: Thumbnail,
        menu?: Menu,
        overlay?: Overlay
    }
};

type PlaylistData = {
    musicResponsiveListItemRenderer?: {
        flexColumns?: FlexColumns,
        thumbnail?: Thumbnail,
        menu?: Menu,
        overlay?: Overlay
    }
};

type ArtistData = {
    musicResponsiveListItemRenderer?: {
        flexColumns?: FlexColumns,
        thumbnail?: Thumbnail,
        navigationEndpoint?: NavigationEndpoint
    }
};

type FlexColumns = {
    musicResponsiveListItemFlexColumnRenderer?: {
        text?: {
            runs?: {
                text?: string,
                navigationEndpoint?: {
                    watchEndpoint?: {
                        videoId?: string
                    }
                },
                browseEndpoint?: {
                    browseId?: string
                }
            }[]
        }
    }
}[];

type Thumbnail = {
    musicThumbnailRenderer?: {
        thumbnail?: {
            thumbnails?: {
                url?: string
            }[]
        }
    }
};

type PlaylistItemData = {
    videoId?: string
};

type Menu = {
    menuRenderer?: {
        items?: {
            menuNavigationItemRenderer: {
                toggleMenuServiceItemRenderer?: {
                    toggledServiceEndpoint?: {
                        likeEndpoint?: {
                            target?: {
                                playlistId?: string
                            }
                        }
                    }
                }
            }
        }[]
    }
};

type Overlay = {
    musicItemThumbnailOverlayRenderer?: {
        content?: {
            musicPlayButtonRenderer?: {
                playNavigationEndpoint?: {
                    watchPlaylistEndpoint?: {
                        playlistId?: string
                    }
                }
            }
        }
    }
};

type NavigationEndpoint = {
    browseEndpoint?: {
        browseId?: string
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
    thumbnail?: (string|undefined)[]
}

interface Video {
    id?: string,
    title?: string,
    artist?: string,
    duration?: number,
    durationText?: string,
    thumbnail?: (string|undefined)[],
    views?: bigint
}

interface Album {
    id?: string,
    title?: string,
    artist?: string,
    thumbnail?: (string|undefined)[],
    year?: string
}

interface Playlist {
    id?: string,
    title?: string,
    thumbnail?: (string|undefined)[],
    songCount?: number
}

interface Artist {
    id?: string,
    name?: string,
    thumbnail?: (string|undefined)[],
    subCount?: bigint
}

const extract = {
    text: (data: ResultData, colIndex: number, runIndex: number) => {
        const cols = data.musicResponsiveListItemRenderer?.flexColumns;
        const currCol = cols?.[colIndex >= 0 ? colIndex : cols.length + colIndex];
        const runs = currCol?.musicResponsiveListItemFlexColumnRenderer?.text?.runs;
        return runs?.[runIndex >= 0 ? runIndex : runs.length + runIndex]?.text;
    },
    thumbnails: (data: ResultData) => (
        data.musicResponsiveListItemRenderer?.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.map(t => t.url)
    ),
    duration: (text?: string) => {
        const parts = text?.split(":");
        if (!parts || parts.length < 2 || parts.length > 3)
            return undefined;
        if (parts.length === 3) {
            const [hours, mins, secs] = parts;
            return +hours * 3600 + +mins * 60 + +secs;
        }
        const [mins, secs] = parts;
        return +mins * 60 + +secs;
    },
    num: {
        simple: (text?: string) => {
            const num = text?.replace(/\D+/, "");
            if (!num || Number.isNaN(+num))
                return undefined;
            return +num;
        },
        big: (text?: string) => {
            const multipliers = {
                "K": 1E3,
                "M": 1E6,
                "B": 1E9
            } as {
                [key: string]: number
            };

            const [, count, , multiplier] = text?.match(/([\d]+([.,][\d]+)?)\s?([KMBkmb])?/) ?? [];
            if (!count || Number.isNaN(+count))
                return undefined;
            return BigInt(Math.round(+count * 100)) * BigInt(multipliers[multiplier] ?? 1) / 100n;
        }
    },
    id: {
        songOrVideo: (data: SongData | VideoData) => (
            data.musicResponsiveListItemRenderer?.playlistItemData?.videoId
            ?? data.musicResponsiveListItemRenderer?.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId
        ),
        albumOrPlaylist: (data: AlbumData | PlaylistData) => (
            data.musicResponsiveListItemRenderer?.menu?.menuRenderer?.items?.[4]?.menuNavigationItemRenderer?.toggleMenuServiceItemRenderer?.toggledServiceEndpoint?.likeEndpoint?.target?.playlistId
            ?? data.musicResponsiveListItemRenderer?.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchPlaylistEndpoint?.playlistId
        ),
        artist: (data: ArtistData) => (
            data.musicResponsiveListItemRenderer?.navigationEndpoint?.browseEndpoint?.browseId
        )
    }
};

const parse = {
    songs: (data: SongData): Song => ({
        id: extract.id.songOrVideo(data),
        title: extract.text(data, 0, 0),
        artist: extract.text(data, 1, 0),
        album: extract.text(data, 1, -3),
        duration: extract.duration(extract.text(data, 1, -1)),
        durationText: extract.text(data, 1, -1),
        thumbnail: extract.thumbnails(data),
    }),
    videos: (data: VideoData): Video => ({
        id: extract.id.songOrVideo(data),
        title: extract.text(data, 0, 0),
        artist: extract.text(data, 1, 0),
        duration: extract.duration(extract.text(data, 1, -1)),
        durationText: extract.text(data, 1, -1),
        thumbnail: extract.thumbnails(data),
        views: extract.num.big(extract.text(data, 1, -3))
    }),
    albums: (data: AlbumData): Album => ({
        id: extract.id.albumOrPlaylist(data),
        title: extract.text(data, 0, 0),
        artist: extract.text(data, 1, 2),
        thumbnail: extract.thumbnails(data),
        year: extract.text(data, 1, 4)
    }),
    playlist: (data: PlaylistData): Playlist => ({
        id: extract.id.albumOrPlaylist(data),
        title: extract.text(data, 0, 0),
        thumbnail: extract.thumbnails(data),
        songCount: extract.num.simple(extract.text(data, 1, 2))
    }),
    artist: (data: ArtistData): Artist => ({
        id: extract.id.artist(data),
        name: extract.text(data, 0, 0),
        thumbnail: extract.thumbnails(data),
        subCount: extract.num.big(extract.text(data, 1, 2))
    })
};

export const getSongs = (query: string, lang?: string): Promise<Song[] | null> => (
    client(
        url,
        {
            params: "Eg-KAQwIARAAGAAgACgAMABqChAEEAUQAxAKEAk%3D",
            query
        },
        lang
    ).then(res =>
        parseSearch<SongData>(res.data)?.map(parse.songs) ?? null
    ).catch(
        () => null
    )
);

export const getVideos = (query: string, lang?: string): Promise<Video[] | null> => (
    client(
        url,
        {
            params: "Eg-KAQwIABABGAAgACgAMABqChAEEAUQAxAKEAk%3D",
            query
        },
        lang
    ).then(res =>
        parseSearch<VideoData>(res.data)?.map(parse.videos) ?? null
    ).catch(
        () => null
    )
);

export const getAlbums = (query: string, lang?: string): Promise<Album[] | null> => (
    client(
        url,
        {
            params: "Eg-KAQwIABAAGAEgACgAMABqChAEEAUQAxAKEAk%3D",
            query
        },
        lang
    ).then(res =>
        parseSearch<AlbumData>(res.data)?.map(parse.albums) ?? null
    ).catch(
        () => null
    )
);

export const getPlaylists = (query: string, lang?: string): Promise<Playlist[] | null> => (
    client(
        url,
        {
            params: "Eg-KAQwIABAAGAAgACgBMABqChAEEAUQAxAKEAk%3D",
            query
        },
        lang
    ).then(res =>
        parseSearch<PlaylistData>(res.data)?.map(parse.playlist) ?? null
    ).catch(
        () => null
    )
);

export const getArtists = (query: string, lang?: string): Promise<Artist[] | null> => (
    client(
        url,
        {
            params: "Eg-KAQwIABAAGAAgASgAMABqChAEEAUQAxAKEAk%3D",
            query
        },
        lang
    ).then(res =>
        parseSearch<ArtistData>(res.data)?.map(parse.artist) ?? null
    ).catch(
        () => null
    )
);

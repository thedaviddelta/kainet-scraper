export type Columns<T extends "Flex" | "Fixed"> = {
    [key in `musicResponsiveListItem${T}ColumnRenderer`]: {
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

export type Thumbnail = {
    musicThumbnailRenderer?: {
        thumbnail?: {
            thumbnails?: {
                url?: string
            }[]
        }
    }
};

export type PlaylistItemData = {
    videoId?: string
};

export type MenuCommon = {
    toggleMenuServiceItemRenderer?: {
        toggledServiceEndpoint?: {
            likeEndpoint?: {
                target?: {
                    playlistId?: string
                }
            }
        }
    }
};

export type MenuSearch = {
    menuRenderer?: {
        items?: {
            menuNavigationItemRenderer?: MenuCommon
        }[]
    }
};

export type MenuSuggestions = {
    menuRenderer?: {
        items?: MenuCommon[]
    }
};

export type Overlay = {
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

export type NavigationEndpoint = {
    browseEndpoint?: {
        browseId?: string
    }
};

export type MusicTrack = {
    id?: string,
    title?: string,
    thumbnailDetails?: {
        thumbnails?: {
            url?: string
        }[]
    },
    artistNames?: string,
    videoId?: string,
    lengthMs?: number
};

export type Title = {
    runs: {
        text?: string
    }[]
};

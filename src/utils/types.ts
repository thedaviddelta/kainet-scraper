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

export type ThumbnailCommon = {
    thumbnails?: {
        url?: string
    }[]
};

export type ThumbnailSearch = {
    musicThumbnailRenderer?: {
        thumbnail?: ThumbnailCommon
    }
};

export type ThumbnailList = {
    croppedSquareThumbnailRenderer?: {
        thumbnail?: ThumbnailCommon
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

export type MenuList = {
    menuRenderer?: {
        items?: {
            menuNavigationItemRenderer?: {
                navigationEndpoint?: {
                    watchPlaylistEndpoint?: {
                        playlistId?: string
                    }
                }
            }
        }[]
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

export type MusicTwoRowItemRenderer ={
    title?: Title,
    menu?: MenuSuggestions,
    thumbnailRenderer?: ThumbnailSearch,
    navigationEndpoint?: NavigationEndpoint
};

export type MusicResponsiveListItemRenderer = {
    fixedColumns?: Columns<"Fixed">,
    flexColumns?: Columns<"Flex">,
    thumbnail?: ThumbnailSearch
};

export type MusicTrack = {
    id?: string,
    title?: string,
    thumbnailDetails?: ThumbnailCommon,
    artistNames?: string,
    videoId?: string,
    lengthMs?: number
};

export type MusicAlbumRelease = {
    audioPlaylistId?: string
    title?: string,
    artistDisplayName?: string,
    releaseDate?: {
        year: number
    },
    thumbnailDetails?: ThumbnailCommon
};

export type Title = {
    runs: {
        text?: string
    }[]
};

export type Header = {
    musicDetailHeaderRenderer?: {
        title?: Title,
        subtitle?: Title,
        secondSubtitle?: Title,
        menu?: MenuList,
        thumbnail?: ThumbnailList
    }
};

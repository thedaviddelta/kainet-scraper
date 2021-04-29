export interface YtMusicSong {
    id: string,
    title: string,
    artist?: string,
    album?: string,
    duration?: number,
    durationText?: string,
    thumbnails: string[]
}

export interface YtMusicVideo {
    id: string,
    title: string,
    artist?: string,
    duration?: number,
    durationText?: string,
    thumbnails: string[],
    views?: bigint
}

export interface YtMusicAlbum {
    id: string,
    browseId: string,
    title: string,
    artist?: string,
    thumbnails: string[],
    year?: string,
    songs?: YtMusicSong[]
}

export interface YtMusicPlaylist {
    id: string,
    browseId: string,
    title: string,
    thumbnails: string[],
    songCount?: number,
    songs?: (YtMusicSong & YtMusicVideo)[]
}

export interface YtMusicArtist {
    id: string,
    name: string,
    thumbnails: string[],
    subCount?: bigint
}

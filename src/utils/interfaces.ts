export interface YtMusicSong {
    id: string,
    title: string,
    artist?: string,
    album?: string,
    duration?: number,
    durationText?: string,
    thumbnail: string[]
}

export interface YtMusicVideo {
    id: string,
    title: string,
    artist?: string,
    duration?: number,
    durationText?: string,
    thumbnail: string[],
    views?: bigint
}

export interface YtMusicAlbum {
    id: string,
    browseId: string,
    title: string,
    artist?: string,
    thumbnail: string[],
    year?: string
}

export interface YtMusicPlaylist {
    id: string,
    browseId: string,
    title: string,
    thumbnail: string[],
    songCount?: number
}

export interface YtMusicArtist {
    id: string,
    name: string,
    thumbnail: string[],
    subCount?: bigint
}

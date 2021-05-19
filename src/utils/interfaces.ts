export interface YtMusicSong {
    type: "song",
    id: string,
    title: string,
    artist?: string,
    album?: string,
    duration?: number,
    durationText?: string,
    thumbnails: string[]
}

export interface YtMusicVideo {
    type: "video",
    id: string,
    title: string,
    artist?: string,
    duration?: number,
    durationText?: string,
    thumbnails: string[],
    views?: string // bigint is not serializable
}

export interface YtMusicAlbum {
    type: "album",
    id: string,
    browseId: string,
    title: string,
    artist?: string,
    thumbnails: string[],
    year?: string,
    tracks?: YtMusicSong[]
}

export interface YtMusicPlaylist {
    type: "playlist",
    id: string,
    browseId: string,
    title: string,
    thumbnails: string[],
    trackCount?: number,
    tracks?: YtMusicTrack[]
}

export interface YtMusicArtist {
    type: "artist",
    id: string,
    name: string,
    thumbnails: string[],
    subCount?: string // bigint is not serializable
}

export type YtMusicElement = YtMusicSong | YtMusicVideo | YtMusicAlbum | YtMusicPlaylist | YtMusicArtist;

export type YtMusicTrack = YtMusicSong | YtMusicVideo;

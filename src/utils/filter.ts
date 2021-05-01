import {
    YtMusicSong,
    YtMusicVideo,
    YtMusicAlbum,
    YtMusicPlaylist,
    YtMusicArtist
} from "./interfaces";

export const songs = (item: YtMusicSong) => !!item.id && !!item.title;
export const videos = (item: YtMusicVideo) => !!item.id && !!item.title;
export const albums = (item: YtMusicAlbum) => !!item.id && !!item.browseId && !!item.title;
export const playlists = (item: YtMusicPlaylist) => !!item.id && !!item.browseId && !!item.title;
export const artists = (item: YtMusicArtist) => !!item.id && !!item.name;

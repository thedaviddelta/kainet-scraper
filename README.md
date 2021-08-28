<div align="center">
    <img src="img/logo.svg" width="128">
    <h1>Kainet Scraper</h1>
    <div>
        <a href="https://travis-ci.com/TheDavidDelta/kainet-scraper">
            <img src="https://travis-ci.com/TheDavidDelta/kainet-scraper.svg?branch=main" alt="Travis Build">
        </a>
        <a href="https://npmjs.com/package/kainet-scraper">
            <img alt="NPM Version" src="https://img.shields.io/npm/v/kainet-scraper">
        </a>
        <img alt="Commits since latest release" src="https://img.shields.io/github/commits-since/TheDavidDelta/kainet-scraper/v1.2.4?color=20B2AA">
        <a href="./LICENSE">
            <img src="https://img.shields.io/github/license/TheDavidDelta/kainet-scraper" alt="License">
        </a>
    </div>
    <br />
    YouTube Music scraper for <a href="https://github.com/TheDavidDelta/kainet-music" target="_blank">Kainet Music</a>
    <hr />
</div>

## Installation

Just install the package using NPM

```shell
npm i --save kainet-scraper
```

Or using Yarn

```shell
yarn add kainet-scraper
```

And import it directly using CommonJS

```javascript
const { retrieveSuggestions } = require("kainet-scraper");
```

Or using the ES6 syntax

```javascript
import { retrieveSuggestions } from "kainet-scraper";
```

The package doesn't provide a default export, but you can alternatively use the wildcard import syntax

```javascript
import * as KainetScraper from "kainet-scraper";
```


## Usage

### Interfaces

This package provides a series of TypeScript interfaces.

```typescript
export interface YtMusicSong 

export interface YtMusicVideo

export interface YtMusicAlbum

export interface YtMusicPlaylist

export interface YtMusicArtist

export type YtMusicElement // union of all

export type YtMusicTrack // union of song & video
```

You can take a look at [the complete signature here](./src/utils/interfaces.ts).

Because this is a scraper, not a public API, some of the fields may not be available in every request. The fields that are marked as required will never be `null` nor `undefined`, as the request will fail and be retried if they're missing. But the fields marked as optional may be null or undefined if they're missing from the scraped request, so make sure to cast them.

*Note: Some of the optional fields are never returned in some of the requests, i.e. when searching playlists, their `tracks` array will always be empty, as it'll only be available on the `getPlaylist` request.*

### Main API

#### Suggestions

```typescript
retrieveSuggestions(): Promise<YtMusicPlaylist[]>
```

Retrieves a list of playlists from the YTMusic suggestions section (even though they cannot be personalized for privacy reasons). This is ideal for a homepage.

*Note: The returned playlists will never contain neither `trackCount` nor `tracks`.*

```typescript
import { retrieveSuggestions } from "kainet-scraper";

const suggestions = await retrieveSuggestions();
```

#### Search

```typescript
search(type: "songs" | "videos" | "albums" | "playlists" | "artists", query: string): Promise<YtMusicElement[]>
```

Retrieves a list of search results based on the queried type and text. The result array type is narrowed from the queried type.

*Note: The returned albums will never contain `tracks`.*  
*Note: The returned playlists will never contain `tracks`.*

```typescript
import { search, SearchType } from "kainet-scraper";

const songs = await search(SearchType.SONGS, "queen");
songs[0]?.artist // type has been narrowed and TS knows they are songs
```

#### Album

```typescript
getAlbum(browseId: string): Promise<YtMusicAlbum | null>
```

Retrieves the full album information, including a list of songs.

```typescript
import { getAlbum } from "kainet-scraper";

const album = await getAlbum("MPREb_Ab6a3RgiGIy");
```

#### Playlist

```typescript
getPlaylist(browseId: string): Promise<YtMusicPlaylist | null>
```

Retrieves the full playlist information, including a list of tracks.

```typescript
import { getPlaylist } from "kainet-scraper";

const playlist = await getPlaylist("VLRDCLAK5uy_n78qsohMVeSYKIrBgWhYbHPjcepbD8YZo");
```

#### Artist

```typescript
// TODO
```

The full artist page request has still not been implemented.

### The `type` field

Every interface in this package has an only common field, the `type` field. It's an string containing the name of the type, and each interface has its own name as its only value. This way, it can be easily used for type narrowing with TypeScript.

For example, the most common situation would be to cast every track of a playlist, as they can be songs or videos, but it's also very useful if your own code uses some kind of type union.

```typescript
// TypeError because album only exists in song
const albums = playlist.tracks.map(track => track.album);

// type narrowed correctly
const albums = playlist.tracks.map(track => track.type === "song" && track.album);
```

### Other API

There are also some utility functions exported for easing the use of the package.

+ Duration

Songs and videos already have both a duration field in seconds and other formated as a string, but this exchange is very common working with time fields.

```typescript
import { parseDuration } from "kainet-scraper";

parseDuration.fromText("01:01:01"); // 3661
parseDuration.toText(3661); // "01:01:01"
parseDuration.toDetail(3661); // "1 hour & 1 minute"
```


## Related projects

+ [Kainet Music](https://github.com/TheDavidDelta/kainet-music) - The web application for which this package was built
+ [NewPipe Extractor](https://github.com/TeamNewPipe/NewPipeExtractor) - The scraper built for NewPipe in Java, which mainly inspired this one
+ [node-ytdl-core](https://github.com/fent/node-ytdl-core) - A YouTube downloader for Node, useful for complementing this package by downloading and playing the scraped tracks


## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://thedaviddelta.com/"><img src="https://avatars.githubusercontent.com/u/6679900?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David</b></sub></a><br /><a href="https://github.com/TheDavidDelta/kainet-scraper/commits?author=TheDavidDelta" title="Code">💻</a> <a href="https://github.com/TheDavidDelta/kainet-scraper/commits?author=TheDavidDelta" title="Documentation">📖</a> <a href="#design-TheDavidDelta" title="Design">🎨</a> <a href="https://github.com/TheDavidDelta/kainet-scraper/commits?author=TheDavidDelta" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!


## License

[![](https://www.gnu.org/graphics/gplv3-with-text-136x68.png)](https://www.gnu.org/licenses/agpl-3.0.html)

Copyright © 2021 [TheDavidDelta](https://github.com/TheDavidDelta) & contributors.  
This project is [GNU GPLv3](./LICENSE) licensed.

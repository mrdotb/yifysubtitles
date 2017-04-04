[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![Build Status](https://travis-ci.org/MRdotB/yifysubtitles.svg?branch=master)](https://travis-ci.org/MRdotB/yifysubtitles)

# yifysubtitles
> Download and convert subtitles in [VTT format](https://developer.mozilla.org/en/docs/Web/API/Web_Video_Text_Tracks_Format) for [YTS movies](https://yts.ag/)


## Install

```
$ npm i yifysubtitles --save
```
Or using yarn
```
$ yarn add yifysubtitles
```


## Usage

```js
const yifysubtitles = require('yifysubtitles');

yifysubtitles('tt1156398', {path: '/tmp', langs: ['en', 'fr', 'zh']})
	.then(res => {
		console.log(res);
/*
=>
res [ { lang: 'english',
    langShort: 'en',
    path: '/tmp/Zombieland.2009.720p.BrRip.x264-YIFY.vtt',
    fileName: 'Zombieland.2009.720p.BrRip.x264-YIFY.vtt' },
  { lang: 'french',
    langShort: 'fr',
    path: '/tmp/Zombieland.2009.720p.BrRip.x264-YIFY.www.subsynchro.com.vtt',
    fileName: 'Zombieland.2009.720p.BrRip.x264-YIFY.www.subsynchro.com.vtt' },
  { lang: 'chinese',
    langShort: 'zh',
    path: '/tmp/Zombieland.720p.BluRay.x264-CROSSBOW.cht.vtt',
    fileName: 'Zombieland.720p.BluRay.x264-CROSSBOW.cht.vtt' } ]
*/
	})
	.catch(err => console.log(err));
```


## API

### yifysubtitles(imdbId, [options])

Returns an `Array` of the downloaded subtitles.

#### imdbId

Type: `String`

#### options

Type: `Object`

##### langs

Type: `Array`<br>
Default: `['en']`<br>
Array of the langs wanted.

##### path

Type: `String`<br>
Default: `__dirname`<br>
The path where the subtitles are going to be stored.

##### format

Type: `String`<br>
Default: `vtt`<br>
The format of subtitles.

##### concurrency

Type: `number`<br>
Default: `Infinity`<br>
Minimum: `1`
Download multiples subtitles concurency.

## License

MIT © [Mrdotb](https://github.com/MRdotB)

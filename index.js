const fs = require('fs');
const path = require('path');
const got = require('got');
const pMap = require('p-map');
const streamz = require('streamz');
const unzipper = require('unzipper').Parse;
const srt2vtt = require('srt-to-vtt');
const langsFormat = require('./langs');

const apiUri = 'http://api.yifysubtitles.com/subs';
const downloadUri = 'http://yifysubtitles.com';
const langV = Object.values(langsFormat);
const langK = Object.keys(langsFormat);

const formatLangLong = lang => (langV[langK.indexOf(lang)]);
const formatLangShort = lang => (langK[langV.indexOf(lang)]);

const apiCall = imdbId => {
	return got(`${apiUri}/${imdbId}`, {json: true})
		.then(res => (
			(res.body.subtitles === 0) ?
				Promise.resolve({}) :
				res.body
		));
};

const langFilter = (subs, langs) => {
	return Object.keys(subs).reduce((acc, apiLang) => {
		if (langs.some(userLang => userLang === apiLang)) {
			acc[apiLang] = subs[apiLang].sort((a, b) => b.rating - a.rating)[0];
		}
		return acc;
	}, {});
};

const download = (lang, url, link) => {
	let writed = '';
	let fullPath = '';

	return got.stream(downloadUri + url)
		.pipe(unzipper())
		.pipe(streamz(entry => {
			const parsedPath = path.parse(entry.path);
			if (parsedPath.dir === '' && parsedPath.ext === '.srt') {
				writed = entry.path.replace('srt', 'vtt');
				fullPath = path.join(link, writed);
				return entry
					.pipe(srt2vtt())
					.pipe(fs.createWriteStream(fullPath));
			}
			entry.autodrain();
		}))
		.promise()
		.then(() => ({lang: lang, langShort: formatLangShort(lang), path: fullPath, fileName: writed}));
};

const downloads = (res, opts) => {
	const {concurrency, path} = opts;

	return pMap(Object.keys(res), lang => download(lang, res[lang].url, path), concurrency);
};

const runConditional = (imdbId, opts, res) => (
	Promise.resolve(langFilter(res.subs[imdbId], opts.langs.map(formatLangLong)))
			.then(res => downloads(res, opts))
);

const yifysubtitles = (imdbId, opts) => {
	opts = Object.assign({
		path: __dirname,
		langs: ['en'],
		concurrency: Infinity
	}, opts);

	if (opts.langs.constructor !== Array) {
		throw new TypeError('Expected `langs` to be an array');
	} else if (opts.langs.some(lang => langK.indexOf(lang) === -1)) {
		throw new TypeError(`Expected \`langs\` members to be in ${langK}`);
	}

	return apiCall(imdbId)
		.then(res => Object.keys(res).length ? runConditional(imdbId, opts, res) : []);
};

module.exports = yifysubtitles;

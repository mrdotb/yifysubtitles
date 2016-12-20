const fs = require('fs');
const join = require('path').join;
const got = require('got');
const streamz = require('streamz');
const unzipper = require('unzipper').Parse;
const srt2vtt = require('srt-to-vtt');

const apiUri = 'http://api.yifysubtitles.com/subs';
const downloadUri = 'http://yifysubtitles.com';
const langsFormat = require('./langs');

const apiCall = imdbId => {
	return got(`${apiUri}/${imdbId}`, {json: true})
		.then(res => (
			(res.body.subtitles === 0) ?
				Promise.resolve([]) :
				res.body
		));
};

const formatLangs = userLangs => {
	const has = Object.prototype.hasOwnProperty;

	return userLangs.reduce((acc, lang) => {
		if (has.call(langsFormat, lang)) {
			acc.push(langsFormat[lang]);
		}
		return acc;
	}, []);
};

const langFilter = (subs, langs) => {
	return Object.keys(subs).reduce((acc, apiLang) => {
		if (langs.some(userLang => userLang === apiLang)) {
			acc[apiLang] = subs[apiLang].sort((a, b) => b.rating - a.rating)[0];
		}
		return acc;
	}, {});
};

const download = (lang, url, path) => {
	const reg = /(\.srt)$/i;
	const reg1 = /MACOSX/;
	let writed = '';

	return got.stream(downloadUri + url)
		.pipe(unzipper())
		.pipe(streamz(entry => {
			console.log(entry.path);
			if (entry.path.match(reg) && !entry.path.match(reg1)) {
				writed = entry.path.replace('srt', 'vtt');
				return entry
					.pipe(srt2vtt())
					.pipe(fs.createWriteStream(join(path, writed)));
			}
			entry.autodrain();
		}))
		.promise()
		.then(() => ({lang: lang, langShort: lang, path: writed}));
};

const downloads = (res, path) => {
	const promises = Object.keys(res).map(lang => download(lang, res[lang].url, path));
	return Promise.all(promises);
};

const yifysubtitles = (imdbId, langs, path = '/tmp') => {
	return apiCall(imdbId)
		.then(res => langFilter(res.subs[imdbId], formatLangs(langs)))
		.then(res => downloads(res, path));
};

module.exports = yifysubtitles;

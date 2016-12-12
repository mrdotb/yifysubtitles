const rp = require('request-promise');
const etl = require('etl');
const unzipper = require('unzipper').Parse;
const srt2vtt = require('srt-to-vtt');

const apiUri = 'http://api.yifysubtitles.com/subs';
const downloadUri = 'http://yifysubtitles.com';

const apiCall = imdbId => {
	const options = {
		method: 'GET',
		uri: apiUri + '/' + imdbId,
		json: true
	};

	return rp(options);
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
	let writed = '';
	const reg = /MACOSX/;
	const options = {
		method: 'GET',
		uri: downloadUri + url,
		json: true
	};

	return rp(options)
		.pipe(unzipper())
		.pipe(etl.map(entry => {
			const fileName = entry.path.replace('srt', 'vtt');
			if (!fileName.match(reg)) {
				writed = fileName;
				return entry
					.pipe(srt2vtt())
					.pipe(etl.toFile(path + '/' + fileName));
			}
			entry.autodrain();
		}))
		.promise()
		.then(() => ({lang: lang, path: writed}));
};

const downloads = (langs, path) => {
	const promises = Object.keys(langs).map(lang => download(lang, langs[lang].url, path));
	return Promise.all(promises);
};

const yifysubtitles = (imdbId, langs, path = '/tmp') => {
	return apiCall(imdbId)
		.then(res => {
			if (res.subtitles > 0) {
				return langFilter(res.subs[imdbId], langs);
			}
			throw new Error('No subs founds for this imdbId');
		})
		.then(langs => downloads(langs, path));
};

module.exports = yifysubtitles;

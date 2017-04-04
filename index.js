const fs = require('fs');
const path = require('path');
const got = require('got');
const pMap = require('p-map');
const streamz = require('streamz');
const unzipper = require('unzipper').Parse;
const srt2vtt = require('srt-to-vtt');
const cheerio = require('cheerio');

const langsFormat = require('./langs');

const apiUri = 'http://api.yifysubtitles.com/subs';
const uri = 'http://www.yifysubtitles.com/movie-imdb';
const downloadUri = 'http://yifysubtitles.com';
const langK = Object.keys(langsFormat);
const langV = langK.map(i => langsFormat[i]);

const formatLangLong = lang => (langV[langK.indexOf(lang)]);
const formatLangShort = lang => (langK[langV.indexOf(lang)]);

// Since yifysubtitle api is not working anymore we scrape the site instead
const scrape = imdbId => {
	return got(`${uri}/${imdbId}`)
		.then(res => cheerio.load(res.body))
		.then($ => {
			return $('tbody tr').map((i, el) => {
				const $el = $(el);
				return {
					rating: $el.find('.rating-cell').text(),
					language: $el.find('.flag-cell .sub-lang').text().toLowerCase(),
					url: $el.find('.download-cell a').attr('href').replace('subtitles/', 'subtitle/') + '.zip'
				};
			}).get();
		})
};

const langFilter = (subs, langs) => {
	const data = langs.reduce((acc, l) => {
		const lang = subs.filter(s => s.language === l).sort((a, b) => b.rating - a.rating);
		if (lang.length) {
			acc[l] = lang[0];
		}
		return acc;
	}, {});
	return data
};

const downloadFormat = format => (lang, url, link) => {
	let writed = '';
	let fullPath = '';

	return got.stream(downloadUri + url)
		.pipe(unzipper())
		.pipe(streamz(entry => {
			const parsedPath = path.parse(entry.path);
			if (parsedPath.dir === '' && parsedPath.ext === '.srt') {
				writed = format === 'srt' ? entry.path : entry.path.replace('srt', 'vtt');
				fullPath = path.join(link, writed);
				return format === 'srt'
					? entry.pipe(fs.createWriteStream(fullPath))
					: entry.pipe(srt2vtt()).pipe(fs.createWriteStream(fullPath));
			}
			entry.autodrain();
		}))
		.promise()
		.then(() => ({lang: lang, langShort: formatLangShort(lang), path: fullPath, fileName: writed}));

};

const downloads = (res, opts) => {
	const download = downloadFormat(opts.format);
	const {concurrency, path} = opts;

	return pMap(Object.keys(res), lang => download(lang, res[lang].url, path), concurrency);
};

const runConditional = (imdbId, opts, res) => {
	return Promise.resolve(langFilter(res, opts.langs.map(formatLangLong)))
				.then(res => downloads(res, opts));
};

const yifysubtitles = (imdbId, opts) => {
	opts = Object.assign({
		path: __dirname,
		langs: ['en'],
		concurrency: Infinity,
		format: 'vtt'
	}, opts);

	if (opts.langs.constructor !== Array) {
		throw new TypeError('Expected `langs` to be an array');
	} else if (opts.langs.some(lang => langK.indexOf(lang) === -1)) {
		throw new TypeError(`Expected \`langs\` members to be in ${langK}`);
	}

	return scrape(imdbId)
		.then(res => res.length ? runConditional(imdbId, opts, res) : []);
};

module.exports = yifysubtitles;

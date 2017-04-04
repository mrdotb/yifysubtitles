import fs from 'fs';
import path from 'path';
import test from 'ava';
import pify from 'pify';
import pMap from 'p-map';

import yifysubtitles from '../';

const downloadDir = path.join(__dirname, 'tmp');

test.before('setup: create tmp dir', async t => {
	await pify(fs.mkdir)(downloadDir);
});

test('with imdbid not in api', async t => {
	const subtitles = await yifysubtitles('tt1234567', {path: downloadDir, langs: ['fr', 'en', 'nl']});

	t.is(subtitles.length, 0);
});

test('opts.langs bad args', t => {
	t.throws(() => yifysubtitles('tt1156398', {langs: 'lol string'}));
	t.throws(() => yifysubtitles('tt1156398', {langs: ['zz']}));
});

test('download zombieland subtitles in fr, en, nl + transform in vtt', async t => {
	const subtitles = await yifysubtitles('tt1156398', {path: downloadDir, langs: ['fr', 'en', 'nl']});

	t.is(subtitles.length, 3, 'results length should be 3');
	subtitles.forEach(subtitle => t.regex(subtitle.path, /(\.vtt)$/, 'extension should be vtt'));

	const paths = subtitles.map(subtitle => subtitle.path);
	await pMap(paths, path => t.notThrows(pify(fs.access)(path), 'file should exist'));
	await pMap(paths, path => pify(fs.unlink)(path));
});

test('download zombieland subtitles in fr, en, nl', async t => {
	const subtitles = await yifysubtitles('tt1156398', {path: downloadDir, langs: ['fr', 'en', 'nl'], format: 'srt'});

	t.is(subtitles.length, 3, 'results length should be 3');
	subtitles.forEach(subtitle => t.regex(subtitle.path, /(\.srt)$/, 'extension should be srt'));

	const paths = subtitles.map(subtitle => subtitle.path);
	await pMap(paths, path => t.notThrows(pify(fs.access)(path), 'file should exist'));
	await pMap(paths, path => pify(fs.unlink)(path));
});


test.after.always('cleanup: delete tmp dir', async t => {
	await pify(fs.rmdir)(downloadDir);
});

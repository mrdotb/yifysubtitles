import test from 'ava';
import got from 'got';

test(`http://yifysubtitles.com should be alive`, async t => {
	const res = await got(`http://yifysubtitles.com`);

	t.is(res.statusCode, 200);
});

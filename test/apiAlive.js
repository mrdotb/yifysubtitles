import test from 'ava';
import got from 'got';

test('http://api.yifysubtitles.com should be alive', async t => {
	const res = await got(`http://api.yifysubtitles.com`);

	t.is(res.statusCode, 200);
});

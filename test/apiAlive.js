import test from 'ava';
import rp from 'request-promise';

test('api-yifysubtitles is Alive', async t => {
	const options = {
		method: 'GET',
		uri: 'http://api.yifysubtitles.com',
		resolveWithFullResponse: true
	};

	const res = await rp(options);
	t.is(res.statusCode, 200);
});

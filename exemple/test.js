const yifysubtitles = require('../index');

console.log('dirname', __dirname);
yifysubtitles('tt3774114', ['french', 'english', 'dutch'], __dirname)
	.then(res => {
		console.log('res', res);
	})
	.catch(err => console.log(err));

const yifysubtitles = require('..');

console.log('dirname', __dirname);

yifysubtitles('tt1156398', {langs: ['fr', 'en', 'zh'], path: '/tmp'})
  .then(res => {
    console.log('res', res);
  })
  .catch(error => console.log(error));

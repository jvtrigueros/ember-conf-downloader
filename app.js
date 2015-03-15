var Promise = require('bluebird')
  , request = Promise.promisify(require('request'))
  , md = require('markdown').markdown
  , _ = require('lodash')
  , yt = require('youtube-dl')
  , fs = require('fs')
  , path = require('path')

var getInfoAsync = Promise.promisify(yt.getInfo)

var _urls =
request('https://raw.githubusercontent.com/poteto/emberconf-2015/master/README.md')
  .spread(function (res, body) {
    var tree = md.parse(body)
    return _(tree)
      .flatten()
      .filter(_.isArray)
      .filter(function (n) { return n[0] === 'listitem' })
      .filter(function (n) { return n[1].indexOf('Video') !== -1 })
      .map(function (n) { return n[1].split(' ')[1] })
      .compact()
      .value()
  })

function _extractData(urls) {
  return urls
    .map(function (url) { return getInfoAsync(url) })
    .map(function (info) {
      return { title: _.startCase(info.title.toLowerCase())
             , url: info.url
             }
    })
    .catch(function (err) { console.log('Something went wrong.', err)})
}

function list(urls) {
  _extractData(urls)
    .each(function (url, i) { console.log(i + 1 + ':', url.title) })
}

function get(urls, index) {
  _extractData(urls)
    .then(function (urls) {
      var video = urls[index - 1]
      var length = 0;
      var current = 0;
      request
        .get(video.url)
        .on('response', function (response) {
          length = parseFloat(response.headers['content-length'])
          response.on('data', function (data) {
            current += data.length
            console.log(current/length * 100)
          })
        })
        .pipe(fs.createWriteStream(video.title + '.mp4'))
    })
    .catch(function (err) {
      console.log(err)
    })
}

module.exports = { list: _.partial(list, _urls)
                 , get: _.partial(get, _urls)
                 }

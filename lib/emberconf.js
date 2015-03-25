var Promise = require('bluebird')
  , request = Promise.promisifyAll(require('request'))
  , md = require('markdown').markdown
  , _ = require('lodash')
  , yt = require('youtube-dl')
  , fs = require('fs')
  , ProgressBar = require('progress')

var getInfoAsync = Promise.promisify(yt.getInfo)

var _urls = request
  .getAsync('https://raw.githubusercontent.com/poteto/emberconf-2015/master/README.md')
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
    .catch(function (err) { console.log('Something went wrong.', err) })
}

function list(urls) {
  _extractData(urls)
    .each(function (url, i) { console.log(i + 1 + ':', url.title) })
}

function get(urls, index) {
  _extractData(urls)
    .then(function (urls) {
      var video = urls[index - 1]

      request
        .get(video.url)
        .on('response', function (response) {
          var downloadMsg = 'Downloading: ' + video.title;
          console.log(downloadMsg)

          var length = parseInt(response.headers['content-length'], 10)
          var barOptions = { complete: '='
                           , incomplete: ' '
                           , width: downloadMsg.length - 12
                           , total: length
                           }

          var bar = new ProgressBar('[:bar] :percent :etas', barOptions)
          response.on('data', function (data) {
            bar.tick(data.length)
          })

          response.on('end', function () {
            console.log('\n')
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

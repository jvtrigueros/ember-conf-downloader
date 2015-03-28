var Promise = require('bluebird')
  , request = Promise.promisifyAll(require('request'))
  , md = require('markdown').markdown
  , _ = require('lodash')
  , yt = require('youtube-dl')
  , fs = require('fs')
  , ProgressBar = require('progress')

var getInfoAsync = Promise.promisify(yt.getInfo)

var _link = 'https://raw.githubusercontent.com/poteto/emberconf-2015/master/README.md'

var _urls = request
  .getAsync(_link)
  .spread(function (res, body) {
    var tree = _(md.parse(body))
    var titles =
      tree
        .filter(_.isArray)
        .filter(function (n) { return  n[0] === 'header' && n[1].level == 4 })
        .map(function (n) { return n[2] + ((n[3] != undefined) ? n[3][2]: '') })

    var links =
      tree
        .filter(function(n) { return n[0] === 'bulletlist' })
        .map(_.rest)
        .flatten()
        .filter(function(n) { return _.contains(n[1], 'Video') })
        .map(_.rest)
        .map(_extractVideo)
        .value()

    return titles
      .zip(links)
      .map(function (n) { return {title: n[0], url: n[1]} })
      .value()
  })

/**
 * This entire function is a hack to accommodate for the fact that I'm doing something utterly useless.
 */
function _extractVideo(n) {
  var url = '';
  if(n.length == 1)
    url = n[0].split(' ')[1]
  else {
    url =
      _(n[1])
        .filter(_.isArray)
        .map(function (n) { return _.flatten(_.rest(n)) })
        .map(function (n) {
          if(n.length == 1)
            return n[0].split(' ')[1]
          else if(_.contains(n, 'Official')) {
            return n[1].href
          }
        })
        .flatten()
        .compact()
        .value()[0]
  }

  return url
}

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
  urls.each(function (url, i) { console.log(i + 1 + ':', url.title) })
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

_urls.then(console.log)
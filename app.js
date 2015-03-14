var request = require('request')
  , Promise = require('bluebird')
  , md = require('markdown').markdown
  , _ = require('lodash')
  , yt = require('youtube-dl')
  , fs = require('fs')

var ytInfo = Promise.promisify(yt.getInfo)

var tree = md.parse(fs.readFileSync('./tmp/README.md', 'utf8'))

var youtubeUrls =
  _(tree)
    .flatten()
    .filter(_.isArray)
    .filter(function (n) { return n[0] === 'listitem' })
    .filter(function (n) { return n[1].indexOf('Video') !== -1 })
    .map(function (n) { return n[1].split(' ')[1] })
    .compact()
    .map(function(url) {
      yt.getInfo(url, function (err, info) {
        if(err) {
          console.log(err)
          return {}
        }

        yt(url).pipe(fs.createWriteStream(info.title + '.mp4'))
      })
    })
    /*.map(function (p) {
      return p
        .then(function (info) {
          console.log({'title': info.title, 'url': info.url})
          return {'title': info.title, 'url': info.url}
        })
        .catch(function (err) {
          //console.log('Something went wrong', err)
          return {}
        })
    })*/
    .value()

//console.log(youtubeUrls)

//ytInfo('https://www.youtube.com/watch?v=qWcNZ3j3y6g')
//  .then(function (info) {
//    console.log(info.title)
//  })

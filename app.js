var request = require('request')
  , Promise = require('bluebird')
  , md = require('markdown').markdown
  , _ = require('lodash')
  , yt = require('youtube-dl')
  , fs = require('fs')


request('https://raw.githubusercontent.com/poteto/emberconf-2015/master/README.md', function (err, res, body) {
  var tree = md.parse(body)
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

        //yt(url).pipe(fs.createWriteStream(info.title + '.mp4'))
        console.log(info.title)
      })
    })
    .value()
})
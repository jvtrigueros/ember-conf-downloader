'use strict'

var parser = require('nomnom')
  , _ = require('lodash')
  , cli = require('./lib/emberconf')

parser.script('emberconf')

parser.command('list')
  .callback(function () {
    console.log('Obtaining list of videos...')
    cli.list()
  })
  .help('Lists available EmberConf videos.')

parser.command('get')
  .callback(function (opts) {
    _(opts)
      .pick('_')
      .values()
      .flatten()
      .tap(function (args) {
        console.log('Fetching url for given index...')
        var n = parseInt(_.last(args), 10)
        if(_.isNumber(n))
          cli.get(n)
      })
      .value()
  })
  .help('Download an EmberConf video by giving an index obtained from using the \'list\' command')

parser.parse()
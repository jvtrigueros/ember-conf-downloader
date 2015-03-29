'use strict'

var request = require('request')
  , assert = require('assert')

var url = 'https://raw.githubusercontent.com/poteto/emberconf-2015/master/README.md'

describe('EmberConf url', function () {

  it('should not have request errors', function (done) {
    request(url, function (err) {
      assert.ifError(err)
      done()
    })
  })

  it('should exist', function (done) {
    request(url, function (err, res) {
      assert.equal(res.statusCode, 200)
      done()
    })
  })
})
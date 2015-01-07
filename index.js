var AWS = require('aws-sdk')
var assert = require('assert')
var async = require('async')
var fs = require('fs')
var path = require('path')

var cloudfrontConf = require('./cloudfront-config')

module.exports = function(config, cb) {
  if (typeof cb !== 'function') cb = function () {}

  assert.equal(typeof config.origin, 'string')

  config.aliases = config.aliases || []

  if (!config.certId && config.cert && config.key) {
    uploadCerts(config, function (err, certInfo) {
      if (err) return cb(err)

      config.certId = certInfo.ServerCertificateMetadata.ServerCertificateId
      createDistribution(config, respond(cb))
    })
  } else {
    createDistribution(config, respond(cb))
  }
}

function respond (done) {
  return function (err, data) {
    if (err) return done(err)
    var result = {
      url: data.DomainName,
      certId: data.DistributionConfig.ViewerCertificate.IAMCertificateId,
      distribution: data
    }
    done(null, result)
  }
}

function prepareCerts (config, done) {
  var paths = [ config.cert, config.key, config.intermediate ]
  async.map(paths, function (item, cb) {
    if (!item) return process.nextTick(cb)
    fs.readFile(path.relative(process.cwd(), item), { encoding: 'utf8' }, cb)
  }, function (err, files) {
    if (err) return done(err)

    var params = {
      CertificateBody: files[0],
      PrivateKey: files[1],
      CertificateChain: files[2],
      ServerCertificateName: config.certName,
      Path: '/cloudfront/' + config.certName + '/'
    }
    done(null, params)
  })
}

module.exports._prepareCerts = prepareCerts

function uploadCerts (config, done) {
  var iam = new AWS.IAM()

  prepareCerts(config, function (err, params) {
    if (err) return done(err)
    iam.uploadServerCertificate(params, done)
  })
}

module.exports._uploadCerts = uploadCerts

function createDistribution (config, cb) {
  var cloudfront = new AWS.CloudFront()
  cloudfront.createDistribution(cloudfrontConf(config), cb)
}

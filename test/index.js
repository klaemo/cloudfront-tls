var test = require('tape')
var AWS = require('aws-sdk')

var distribution = require('../')
var cloudfrontConfig = require('../cloudfront-config')

var config = {
  origin: 'origin.foo.org',
  aliases: [ 'foo.org' ]
}

test('distribution', function (t) {
  t.plan(1)
  t.strictEqual(typeof distribution, 'function')
})

test('distribution config', function(t) {
  var conf = cloudfrontConfig(config).DistributionConfig

  t.strictEqual(typeof conf, 'object')
  t.strictEqual(conf.Aliases.Quantity, 1)
  t.strictEqual(conf.Aliases.Items.length, 1)
  t.strictEqual(typeof conf.CallerReference, 'string')
  t.strictEqual(conf.DefaultCacheBehavior.TargetOriginId, config.origin)
  t.strictEqual(conf.Origins.Quantity, 1)

  var origin = conf.Origins.Items[0]
  t.strictEqual(origin.DomainName, config.origin)
  t.strictEqual(origin.Id, config.origin)

  var certs = conf.ViewerCertificate
  t.strictEqual(certs.CloudFrontDefaultCertificate, true)
  t.strictEqual(certs.IAMCertificateId, undefined)

  conf = cloudfrontConfig({ certId: 'foo' }).DistributionConfig
  certs = conf.ViewerCertificate
  t.strictEqual(certs.CloudFrontDefaultCertificate, false)
  t.strictEqual(certs.IAMCertificateId, 'foo')
  t.end()
})

test('._prepareCerts', function(t) {
  distribution._prepareCerts({
    cert: __dirname + '/test.crt', key: __dirname + '/test.key', certName: 'foo.org'
  }, function (err, params) {
    t.error(err)
    t.ok(params.CertificateBody, 'Cert')
    t.ok(params.PrivateKey, 'Key')
    t.strictEqual(params.ServerCertificateName, 'foo.org')
    t.strictEqual(params.Path, '/cloudfront/foo.org/')
    t.end()
  })
})

test('._uploadCerts', function(t) {
  distribution._uploadCerts({
    cert: __dirname + '/test.crt', key: __dirname + '/test.key', certName: 'foo.org'
  }, function (err, data) {
    t.error(err)

    var iam = new AWS.IAM()
    iam.deleteServerCertificate({ ServerCertificateName: 'foo.org' }, function(err) {
      t.error(err)
      t.end()
    })
  })
})

if (process.env.TEST === 'integration') {
  test('integration test', function(t) {
    distribution({
      origin: 'origin.foo.org', aliases: [ 'foo.org' ]
      // cert: __dirname + '/test.crt', key: __dirname + '/test.key', certName: 'foo.org'
    }, function(err, data) {
      t.error(err)

      var iam = new AWS.IAM()
      iam.deleteServerCertificate({ ServerCertificateName: 'foo.org' }, function(err) {
        t.end()
      })
    })
  })
}

function cleanup (id, etag, cb) {
  var cloudfront = new AWS.CloudFront()
  cloudfront.deleteDistribution({ Id: id, IfMatch: etag }, cb)
}

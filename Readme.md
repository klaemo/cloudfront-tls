## cloudfront-tls

Easily set up a Amazon Cloudfront Distribution for your project, optionally with your custom TLS certificates.

Your AWS credentials should either be in `~/.aws/credentials` or in the environment variables `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

### Installation

`cloudfront-tls` is a [node.js](http://nodejs.org) program/module.

```
npm install -g cloudfront-tls
```

### Usage (CLI)

```
$ cloudfront-tls -h

  Usage: cloudfront-tls [options] origin

  Options:

    -h, --help                               output usage information
    -V, --version                            output the version number
    -a, --aliases <aliases,...>              CNAMES for your distribution.
    --cert-id <IAM ServerCertId>             The ID of your cert in IAM.
    -c, --cert <cert>                        Path to the public key certificate.
    -k, --key <key>                          Path to the private key.
    -n, --cert-name <certificate name>       A unique name for the server certificate.
    -i, --intermediate <intermediate certs>  Path to the concatenated intermediate certificates.

```

All the options are optional ;-). When using `--cert-id` you don't need to provide `cert`, `key` and `intermediate`.
If you don't already have your certificate in IAM, provide at least `cert`, `key` and 'cert-name' so it can be uploaded to IAM for you.

`cloudfront-tls -a www.my-site.com my-bucket.s3.aws.com` creates a distribution for the specified origin and
sets up the alias `www.my-site.com`.
You can then set up a CNAME record for `www.my-site.com` pointing to the returned cloudfront hostname.

### Usage (API)

```javascript
var cloudfront = require('cloudfront-tls')

cloudfront({
  origin: 'my-bucket.s3.aws.com', // required
  aliases: ['www.my-site.com'], // optional aliases
  certId: 'foobar', // If you already have your cert in IAM, provide its id here

  // otherwise provide at least cert, certName and key if you want to use your own certificate
  cert: 'foo.crt', // Path to the public key certificate
  key: 'foo.key', // Path to the private key
  certName: 'my-cert', // A unique name for the server certificate
  intermediate: 'chain.crt', // Path to the concatenated intermediate certificates (optional)
}, function(err, distribution) {
  if (err) throw err
  console.log(distribution)
})
```

### Contributing

Feel free to open issues and submit pull requests.

### License
ISC
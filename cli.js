#!/usr/bin/env node

var cloudfront = require('./')
var program = require('commander')

program
  .version(require('./package.json').version)
  .usage('[options] origin')
  .option('-a, --aliases <aliases,...>', 'CNAMES for your distribution.', function (val) {
    return val.split(',');
  })
  .option('--cert-id <IAM ServerCertId>', 'The ID of your cert in IAM.')
  .option('-c, --cert <cert>', 'Path to the public key certificate.')
  .option('-k, --key <key>', 'Path to the private key.')
  .option('-n, --cert-name <certificate name>', 'A unique name for the server certificate.')
  .option('-i, --intermediate <intermediate certs>', 'Path to the concatenated intermediate certificates.')
  .parse(process.argv)

if (!program.args.length) {
  console.error('no origin specified')
  process.exit(1)
}

program.origin = program.args[0]

cloudfront(program, function(err, website) {
  if (err) {
    console.error(err.message)
    process.exit(1)
  }
  console.log('Successfully created your cloudfront distribution.\n')
  console.log('URL:\n  ' + website.url + '\n')
})
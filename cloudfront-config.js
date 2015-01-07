module.exports = function (config) {
  config.aliases = config.aliases || []

  return {
    DistributionConfig: {
      Enabled: true,
      Aliases: {
        Quantity: config.aliases.length,
        Items: config.aliases
      },
      CallerReference: Date.now() + '',
      Comment: 'created by cloudfront-tls',
      DefaultCacheBehavior: {
        TargetOriginId: config.origin,
        ViewerProtocolPolicy: 'redirect-to-https',
        TrustedSigners: {
          Enabled: false,
          Quantity: 0
        },
        ForwardedValues: {
          Cookies: {
            Forward: 'none'
          },
          QueryString: false,
          Headers: {
            Quantity: 0,
          }
        },
        MinTTL: 0
      },
      CacheBehaviors: {
        Quantity: 0
      },
      DefaultRootObject: '/',
      Origins: {
        Quantity: 1,
        Items: [
          {
            DomainName: config.origin,
            Id: config.origin,
            CustomOriginConfig: {
              HTTPPort: 80,
              HTTPSPort: 443,
              OriginProtocolPolicy: 'http-only'
            },
            // S3OriginConfig: {
            //   OriginAccessIdentity: 'STRING_VALUE'
            // }
          }
        ]
      },
      Logging: {
        Bucket: '',
        Enabled: false,
        IncludeCookies: false,
        Prefix: ''
      },
      PriceClass: 'PriceClass_100',
      ViewerCertificate: {
        CloudFrontDefaultCertificate: !config.certId,
        IAMCertificateId: config.certId,
        MinimumProtocolVersion: 'TLSv1',
        SSLSupportMethod: 'sni-only'
      }
    }
  }
}

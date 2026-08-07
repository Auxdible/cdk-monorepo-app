import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3deployment from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
export class AppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this, "WebBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
    });
    const distribution = new cloudfront.Distribution(this, "WebDistribution", {
      defaultBehavior: {
        origin:
          cloudfront_origins.S3BucketOrigin.withOriginAccessControl(bucket),
      },
    });
    const bucketDeployment = new s3deployment.BucketDeployment(
      this,
      "WebDeployment",
      {
        destinationBucket: bucket,
        distribution: distribution,
        sources: [s3deployment.Source.asset("/apps/web/dist")],
      },
    );
  }
}

import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3deployment from "aws-cdk-lib/aws-s3-deployment";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as lambda_node from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as apigw_integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
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
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
      },
      defaultRootObject: "index.html",
    });
    const apiFunc = new lambda_node.NodejsFunction(this, "APIFunction", {
      entry: path.join(__dirname, "../../../../apps/api/src/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      environment: {
        ALLOWED_ORIGIN: distribution.domainName,
      },
    });
    const lambdaIntegration = new apigw_integrations.HttpLambdaIntegration(
      "APIFunctionIntegration",
      apiFunc,
    );
    const apiGW = new apigw.HttpApi(this, "AppAPIGW", {
      corsPreflight: {
        allowHeaders: ["*"],
        allowMethods: [apigw.CorsHttpMethod.ANY],
        allowOrigins: [`https://${distribution.domainName}`],
      },
    });
    const bucketDeployment = new s3deployment.BucketDeployment(
      this,
      "WebDeployment",
      {
        destinationBucket: bucket,
        distribution: distribution,
        sources: [
          s3deployment.Source.asset(
            path.join(__dirname, "../../../../apps/web/dist"),
          ),
          s3deployment.Source.jsonData("config.json", {
            apiUrl: apiGW.defaultStage!.url,
          }),
        ],
      },
    );

    apiGW.addRoutes({
      path: "/{path+}",
      methods: [apigw.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    // database using dynamodb

    const tasksTable = new dynamodb.TableV2(this, "TasksTable", {
      partitionKey: {
        name: "taskID",
        type: dynamodb.AttributeType.STRING,
      },
      tableName: "tasks",
      sortKey: {
        name: "dateCreated",
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}

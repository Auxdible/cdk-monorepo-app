import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as pipelines from "aws-cdk-lib/pipelines";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { AppStage } from "../stages/app-stage";
import {
  codeConnectionARN,
  environments,
  gitHubRepository,
} from "../../config/environments";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const pipeline = new pipelines.CodePipeline(this, "ToolsPipeline", {
      crossAccountKeys: true,
      synth: new pipelines.ShellStep("Synth", {
        input: pipelines.CodePipelineSource.connection(
          gitHubRepository.repo,
          gitHubRepository.branch,
          {
            connectionArn: codeConnectionARN,
          },
        ),
        commands: [
          "npm i -g pnpm",
          "pnpm i --no-frozen-lockfile",
          "pnpm run build",
          "cd ./packages/infra",
          `pnpx cdk synth`,
        ],

        primaryOutputDirectory: "./packages/infra/cdk.out",
      }),
      codeBuildDefaults: {
        partialBuildSpec: BuildSpec.fromObject({
          phases: {
            install: {
              "runtime-versions": {
                nodejs: "22",
              },
            },
          },
        }),
      },
      synthCodeBuildDefaults: {
        partialBuildSpec: BuildSpec.fromObject({
          phases: {
            install: {
              "runtime-versions": {
                nodejs: "22",
              },
            },
          },
        }),
      },
    });

    pipeline.addStage(
      new AppStage(this, "DevStage", {
        env: environments.dev,
        appStackEnvironment: "dev",
      }),
    );
    pipeline.addStage(
      new AppStage(this, "ProdStage", {
        env: environments.prod,
        appStackEnvironment: "prod",
      }),
      {
        pre: [
          new pipelines.ManualApprovalStep("PromoteToProd", {
            comment:
              "Please validate and ensure changes are functional inside of development environment.",
          }),
        ],
      },
    );
  }
}

import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as pipelines from "aws-cdk-lib/pipelines";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { AppStage } from "../stages/app-stage";
import { environments } from "../../config/environments";
export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const owner = ssm.StringParameter.valueForStringParameter(
        this,
        "repository-owner",
      ),
      repo = ssm.StringParameter.valueForStringParameter(
        this,
        "repository-repo",
      ),
      branch = ssm.StringParameter.valueForStringParameter(
        this,
        "repository-branch",
      );

    const accessToken = secretsmanager.Secret.fromSecretNameV2(
      this,
      "RepositoryOAuthSecret",
      "repository-accessToken",
    );
    const pipeline = new pipelines.CodePipeline(this, "ToolsPipeline", {
      crossAccountKeys: true,
      synth: new pipelines.ShellStep("Synth", {
        input: pipelines.CodePipelineSource.gitHub(owner + "/" + repo, branch, {
          authentication: accessToken.secretValue,
        }),
        commands: [
          "npm i -g pnpm",
          "pnpm i --no-frozen-lockfile",
          "pnpm run build",
          "cd ./packages/infra",
          `pnpx cdk synth`,
        ],
        primaryOutputDirectory: "./packages/infra/cdk.out",
      }),
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

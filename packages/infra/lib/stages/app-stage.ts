import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { AppStack } from "../stacks/app-stack";

export interface AppStageProps extends cdk.StageProps {
  readonly appStackEnvironment: "dev" | "prod";
}
export class AppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: AppStageProps) {
    super(scope, id, props);
    const stack = new AppStack(
      this,
      `AppStack-${props.appStackEnvironment}`,
      props,
    );
  }
}

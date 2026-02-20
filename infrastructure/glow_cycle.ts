#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { GlowCycleStack } from './glow_cycle_stack';

const app = new cdk.App();
new GlowCycleStack(app, 'GlowCycleStack',{
  stackName: "GlowCycleStack",
});

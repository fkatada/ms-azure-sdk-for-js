/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */
import {
  WatcherUpdateParameters,
  AutomationClient
} from "@azure/arm-automation";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

/**
 * This sample demonstrates how to Update the watcher identified by watcher name.
 *
 * @summary Update the watcher identified by watcher name.
 * x-ms-original-file: specification/automation/resource-manager/Microsoft.Automation/preview/2020-01-13-preview/examples/updateWatcher.json
 */
async function updateWatcher() {
  const subscriptionId = process.env["AUTOMATION_SUBSCRIPTION_ID"] || "subid";
  const resourceGroupName = process.env["AUTOMATION_RESOURCE_GROUP"] || "rg";
  const automationAccountName = "MyTestAutomationAccount";
  const watcherName = "MyTestWatcher";
  const parameters: WatcherUpdateParameters = {
    name: "MyTestWatcher",
    executionFrequencyInSeconds: 600
  };
  const credential = new DefaultAzureCredential();
  const client = new AutomationClient(credential, subscriptionId);
  const result = await client.watcherOperations.update(
    resourceGroupName,
    automationAccountName,
    watcherName,
    parameters
  );
  console.log(result);
}

async function main() {
  updateWatcher();
}

main().catch(console.error);

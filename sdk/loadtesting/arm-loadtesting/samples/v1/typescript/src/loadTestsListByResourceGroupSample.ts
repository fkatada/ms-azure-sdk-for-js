/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
import { LoadTestClient } from "@azure/arm-loadtesting";
import { DefaultAzureCredential } from "@azure/identity";
import "dotenv/config";

/**
 * This sample demonstrates how to Lists loadtest resources in a resource group.
 *
 * @summary Lists loadtest resources in a resource group.
 * x-ms-original-file: specification/loadtestservice/resource-manager/Microsoft.LoadTestService/stable/2022-12-01/examples/LoadTests_ListByResourceGroup.json
 */
async function loadTestsListByResourceGroup(): Promise<void> {
  const subscriptionId =
    process.env["LOADTESTSERVICE_SUBSCRIPTION_ID"] ||
    "00000000-0000-0000-0000-000000000000";
  const resourceGroupName =
    process.env["LOADTESTSERVICE_RESOURCE_GROUP"] || "dummyrg";
  const credential = new DefaultAzureCredential();
  const client = new LoadTestClient(credential, subscriptionId);
  const resArray = new Array();
  for await (let item of client.loadTests.listByResourceGroup(
    resourceGroupName
  )) {
    resArray.push(item);
  }
  console.log(resArray);
}

async function main(): Promise<void> {
  loadTestsListByResourceGroup();
}

main().catch(console.error);

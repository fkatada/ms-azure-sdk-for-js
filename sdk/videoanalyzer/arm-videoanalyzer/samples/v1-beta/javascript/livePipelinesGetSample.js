/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
const { VideoAnalyzerManagementClient } = require("@azure/arm-videoanalyzer");
const { DefaultAzureCredential } = require("@azure/identity");
require("dotenv").config();

/**
 * This sample demonstrates how to Retrieves a specific live pipeline by name. If a live pipeline with that name has been previously created, the call will return the JSON representation of that instance.
 *
 * @summary Retrieves a specific live pipeline by name. If a live pipeline with that name has been previously created, the call will return the JSON representation of that instance.
 * x-ms-original-file: specification/videoanalyzer/resource-manager/Microsoft.Media/preview/2021-11-01-preview/examples/live-pipeline-get-by-name.json
 */
async function retrievesASpecificLivePipelineByName() {
  const subscriptionId =
    process.env["VIDEOANALYZER_SUBSCRIPTION_ID"] || "591e76c3-3e97-44db-879c-3e2b12961b62";
  const resourceGroupName = process.env["VIDEOANALYZER_RESOURCE_GROUP"] || "testrg";
  const accountName = "testaccount2";
  const livePipelineName = "livePipeline1";
  const credential = new DefaultAzureCredential();
  const client = new VideoAnalyzerManagementClient(credential, subscriptionId);
  const result = await client.livePipelines.get(resourceGroupName, accountName, livePipelineName);
  console.log(result);
}

async function main() {
  retrievesASpecificLivePipelineByName();
}

main().catch(console.error);
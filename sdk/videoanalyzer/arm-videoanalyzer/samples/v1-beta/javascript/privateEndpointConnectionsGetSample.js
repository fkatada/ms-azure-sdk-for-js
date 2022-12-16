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
 * This sample demonstrates how to Get private endpoint connection under video analyzer account.
 *
 * @summary Get private endpoint connection under video analyzer account.
 * x-ms-original-file: specification/videoanalyzer/resource-manager/Microsoft.Media/preview/2021-11-01-preview/examples/video-analyzer-private-endpoint-connection-get-by-name.json
 */
async function getPrivateEndpointConnection() {
  const subscriptionId =
    process.env["VIDEOANALYZER_SUBSCRIPTION_ID"] || "00000000-0000-0000-0000-000000000000";
  const resourceGroupName = process.env["VIDEOANALYZER_RESOURCE_GROUP"] || "contoso";
  const accountName = "contososports";
  const name = "10000000-0000-0000-0000-000000000000";
  const credential = new DefaultAzureCredential();
  const client = new VideoAnalyzerManagementClient(credential, subscriptionId);
  const result = await client.privateEndpointConnections.get(resourceGroupName, accountName, name);
  console.log(result);
}

async function main() {
  getPrivateEndpointConnection();
}

main().catch(console.error);
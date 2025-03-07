/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */

import { PagedAsyncIterableIterator } from "@azure/core-paging";
import {
  DatabaseSchema,
  ManagedDatabaseSchemasListByDatabaseOptionalParams,
  ManagedDatabaseSchemasGetOptionalParams,
  ManagedDatabaseSchemasGetResponse,
} from "../models/index.js";

/// <reference lib="esnext.asynciterable" />
/** Interface representing a ManagedDatabaseSchemas. */
export interface ManagedDatabaseSchemas {
  /**
   * List managed database schemas
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param managedInstanceName The name of the managed instance.
   * @param databaseName The name of the database.
   * @param options The options parameters.
   */
  listByDatabase(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    options?: ManagedDatabaseSchemasListByDatabaseOptionalParams,
  ): PagedAsyncIterableIterator<DatabaseSchema>;
  /**
   * Get managed database schema
   * @param resourceGroupName The name of the resource group that contains the resource. You can obtain
   *                          this value from the Azure Resource Manager API or the portal.
   * @param managedInstanceName The name of the managed instance.
   * @param databaseName The name of the database.
   * @param schemaName The name of the schema.
   * @param options The options parameters.
   */
  get(
    resourceGroupName: string,
    managedInstanceName: string,
    databaseName: string,
    schemaName: string,
    options?: ManagedDatabaseSchemasGetOptionalParams,
  ): Promise<ManagedDatabaseSchemasGetResponse>;
}

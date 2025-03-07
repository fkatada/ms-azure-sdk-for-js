// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Cross-language testing makes sure payloads serialized in other languages are
 * still deserializable by the JavaScript serializer.
 *
 * By default, the test will send and receive messages with serialized payload.
 * To enable cross-language testing mode:
 * 1. make sure the Event Hubs resource has one event hub corresponding to each
 *    scenario below (corresponding to individual unit tests)
 * 2. separately send messages to those hubs from each language
 * 3. set environment variable CROSS_LANGUAGE to true to instruct the tests
 *    to read from corresponding event hubs
 */

import type { AvroSerializer, MessageAdapter } from "../../src/index.js";
import type { EventData } from "@azure/event-hubs";
import { createEventDataAdapter } from "@azure/event-hubs";
import type { MessagingTestClient } from "./clients/models.js";
import { assertError } from "./utils/assertError.js";
import { createEventHubsClient } from "./clients/eventHubs.js";
import { createMockedMessagingClient } from "./clients/mocked.js";
import { createTestSerializer } from "./utils/mockedSerializer.js";
import { matrix } from "@azure-tools/test-utils-vitest";
import { testGroup } from "./utils/dummies.js";
import { Recorder, env } from "@azure-tools/test-recorder";
import { createPipelineWithCredential, removeSchemas } from "./utils/mockedRegistryClient.js";
import type { HttpClient, Pipeline } from "@azure/core-rest-pipeline";
import { createDefaultHttpClient } from "@azure/core-rest-pipeline";
import { describe, it, assert, beforeEach, afterEach } from "vitest";

/**
 * An interface to group different bits needed by the tests for each messaging service
 */
interface ScenariosTestInfo<T> {
  messageAdapter: MessageAdapter<T>;
  messagingServiceName: string;
  /**
   * Each unit test correspond to one of the scenarios below
   */
  createScenario1Client: () => MessagingTestClient<T>;
  createScenario2Client: () => MessagingTestClient<T>;
  createScenario3Client: () => MessagingTestClient<T>;
  createScenario4Client: () => MessagingTestClient<T>;
}

describe("With messaging clients", function () {
  const eventHubAvroHostName = env.EVENTHUB_AVRO_HOST_NAME || "";
  const eventHubName = env.EVENTHUB_NAME || "";
  const alreadyEnqueued = env.CROSS_LANGUAGE !== undefined;

  function createEventHubsTestClient(settings: {
    eventHubName: string;
  }): MessagingTestClient<EventData> {
    const { eventHubName: inputEventHubName } = settings;
    const client = createMockedMessagingClient(() =>
      createEventHubsClient({
        alreadyEnqueued,
        eventHubName: alreadyEnqueued ? inputEventHubName : eventHubName,
        eventHubAvroHostName,
      }),
    );
    client.initialize();
    return client;
  }

  const eventDataTestInfo: ScenariosTestInfo<EventData> = {
    messageAdapter: createEventDataAdapter({
      properties: {
        language: "js",
      },
    }),
    messagingServiceName: "Event Hub",
    createScenario1Client: () =>
      createEventHubsTestClient({
        eventHubName: "scenario_1",
      }),
    createScenario2Client: () =>
      createEventHubsTestClient({
        eventHubName: "scenario_2",
      }),
    createScenario3Client: () =>
      createEventHubsTestClient({
        eventHubName: "scenario_3",
      }),
    createScenario4Client: () =>
      createEventHubsTestClient({
        eventHubName: "scenario_4",
      }),
  };
  matrix([[eventDataTestInfo]] as const, async (testInfo: ScenariosTestInfo<any>) => {
    const {
      messageAdapter,
      messagingServiceName,
      createScenario1Client,
      createScenario2Client,
      createScenario3Client,
      createScenario4Client,
    } = testInfo;
    describe(messagingServiceName, async function () {
      let recorder: Recorder;
      let serializer: AvroSerializer<any>;
      let schemaName: string;
      const schemaList: string[] = [];
      let httpClient: HttpClient;
      let pipeline: Pipeline;

      async function roundtrip(settings: {
        client: MessagingTestClient<any>;
        value: unknown;
        writerSchema: string;
        processMessage: (p: Promise<unknown>) => Promise<void>;
        readerSchema?: string;
        eventCount?: number;
      }): Promise<void> {
        const {
          client,
          value,
          readerSchema,
          processMessage,
          writerSchema,
          /**
           * if messages are already enqueued, then we can expect they have been
           * sent from all four languages and we would like receive from all four
           * of them.
           */
          eventCount = alreadyEnqueued ? 4 : 1,
        } = settings;
        if (!alreadyEnqueued) {
          try {
            const message = await serializer.serialize(value, writerSchema);
            await client.send(message);
          } catch (e: any) {
            await client.cleanup();
            throw e;
          }
        }
        const errors: {
          error: Error;
          language: string;
        }[] = [];
        for await (const receivedMessage of client.receive({
          eventCount,
        })) {
          try {
            await processMessage(
              serializer.deserialize(receivedMessage, {
                schema: readerSchema,
              }),
            );
          } catch (e: any) {
            errors.push({
              error: e as Error,
              language: receivedMessage.properties.language,
            });
          }
        }
        await client.cleanup();
        if (errors.length > 0) {
          throw new Error(
            "The following error(s) occurred:\n" +
              errors.map(({ error, language }) => `${language}:\t${error.message}`).join("\n"),
          );
        }
      }

      beforeEach(async (ctx) => {
        httpClient = createDefaultHttpClient();
        pipeline = createPipelineWithCredential();
        recorder = new Recorder(ctx);
        serializer = await createTestSerializer({
          serializerOptions: {
            autoRegisterSchemas: true,
            groupName: testGroup,
            messageAdapter,
          },
          recorder,
        });
      });

      afterEach(async () => {
        schemaList.push(schemaName);
        await removeSchemas(schemaList, pipeline, httpClient);
      });

      it("Test schema with fields of type int/string/boolean/float/bytes", async () => {
        schemaName = "interop.avro.RecordWithFieldTypes";
        const writerSchema = JSON.stringify({
          name: "RecordWithFieldTypes",
          namespace: "interop.avro",
          type: "record",
          fields: [
            { name: "name", type: "string" },
            { name: "age", type: "int" },
            { name: "married", type: "boolean" },
            { name: "height", type: "float" },
            { name: "randb", type: "bytes" },
          ],
        });
        const value = {
          name: "Ben",
          age: 3,
          married: false,
          height: 13.5,
          randb: Buffer.from("\u00FF"),
        };
        await roundtrip({
          client: createScenario1Client(),
          value,
          writerSchema,
          processMessage: async (p: Promise<unknown>) => assert.deepStrictEqual(await p, value),
        });
      });

      it("Serialize with `Schema`. Deserialize with `Reader Schema`, which is the original schema with a field removed.", async () => {
        schemaName = "interop.avro.ReaderSchema";
        const writerSchema = JSON.stringify({
          namespace: "interop.avro",
          type: "record",
          name: "ReaderSchema",
          fields: [
            { name: "name", type: "string" },
            { name: "favorite_number", type: ["int", "null"] },
            { name: "favorite_color", type: ["string", "null"] },
          ],
        });
        const readerSchema = JSON.stringify({
          namespace: "interop.avro",
          type: "record",
          name: "ReaderSchema",
          fields: [
            { name: "name", type: "string" },
            { name: "favorite_number", type: ["int", "null"] },
          ],
        });
        const value = { name: "Ben", favorite_number: 7, favorite_color: "red" };
        await roundtrip({
          client: createScenario2Client(),
          value,
          writerSchema,
          readerSchema,
          processMessage: async (p: Promise<unknown>) =>
            assert.deepStrictEqual(await p, (({ favorite_color, ...rest }) => rest)(value)),
        });
      });

      it("Serialize with `Schema`. Deserialize with `Reader Schema`, which is the original schema with a field added.", async () => {
        schemaName = "interop.avro.ReaderSchema";
        const writerSchema = JSON.stringify({
          namespace: "interop.avro",
          type: "record",
          name: "ReaderSchema",
          fields: [
            { name: "name", type: "string" },
            { name: "favorite_number", type: ["int", "null"] },
            { name: "favorite_color", type: ["string", "null"] },
          ],
        });
        const readerSchema = JSON.stringify({
          namespace: "interop.avro",
          type: "record",
          name: "ReaderSchema",
          fields: [
            { name: "name", type: "string" },
            { name: "favorite_number", type: ["int", "null"] },
            { name: "favorite_color", type: ["string", "null"] },
            { name: "favorite_city", type: ["string", "null"], default: "Redmond" },
          ],
        });
        const value = { name: "Ben", favorite_number: 7, favorite_color: "red" };
        await roundtrip({
          client: createScenario3Client(),
          value,
          writerSchema,
          readerSchema,
          processMessage: async (p: Promise<unknown>) =>
            assert.deepStrictEqual(await p, { ...value, favorite_city: "Redmond" }),
        });
      });

      it("Serialize with `Schema`. Deserialize with `Reader Schema`, which is the original schema with a field (with no default value) added.", async () => {
        schemaName = "interop.avro.ReaderSchema";
        const writerSchema = JSON.stringify({
          namespace: "interop.avro",
          type: "record",
          name: "ReaderSchema",
          fields: [
            { name: "name", type: "string" },
            { name: "favorite_number", type: ["int", "null"] },
            { name: "favorite_color", type: ["string", "null"] },
          ],
        });
        const readerSchema = JSON.stringify({
          namespace: "interop.avro",
          type: "record",
          name: "ReaderSchema",
          fields: [
            { name: "name", type: "string" },
            { name: "favorite_number", type: ["int", "null"] },
            { name: "favorite_color", type: ["string", "null"] },
            { name: "favorite_city", type: ["string", "null"] },
          ],
        });
        const value = { name: "Ben", favorite_number: 7, favorite_color: "red" };
        await roundtrip({
          client: createScenario4Client(),
          value,
          writerSchema,
          readerSchema,
          processMessage: async (p: Promise<unknown>) =>
            assertError(p, {
              causeMessage: /no matching field for default-less/,
            }),
        });
      });
    });
  });
});

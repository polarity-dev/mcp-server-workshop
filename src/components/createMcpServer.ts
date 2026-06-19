import { McpServer } from "@modelcontextprotocol/server"
import { ResourceTemplate } from "@modelcontextprotocol/server"
import { z } from "zod/v4"
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { config } from "@/utils/config"

const s3 = new S3Client({
  endpoint: config.minio.endpoint,
  forcePathStyle: true,
  credentials: {
    accessKeyId: config.minio.accessKeyId,
    secretAccessKey: config.minio.secretAccessKey,
  },
})

export function createMcpServer() {
  const server = new McpServer({
    name: "mcp-server-workshop",
    version: "1.0.0",
    description: "Example server for the MCP workshop",
    websiteUrl: "https://polarity.dev",
  })

  server.registerTool(
    "random-number",
    {
      title: "Random Number",
      description: "Generates a random number between min and max (inclusive). Use this whenever the user asks for a random number, a dice roll, or needs to pick a number.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
      inputSchema: z.object({
        min: z.number().default(1).describe("Minimum value (inclusive)"),
        max: z.number().default(100).describe("Maximum value (inclusive)"),
      }),
    },
    async({ min, max }) => {
      const value = Math.floor(Math.random() * (max - min + 1)) + min
      return {
        content: [{ type: "text" as const, text: String(value) }],
      }
    },
  )

  server.registerResource(
    "minio-object",
    new ResourceTemplate(`minio://${config.minio.bucket}/{key}`, {
      list: async() => {
        const response = await s3.send(new ListObjectsV2Command({
          Bucket: config.minio.bucket,
        }))
        const objects = response.Contents ?? []

        return {
          resources: objects.map(obj => ({
            uri: `minio://${config.minio.bucket}/${obj.Key}`,
            name: obj.Key ?? "unknown",
            mimeType: "text/markdown",
          })),
        }
      },
    }),
    {
      title: "MinIO Object",
      description: "Read any object from MinIO storage using minio://{key}",
      mimeType: "text/markdown",
    },
    async(uri, variables) => {
      const key = Array.isArray(variables.key) ? variables.key[0] : variables.key
      const response = await s3.send(new GetObjectCommand({
        Bucket: config.minio.bucket,
        Key: key,
      }))
      const text = await response.Body?.transformToString("utf-8") ?? ""
      return {
        contents: [{ uri: uri.href, text }],
      }
    },
  )

  server.registerResource(
    "local-guide",
    "local://local-guide",
    {
      title: "Local Guide",
      description: "Workshop documentation read from local filesystem",
      mimeType: "text/markdown",
    },
    async uri => {
      const filePath = resolve(process.cwd(), "resources", "local-guide.md")
      const text = await readFile(filePath, "utf-8")
      return {
        contents: [{ uri: uri.href, text }],
      }
    },
  )

  server.registerPrompt(
    "lucky-number",
    {
      title: "Lucky Number",
      description: "Generates a greeting followed by a lucky number drawn using the random-number tool.",
      argsSchema: z.object({
        max: z.string().default("100").describe("Upper bound for the lucky number (inclusive)"),
      }),
    },
    async({ max }) => {
      const steps = [
        "Greet the user with a formal, distinguished salutation.",
        "Call the `random-number` tool with min=1 and max=" + max + " to generate their lucky number.",
        "Present the lucky number to the user in a ceremonious manner.",
      ]

      return {
        messages: [
          {
            role: "assistant" as const,
            content: {
              type: "text" as const,
              text: [
                "You are a formal and distinguished assistant.",
                "Always address the user with utmost courtesy and professionalism.",
                "Respond in a refined, elegant tone befitting a royal advisor.",
              ].join("\n"),
            },
          },
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                "Please follow these steps exactly:",
                "",
                ...steps.map((value, index) => `${index + 1}. ${value}`),
              ].join("\n"),
            },
          },
        ],
      }
    },
  )

  return server
}

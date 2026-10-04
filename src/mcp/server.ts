import { getLogBuffer } from '../sinks/buffer.js'
import { queryLogs } from './query.js'

export type McpServerOptions = {
  name?: string
  version?: string
}

/** Start stdio MCP server exposing captured Panasch logs (Node.js). */
export async function startMcpLogServer (options: McpServerOptions = {}): Promise<void> {
  const sdkModule = await import('@modelcontextprotocol/sdk/server/index.js') as {
    Server: new (info: { name: string, version: string }, opts: { capabilities: { tools: Record<string, unknown> } }) => {
      setRequestHandler: (schema: unknown, handler: (request: { params: { name: string, arguments?: Record<string, unknown> } }) => Promise<unknown>) => void
      connect: (transport: unknown) => Promise<void>
    }
  }
  const transportModule = await import('@modelcontextprotocol/sdk/server/stdio.js') as {
    StdioServerTransport: new () => unknown
  }
  const typesModule = await import('@modelcontextprotocol/sdk/types.js') as {
    ListToolsRequestSchema: unknown
    CallToolRequestSchema: unknown
  }

  const server = new sdkModule.Server(
    { name: options.name ?? 'panasch-logs', version: options.version ?? '1.0.0' },
    { capabilities: { tools: {} } }
  )

  server.setRequestHandler(typesModule.ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'query_logs',
        description: 'Query captured Panasch logs with `SELECT * FROM logs WHERE field = value LIMIT n`',
        inputSchema: {
          type: 'object',
          properties: {
            sql: { type: 'string', description: 'SQL-ish query string' }
          },
          required: ['sql']
        }
      },
      {
        name: 'list_recent_logs',
        description: 'Return the most recent captured log records',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Max rows (default 20)' }
          }
        }
      }
    ]
  }))

  server.setRequestHandler(typesModule.CallToolRequestSchema, async (request) => {
    const name = request.params.name
    const args = request.params.arguments ?? {}

    if (name === 'list_recent_logs') {
      const limit = typeof args.limit === 'number' ? args.limit : 20
      const rows = getLogBuffer().slice(-limit)
      return {
        content: [{ type: 'text', text: JSON.stringify(rows, null, 2) }]
      }
    }

    if (name === 'query_logs') {
      const sql = typeof args.sql === 'string' ? args.sql : ''
      const result = queryLogs(sql, getLogBuffer())
      if (result.error !== undefined) {
        return {
          content: [{ type: 'text', text: result.error }],
          isError: true
        }
      }
      return {
        content: [{ type: 'text', text: JSON.stringify(result.rows, null, 2) }]
      }
    }

    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}` }],
      isError: true
    }
  })

  const transport = new transportModule.StdioServerTransport()
  await server.connect(transport)
}

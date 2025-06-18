import {
	type ILoadOptionsFunctions,
	type INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';

import type { McpAuthenticationOption, McpTransportOption } from './types';
import { connectMcpClient, getAllTools, getAuthHeaders } from './utils';

export async function getTools(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const authentication = this.getNodeParameter('authentication') as McpAuthenticationOption;
	const endpoint = this.getNodeParameter('endpoint') as string;
	const transport = this.getNodeParameter('transport', 0, 'sse') as McpTransportOption;
	const node = this.getNode();
	const { headers } = await getAuthHeaders(this, authentication);
	const client = await connectMcpClient({
		endpoint,
		transport,
		headers,
		name: node.type,
		version: node.typeVersion,
	});

	if (!client.ok) {
		throw new NodeOperationError(this.getNode(), 'Could not connect to your MCP server');
	}

	const tools = await getAllTools(client.result);
	return tools.map((tool) => ({
		name: tool.name,
		value: tool.name,
		description: tool.description,
		inputSchema: tool.inputSchema,
	}));
}

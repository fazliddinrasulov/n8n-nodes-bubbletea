import {
	IWebhookFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	IWebhookResponseData,
} from 'n8n-workflow';

export class BubbleTeaChatTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'BubbleTea Chat Trigger',
		name: 'bubbleTeaTrigger',
		icon: 'file:bubbletea-chat.svg',
		group: ['trigger'],
		version: 1,
		subtitle: 'Receive BubbleTea chat events',
		description: 'Starts the workflow when BubbleTea sends an event',
		defaults: {
			name: 'BubbleTea Webhook',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],

		// Define webhook entry
		webhooks: [
			{
				name: 'default',
				httpMethod: '={{$parameter["httpMethod"]}}', // bound to property
				path: '={{$parameter["path"]}}',             // bound to property
				responseMode: 'responseNode',
				isFullPath: false,
			},
		],

		properties: [
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				options: [
					{ name: 'GET', value: 'GET' },
					{ name: 'POST', value: 'POST' },
				],
				default: 'POST',
				description: 'Select the HTTP method',
			},
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: 'chat',
				placeholder: 'e.g. chat',
				description: 'Webhook path (appended to /webhook/)',
			},
			{
				displayName: 'Respond',
				name: 'respond',
				type: 'options',
				options: [
					{ name: "Using 'Respond to Webhook' Node", value: 'responseNode' },
				],
				default: 'responseNode',
				description: 'How to respond to the request',
			},
		],
	};

	// Webhook implementation
	webhookMethods: any = {
		default: {
			async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
				const req = this.getRequestObject();
				const res = this.getResponseObject();

				// Only allow configured method
				const method = this.getNodeParameter('httpMethod', 0) as string;
				if (req.method !== method) {
					res.status(405).json({ error: `Only ${method} allowed` });
					return { noWebhookResponse: true };
				}

				// Pass request body into workflow
				const returnItem: INodeExecutionData = { json: req.body };

				return {
					workflowData: [[returnItem]],
				};
			},
		},
	};
}

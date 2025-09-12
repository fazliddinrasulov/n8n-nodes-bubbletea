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

		// Webhook config (hard-coded)
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				path: 'chat',              // fixed endpoint
				responseMode: 'responseNode', // always requires Respond node
			},
		],

		// No user-configurable parameters
		properties: [],
	};

	// Webhook implementation
	// @ts-ignore
	webhookMethods = {
		default: {
			async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
				const req = this.getRequestObject();
				const res = this.getResponseObject();

				// Only accept POST
				if (req.method !== 'POST') {
					res.status(405).json({ error: 'Only POST allowed' });
					return { noWebhookResponse: true };
				}

				// Send incoming JSON into workflow
				const returnItem: INodeExecutionData = { json: req.body };

				return {
					workflowData: [[returnItem]],
				};
			},
		},
	};
}

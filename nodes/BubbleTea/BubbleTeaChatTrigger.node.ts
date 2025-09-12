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

		// Hardcoded webhook definition
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				path: 'chat',
				responseMode: 'responseNode',
			},
		],

		properties: [],
	};

	// Implementation of the webhook
	// @ts-ignore
	webhookMethods = {
		default: {
			async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
				const req = this.getRequestObject();
				const res = this.getResponseObject();

				// Only POST allowed
				if (req.method !== 'POST') {
					res.status(405).json({ error: 'Only POST allowed' });
					return { noWebhookResponse: true };
				}

				// Push request body into workflow
				const returnItem: INodeExecutionData = {
					json: req.body,
				};

				return {
					workflowData: [[returnItem]],
				};
			},
		},
	};
}

import {
	IWebhookFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
	INodeOutputConfiguration,
} from 'n8n-workflow';

export class BubbleTeaChatTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'BubbleTea Chat Trigger',
		name: 'bubbleTeaChatTrigger',
		icon: 'file:bubbletea-chat.svg',
		group: ['trigger'],
		version: 1,
		subtitle: 'Receive BubbleTea chat events',
		description: 'Starts the workflow when BubbleTea sends an event',
		defaults: { name: 'BubbleTea Webhook' },
		inputs: [],
		outputs: ['main'] as unknown as (NodeConnectionType | INodeOutputConfiguration)[],

		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				path: '={{$parameter["path"]}}',
				responseMode: 'onReceived',
				isFullPath: false,
			},
		],

		properties: [
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: 'chat',
				placeholder: 'e.g. chat',
			},
		],
	};

	webhookMethods:any = {
		default: {
			async checkExists(this: IWebhookFunctions): Promise<boolean> {
				return false; // har safar create ishlasin
			},
			async create(this: IWebhookFunctions): Promise<boolean> {
				return true;
			},
			async delete(this: IWebhookFunctions): Promise<boolean> {
				return true;
			},
			async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
				const req = this.getRequestObject();
				const item: INodeExecutionData = { json: req.body ?? {} };
				return { workflowData: [[item]] };
			},
		},
	};
}

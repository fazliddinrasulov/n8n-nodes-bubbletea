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
		inputs: [],                   // trigger = no inputs
    outputs: ['main'] as unknown as (NodeConnectionType | INodeOutputConfiguration)[],

		webhooks: [
			{
				name: 'default',
				httpMethod: '={{$parameter["httpMethod"]}}',
				path: '={{$parameter["path"]}}',
				responseMode: 'responseNode',
				isFullPath: false,
			},
		],

		properties: [
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				options: [{ name: 'GET', value: 'GET' }, { name: 'POST', value: 'POST' }],
				default: 'POST',
			},
			{
				displayName: 'Path',
				name: 'path',
				type: 'string',
				default: 'chat',
				placeholder: 'e.g. chat',
			},
			{
				displayName: 'Respond',
				name: 'respond',
				type: 'options',
				options: [{ name: "Using 'Respond to Webhook' Node", value: 'responseNode' }],
				default: 'responseNode',
			},
		],
	};

	// loosen typing here; older n8n typings otherwise demand create/checkExists/delete
	webhookMethods: any = {
		default: {
			async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
				const req = this.getRequestObject();
				const method = this.getNodeParameter('httpMethod', 0) as string;

				if (req.method !== method) {
					this.getResponseObject().status(405).json({ error: `Only ${method} allowed` });
					return { noWebhookResponse: true };
				}

				const item: INodeExecutionData = { json: req.body ?? {} };
				return { workflowData: [[item]] };
			},
		},
	};
}

import {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
	INodeOutputConfiguration,
	LoggerProxy,
	IHookFunctions,
	IDataObject,
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
		inputs: [], // trigger = no inputs
		outputs: ['main'] as unknown as (NodeConnectionType | INodeOutputConfiguration)[],

		webhooks: [
			{
				name: 'default',
				httpMethod: '={{$parameter["httpMethod"]}}',
				path: '={{$parameter["path"]}}',
				responseMode: '={{$parameter["respond"]}}',   // <- required
				isFullPath: false,
			},
		],

		properties: [
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				options: [
					// { name: 'DELETE', value: 'DELETE' },
					{ name: 'GET', value: 'GET' },
					// { name: 'HEAD', value: 'HEAD' },
					// { name: 'PATCH', value: 'PATCH' },
					{ name: 'POST', value: 'POST' },
					// { name: 'PUT', value: 'PUT' },
				],
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
				options: [
					// {
					// 	name: 'Immediately',
					// 	value: 'onReceived',
					// 	description: 'As soon as this node executes',
					// },
					{
						name: 'When Last Node Finishes',
						value: 'lastNode',
						description: 'Return data of the last executed node',
					},
					// {
					// 	name: "Using 'Respond to Webhook' Node",
					// 	value: 'responseNode',
					// 	description: 'Response defined in a Respond to Webhook node',
					// },
					// {
					// 	name: 'Streaming',
					// 	value: 'streaming',
					// 	description: 'Return data in real time from streaming-enabled nodes',
					// },
				],
				default: 'lastNode',
				description: 'Response defined in a Respond to Webhook node',
			},
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: 'None', value: 'none' },
			// 		{ name: 'Basic Auth', value: 'basicAuth' },
					{ name: 'Header Auth', value: 'headerAuth' },
			// 		{ name: 'JWT Auth', value: 'jwtAuth' },
				],
				default: 'none',
				description: 'How to authenticate incoming requests',
			},
			{
				displayName: 'Header Name',
				name: 'headerName',
				type: 'string',
				default: 'x-api-key',
				displayOptions: { show: { authentication: ['headerAuth'] } },
			},
			{
				displayName: 'Expected Value',
				name: 'headerValue',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				displayOptions: { show: { authentication: ['headerAuth'] } },
			},
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{ name: 'Order Created', value: 'order.created' },
					{ name: 'Order Status Changed', value: 'order.status.changed' },
				],
				default: 'order.created',
				description: 'The BubbleTea event to listen for',
			},
		],
	};


	// This method is called when the node is activated (when the workflow is activated)
	async activate(this: IHookFunctions): Promise<boolean> {
		try {
			LoggerProxy.info('MyCustomNode Webhook: ACTIVATE method called');
			// TODO: register webhook with BubbleTea API if needed
			return true;
		} catch (error: any) {
			LoggerProxy.error('MyCustomNode Webhook: Error in activate method', { error });
			throw error;
		}
	}

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		LoggerProxy.info('MyCustomNode Webhook: WEBHOOK method called');

		const respond = this.getNodeParameter('respond', 0) as string;
		const authMode = this.getNodeParameter('authentication', 0) as string;

		const body = this.getBodyData() as IDataObject;
		const headers = this.getHeaderData() as IDataObject;
		const query = this.getQueryData() as IDataObject;
		const params = this.getParamsData() as IDataObject;

		if (authMode === 'headerAuth') {
			const headerName = (this.getNodeParameter('headerName', 0) as string).toLowerCase();
			const expected = this.getNodeParameter('headerValue', 0) as string;

			const incoming =
				(headers[headerName] as string) ??
				(headers[headerName.replace(/-/g, '_')] as string) ??
				undefined;

			if (!expected || incoming !== expected) {
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'unauthorized' },
					},
				};
			}
		}

		const response: IDataObject = {
			headers,
			params,
			query,
			body,
			webhookUrl: this.getNodeWebhookUrl('default'),
			executionMode: this.getMode(),
		};

		if (respond === 'lastNode') {
			// let workflow run and last node output will be sent back
			return {
				workflowData: [this.helpers.returnJsonArray(response)],
			};
		}

		// fallback
		return {
			workflowData: [this.helpers.returnJsonArray(response)],
		};
	}

}

import type {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	NodeConnectionType,
	INodeOutputConfiguration,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IHookFunctions,
	IDataObject,
} from 'n8n-workflow';
import { LoggerProxy } from 'n8n-workflow';

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
				responseMode: 'responseNode',   // <- required
				isFullPath: false,
			},
		],

		properties: [
			{
				displayName: 'HTTP Method',
				name: 'httpMethod',
				type: 'options',
				options: [
					{ name: 'DELETE', value: 'DELETE' },
					{ name: 'GET', value: 'GET' },
					{ name: 'HEAD', value: 'HEAD' },
					{ name: 'PATCH', value: 'PATCH' },
					{ name: 'POST', value: 'POST' },
					{ name: 'PUT', value: 'PUT' },
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
					{
						name: 'Immediately',
						value: 'onReceived',
						description: 'As soon as this node executes',
					},
					{
						name: 'When Last Node Finishes',
						value: 'lastNode',
						description: 'Return data of the last executed node',
					},
					{
						name: "Using 'Respond to Webhook' Node",
						value: 'responseNode',
						description: 'Response defined in a Respond to Webhook node',
					},
					{
						name: 'Streaming',
						value: 'streaming',
						description: 'Return data in real time from streaming-enabled nodes',
					},
				],
				default: 'responseNode',
				description: 'Response defined in a Respond to Webhook node',
			},
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{ name: 'None', value: 'none' },
					{ name: 'Basic Auth', value: 'basicAuth' },
					{ name: 'Header Auth', value: 'headerAuth' },
					{ name: 'JWT Auth', value: 'jwtAuth' },
				],
				default: 'none',
				description: 'How to authenticate incoming requests',
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

	// loosen typing here; older n8n typings otherwise demand create/checkExists/delete

	// Methods to load options dynamically
	methods = {
		loadOptions: {
			async getWebhookEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				LoggerProxy.info('MyCustomNode Webhook: getWebhookEvents method called');
				return [
					// Order events
					{ name: 'Order Created', value: 'order.created' },
					{ name: 'Order Status Changed', value: 'order.status.changed' },
				];
			},
		},
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


	webhookMethods: any = {
		default: {
			async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
				const response: IDataObject = {
					headers: this.getHeaderData(),
					params: this.getParamsData(),
					query: this.getQueryData(),
					body: this.getBodyData(),
					webhookUrl: this.getNodeWebhookUrl('default'),
					executionMode: this.getMode(),
				};
				return {
					workflowData: [this.helpers.returnJsonArray(response)],
					noWebhookResponse: true, // Respond to Webhook will reply
				};
			},
			async checkExists(this: IWebhookFunctions) { return false; },
			async create(this: IWebhookFunctions) { return true; },
			async delete(this: IWebhookFunctions) { return true; },
		},
	};
}

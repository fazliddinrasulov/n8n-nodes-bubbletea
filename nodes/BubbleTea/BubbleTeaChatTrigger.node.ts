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
import { LoggerProxy, NodeApiError } from 'n8n-workflow';

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
				httpMethod: '={{$parameter["httpMethod"]}}',
				path: '={{$parameter["path"]}}',
				responseMode: '={{$parameter["respond"]}}', // must reflect UI param
				isFullPath: false,
			},
		],

		properties: [
			{ displayName: 'HTTP Method', name: 'httpMethod', type: 'options',
				options: [{name:'DELETE',value:'DELETE'},{name:'GET',value:'GET'},{name:'HEAD',value:'HEAD'},
					{name:'PATCH',value:'PATCH'},{name:'POST',value:'POST'},{name:'PUT',value:'PUT'}],
				default: 'POST',
			},
			{ displayName: 'Path', name: 'path', type: 'string', default: 'chat', placeholder: 'e.g. chat' },
			{ displayName: 'Respond', name: 'respond', type: 'options',
				options: [
					{ name: 'Immediately', value: 'onReceived' },
					{ name: 'When Last Node Finishes', value: 'lastNode' },
					{ name: "Using 'Respond to Webhook' Node", value: 'responseNode' },
					{ name: 'Streaming', value: 'streaming' },
				],
				default: 'responseNode',
			},
			{ displayName: 'Authentication', name: 'authentication', type: 'options',
				options: [
					{ name: 'None', value: 'none' },
					{ name: 'Basic Auth', value: 'basicAuth' },
					{ name: 'Header Auth', value: 'headerAuth' },
					{ name: 'JWT Auth', value: 'jwtAuth' },
				],
				default: 'none',
			},
			{ displayName: 'Event', name: 'event', type: 'options',
				options: [
					{ name: 'Order Created', value: 'order.created' },
					{ name: 'Order Status Changed', value: 'order.status.changed' },
				],
				default: 'order.created',
			},
		],
	};

	methods = {
		loadOptions: {
			async getWebhookEvents(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				LoggerProxy.info('BubbleTea Webhook: getWebhookEvents');
				return [
					{ name: 'Order Created', value: 'order.created' },
					{ name: 'Order Status Changed', value: 'order.status.changed' },
				];
			},
		},
	};

	async activate(this: IHookFunctions): Promise<boolean> {
		try {
			LoggerProxy.info('BubbleTea Webhook: activate');
			return true;
		} catch (error: any) {
			LoggerProxy.error('BubbleTea Webhook: activate error', { error });
			throw error;
		}
	}

	// >>> THIS is where n8n expects the handler
	webhookMethods: any = {
		default: {
			async checkExists(this: IWebhookFunctions) { return false; },
			async create(this: IWebhookFunctions) { return true; },
			async delete(this: IWebhookFunctions) { return true; },

			async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
				try {
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
						noWebhookResponse: true, // Respond to Webhook will send the reply
					};
				} catch (error) {
					throw new NodeApiError(this.getNode(), error);
				}
			},
		},
	};
}

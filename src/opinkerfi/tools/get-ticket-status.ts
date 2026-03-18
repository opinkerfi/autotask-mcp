// opinkerfi: get-ticket-status tool
// Quick status lookup for an Autotask ticket

import { McpTool } from '../../handlers/tool.handler.js';

export const getTicketStatusTool: McpTool = {
  name: 'ok_get_ticket_status',
  description:
    'Get the current status, assignee, and key fields of an Autotask ticket by ticket ID or ticket number.',
  inputSchema: {
    type: 'object',
    properties: {
      ticket_id: {
        type: 'number',
        description: 'Autotask ticket internal ID',
      },
      ticket_number: {
        type: 'string',
        description: 'Autotask ticket number (e.g., T20260318.0042)',
      },
    },
    required: [],
  },
};

export async function getTicketStatus(
  _client: unknown,
  _params: {
    ticket_id?: number;
    ticket_number?: string;
  }
): Promise<{ result: unknown; message: string }> {
  // TODO: Implement ticket status lookup via Autotask API
  return {
    result: null,
    message: 'Not yet implemented',
  };
}

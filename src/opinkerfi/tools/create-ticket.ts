// opinkerfi: create-ticket tool
// Context-aware Autotask ticket creation from GitHub issues

import { McpTool } from '../../types/mcp.js';

export const createTicketTool: McpTool = {
  name: 'ok_create_ticket',
  description:
    'Create a new Autotask ticket from a GitHub issue, pre-filling fields from repo config and issue context.',
  inputSchema: {
    type: 'object',
    properties: {
      issue_number: {
        type: 'number',
        description: 'GitHub issue number',
      },
      issue_title: {
        type: 'string',
        description: 'GitHub issue title',
      },
      issue_body: {
        type: 'string',
        description: 'GitHub issue body / description',
      },
      company_id: {
        type: 'number',
        description: 'Autotask company ID to assign the ticket to',
      },
      project_id: {
        type: 'number',
        description: 'Autotask project ID to associate the ticket with',
      },
      phase_id: {
        type: 'number',
        description: 'Autotask project phase ID',
      },
      assignee_resource_id: {
        type: 'number',
        description: 'Autotask resource ID to assign the ticket to',
      },
      priority: {
        type: 'number',
        description: 'Ticket priority ID',
      },
      status: {
        type: 'number',
        description: 'Ticket status ID',
      },
    },
    required: ['issue_number', 'issue_title'],
  },
};

export async function createTicket(
  _client: unknown,
  _params: {
    issue_number: number;
    issue_title: string;
    issue_body?: string;
    company_id?: number;
    project_id?: number;
    phase_id?: number;
    assignee_resource_id?: number;
    priority?: number;
    status?: number;
  }
): Promise<{ result: unknown; message: string }> {
  // TODO: Implement ticket creation
  return {
    result: null,
    message: 'Not yet implemented',
  };
}

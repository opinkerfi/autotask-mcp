// opinkerfi: find-ticket tool
// Multi-strategy search for Autotask tickets linked to GitHub issues

import { McpTool } from '../../types/mcp.js';

export const findTicketTool: McpTool = {
  name: 'ok_find_ticket',
  description:
    'Search for existing Autotask tickets using multiple strategies: by GitHub issue number pattern (#N), by title keywords, or by Autotask ticket number.',
  inputSchema: {
    type: 'object',
    properties: {
      issue_number: {
        type: 'number',
        description: 'GitHub issue number to search for (e.g., 316)',
      },
      issue_title: {
        type: 'string',
        description: 'GitHub issue title for keyword search fallback',
      },
      ticket_number: {
        type: 'string',
        description: 'Autotask ticket number if user provides it (format: T20260318.0042)',
      },
      company_id: {
        type: 'number',
        description: 'Limit search to specific company ID',
      },
      project_id: {
        type: 'number',
        description: 'Limit search to specific project ID',
      },
    },
    required: ['issue_number'],
  },
};

export async function findTicket(
  _client: unknown,
  _params: {
    issue_number: number;
    issue_title?: string;
    ticket_number?: string;
    company_id?: number;
    project_id?: number;
  }
): Promise<{ result: unknown; message: string }> {
  // TODO: Implement multi-strategy search
  return {
    result: { found: false, matches: [] },
    message: 'Not yet implemented',
  };
}

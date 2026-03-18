// opinkerfi: link-ticket-to-issue tool
// Record an Autotask ticket number in a GitHub issue (comment or label)

import { McpTool } from '../../types/mcp.js';

export const linkTicketToIssueTool: McpTool = {
  name: 'ok_link_ticket_to_issue',
  description:
    'Record an Autotask ticket reference inside a GitHub issue by posting a comment with the ticket number.',
  inputSchema: {
    type: 'object',
    properties: {
      issue_number: {
        type: 'number',
        description: 'GitHub issue number',
      },
      ticket_number: {
        type: 'string',
        description: 'Autotask ticket number (e.g., T20260318.0042)',
      },
      ticket_id: {
        type: 'number',
        description: 'Autotask ticket internal ID',
      },
      repo: {
        type: 'string',
        description: 'GitHub repo in owner/name format (defaults to current repo)',
      },
    },
    required: ['issue_number', 'ticket_number'],
  },
};

export async function linkTicketToIssue(
  _client: unknown,
  _params: {
    issue_number: number;
    ticket_number: string;
    ticket_id?: number;
    repo?: string;
  }
): Promise<{ result: unknown; message: string }> {
  // TODO: Implement GitHub issue comment with ticket reference
  return {
    result: null,
    message: 'Not yet implemented',
  };
}

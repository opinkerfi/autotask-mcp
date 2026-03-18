// opinkerfi: link-issue-to-ticket tool
// Add a GitHub issue reference to an Autotask ticket note

import { McpTool } from '../../handlers/tool.handler.js';

export const linkIssueToTicketTool: McpTool = {
  name: 'ok_link_issue_to_ticket',
  description:
    'Add a note to an Autotask ticket that references the originating GitHub issue URL.',
  inputSchema: {
    type: 'object',
    properties: {
      ticket_id: {
        type: 'number',
        description: 'Autotask ticket internal ID',
      },
      issue_number: {
        type: 'number',
        description: 'GitHub issue number',
      },
      issue_url: {
        type: 'string',
        description: 'Full GitHub issue URL',
      },
      repo: {
        type: 'string',
        description: 'GitHub repo in owner/name format',
      },
    },
    required: ['ticket_id', 'issue_number'],
  },
};

export async function linkIssueToTicket(
  _client: unknown,
  _params: {
    ticket_id: number;
    issue_number: number;
    issue_url?: string;
    repo?: string;
  }
): Promise<{ result: unknown; message: string }> {
  // TODO: Implement Autotask ticket note with GitHub issue reference
  return {
    result: null,
    message: 'Not yet implemented',
  };
}

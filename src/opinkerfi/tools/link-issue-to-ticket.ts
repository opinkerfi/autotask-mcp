// opinkerfi: link-issue-to-ticket tool
// Adds a note to an Autotask ticket referencing the associated GitHub issue.
// Uses AutotaskService.createTicketNote via the service client.

import { McpTool } from '../../types/mcp.js';

export const linkIssueToTicketTool: McpTool = {
  name: 'ok_link_issue_to_ticket',
  description:
    'Add a note to an Autotask ticket that contains the GitHub issue URL. Idempotent: if a note with the same issue URL already exists, no duplicate is created.',
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
        description: 'Full GitHub issue URL (constructed automatically if omitted)',
      },
      repo: {
        type: 'string',
        description: 'GitHub repo in "owner/name" format (used to construct URL if issue_url omitted)',
      },
    },
    required: ['ticket_id', 'issue_number'],
  },
};

export async function linkIssueToTicket(
  client: unknown,
  params: {
    ticket_id: number;
    issue_number: number;
    issue_url?: string;
    repo?: string;
  }
): Promise<{ result: unknown; message: string }> {
  const svc = client as any;
  const issueUrl =
    params.issue_url ??
    (params.repo
      ? `https://github.com/${params.repo}/issues/${params.issue_number}`
      : `GitHub issue #${params.issue_number}`);

  try {
    // Check existing notes to avoid duplicates
    const existingNotes: any[] = await svc.searchTicketNotes(params.ticket_id, {});
    const alreadyLinked = existingNotes.some(
      (n) => typeof n.noteText === 'string' && n.noteText.includes(issueUrl)
    );

    if (alreadyLinked) {
      return {
        result: { linked: true, skipped: true },
        message: `Ticket ${params.ticket_id} already has a note linking to ${issueUrl}`,
      };
    }

    await svc.createTicketNote(params.ticket_id, {
      noteType: 1, // Detail note
      noteText: `Linked GitHub Issue: ${issueUrl}`,
    });

    return {
      result: { linked: true, skipped: false },
      message: `Added GitHub issue link to Autotask ticket ${params.ticket_id}`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      result: { linked: false, error },
      message: `Failed to add note to ticket ${params.ticket_id}: ${error}`,
    };
  }
}

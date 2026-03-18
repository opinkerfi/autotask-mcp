// opinkerfi: link-ticket-to-issue tool
// Updates a GitHub issue body to include the Autotask ticket URL as the first line.
// Uses the GitHub REST API via GITHUB_TOKEN environment variable.
// Idempotent: replaces existing 🎫 link if present instead of duplicating.

import { McpTool } from '../../types/mcp.js';
import { execSync } from 'child_process';

export const linkTicketToIssueTool: McpTool = {
  name: 'ok_link_ticket_to_issue',
  description:
    'Add or update the Autotask ticket URL as the first line of a GitHub issue body. Uses 🎫 emoji prefix. Idempotent: replaces existing ticket link if found.',
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
        description: 'Autotask ticket internal ID (for URL construction)',
      },
      ticket_url: {
        type: 'string',
        description: 'Full Autotask ticket URL (constructed from ticket_id if omitted)',
      },
      repo: {
        type: 'string',
        description: 'GitHub repo in "owner/name" format (defaults to current repo from git remote)',
      },
    },
    required: ['issue_number', 'ticket_number'],
  },
};

const TICKET_LINK_PATTERN = /^🎫 \[T[\d.]+\]\(https:\/\/ww\d+\.autotask\.net[^\)]+\)\s*/m;

function buildTicketUrl(ticketId: number): string {
  return `https://ww19.autotask.net/Autotask/AutotaskExtend/ExecuteCommand.aspx?Code=OpenTicketDetail&TicketID=${ticketId}`;
}

function detectRepo(): string | null {
  try {
    const remote = execSync('git remote get-url origin 2>/dev/null', { encoding: 'utf-8' }).trim();
    const match = remote.match(/github\.com[:/](.+?)(?:\.git)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function linkTicketToIssue(
  _client: unknown,
  params: {
    issue_number: number;
    ticket_number: string;
    ticket_id?: number;
    ticket_url?: string;
    repo?: string;
  }
): Promise<{ result: unknown; message: string }> {
  const repo = params.repo ?? detectRepo();
  if (!repo) {
    return {
      result: { linked: false, error: 'Could not determine GitHub repo. Provide "repo" parameter.' },
      message: 'repo parameter required or must be run inside a git repo with a GitHub remote.',
    };
  }

  const ticketUrl =
    params.ticket_url ??
    (params.ticket_id ? buildTicketUrl(params.ticket_id) : null);

  if (!ticketUrl) {
    return {
      result: { linked: false, error: 'Provide ticket_url or ticket_id to construct the URL.' },
      message: 'ticket_url or ticket_id required.',
    };
  }

  const ticketLink = `🎫 [${params.ticket_number}](${ticketUrl})`;

  try {
    // Get current issue body via gh CLI
    const bodyJson = execSync(
      `gh issue view ${params.issue_number} --repo ${repo} --json body -q .body`,
      { encoding: 'utf-8' }
    ).trim();
    const currentBody = bodyJson ?? '';

    let newBody: string;
    if (TICKET_LINK_PATTERN.test(currentBody)) {
      // Replace existing link
      newBody = currentBody.replace(TICKET_LINK_PATTERN, ticketLink + '\n');
    } else {
      // Prepend link
      newBody = ticketLink + '\n' + (currentBody ? '\n' + currentBody : '');
    }

    // Update issue body via gh CLI
    execSync(
      `gh issue edit ${params.issue_number} --repo ${repo} --body ${JSON.stringify(newBody)}`,
      { encoding: 'utf-8' }
    );

    return {
      result: { linked: true },
      message: `Updated GitHub issue #${params.issue_number} in ${repo} with Autotask ticket ${params.ticket_number}`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      result: { linked: false, error },
      message: `Failed to update GitHub issue: ${error}`,
    };
  }
}

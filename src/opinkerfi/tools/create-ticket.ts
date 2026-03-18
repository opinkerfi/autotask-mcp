// opinkerfi: create-ticket tool
// Context-aware Autotask ticket creation from GitHub issues.
// Supports three modes: company ticket, project task, internal-dev task.

import { McpTool } from '../../types/mcp.js';

export const createTicketTool: McpTool = {
  name: 'ok_create_ticket',
  description:
    'Create an Autotask ticket linked to a GitHub issue. Modes: company (direct), project (under a project phase), internal-dev (shorthand for the OpinKerfi Internal Dev project). Title auto-formats as "#{issue_number} - {issue_title}".',
  inputSchema: {
    type: 'object',
    properties: {
      company_id: { type: 'number', description: 'Autotask company ID' },
      project_id: { type: 'number', description: 'Project ID (required for project/internal-dev mode)' },
      phase_id:   { type: 'number', description: 'Phase ID within the project (optional)' },
      issue_number: { type: 'number', description: 'GitHub issue number' },
      issue_title:  { type: 'string', description: 'GitHub issue title' },
      mode: {
        type: 'string',
        enum: ['company', 'project', 'internal-dev'],
        description: 'Ticket creation mode',
      },
      queue_id: { type: 'number', description: 'Queue ID override (defaults to ok-lausnir ser)' },
    },
    required: ['company_id', 'issue_number', 'issue_title', 'mode'],
  },
};

export async function createTicket(
  client: unknown,
  params: {
    company_id: number;
    project_id?: number;
    phase_id?: number;
    issue_number: number;
    issue_title: string;
    mode: 'company' | 'project' | 'internal-dev';
    queue_id?: number;
  }
): Promise<{ result: unknown; message: string }> {
  const svc = client as any;
  const title = `#${params.issue_number} - ${params.issue_title}`;

  try {
    if ((params.mode === 'project' || params.mode === 'internal-dev') && !params.project_id) {
      return {
        result: { created: false, error: 'project_id is required for project/internal-dev mode' },
        message: 'project_id is required for project/internal-dev mode',
      };
    }

    const ticketData: Record<string, unknown> = {
      companyID: params.company_id,
      title,
      status: 1,    // New
      priority: 3,  // Standard
      queueID: params.queue_id ?? 29682833, // ok-lausnir ser
      dueDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    if (params.mode === 'project' || params.mode === 'internal-dev') {
      ticketData['projectID'] = params.project_id;
      if (params.phase_id) {
        ticketData['phaseID'] = params.phase_id;
      }
    }

    const ticketId: number = await svc.createTicket(ticketData);
    const ticket = await svc.getTicket(ticketId);
    const ticketNumber: string = ticket?.ticketNumber ?? '';
    const ticketUrl = `https://ww19.autotask.net/Autotask/AutotaskExtend/ExecuteCommand.aspx?Code=OpenTicketDetail&TicketID=${ticketId}`;

    return {
      result: { created: true, ticket_id: ticketId, ticket_number: ticketNumber, ticket_url: ticketUrl },
      message: `Created ticket ${ticketNumber} (ID: ${ticketId}): "${title}"`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      result: { created: false, error },
      message: `Failed to create ticket: ${error}`,
    };
  }
}

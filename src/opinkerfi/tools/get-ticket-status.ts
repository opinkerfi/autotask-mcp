// opinkerfi: get-ticket-status tool
// Quick status lookup for an Autotask ticket

import { McpTool } from '../../types/mcp.js';

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
  client: unknown,
  params: {
    ticket_id?: number;
    ticket_number?: string;
  }
): Promise<{ result: unknown; message: string }> {
  if (!params.ticket_id && !params.ticket_number) {
    return {
      result: { error: 'Provide ticket_id or ticket_number' },
      message: 'Either ticket_id or ticket_number is required',
    };
  }

  const svc = client as any;

  try {
    let ticket: any = null;

    if (params.ticket_id) {
      ticket = await svc.getTicket(params.ticket_id);
    } else if (params.ticket_number) {
      const results = await svc.searchTickets({
        filter: [{ op: 'eq', field: 'ticketNumber', value: params.ticket_number }],
        pageSize: 1,
      });
      ticket = results?.[0] ?? null;
    }

    if (!ticket) {
      return {
        result: { found: false },
        message: `Ticket not found`,
      };
    }

    return {
      result: {
        found: true,
        ticket_id: ticket.id,
        ticket_number: ticket.ticketNumber,
        title: ticket.title,
        status: ticket.status,
        priority: ticket.priority,
        queue_id: ticket.queueID,
        assigned_resource_id: ticket.assignedResourceID,
        company_id: ticket.companyID,
        project_id: ticket.projectID,
      },
      message: `Ticket ${ticket.ticketNumber}: status=${ticket.status}, title="${ticket.title}"`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      result: { found: false, error },
      message: `Failed to get ticket status: ${error}`,
    };
  }
}

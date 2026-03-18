// opinkerfi: find-ticket tool
// Multi-strategy search for Autotask tickets linked to GitHub issues

import { McpTool } from '../../types/mcp.js';
import { queryTickets, RawTicket } from '../utils/autotask-api.js';

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

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

interface TicketMatch {
  id: number;
  ticket_number: string;
  title: string;
  status: number;
  company_id: number;
}

interface FindTicketResult {
  found: boolean;
  count: number;
  matches: TicketMatch[];
  error?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function normalise(ticket: RawTicket): TicketMatch {
  return {
    id: ticket.id ?? 0,
    ticket_number: String(ticket.ticketNumber ?? ''),
    title: String(ticket.title ?? ''),
    status: Number(ticket.status ?? 0),
    company_id: Number(ticket.companyID ?? 0),
  };
}

function deduplicate(tickets: RawTicket[]): RawTicket[] {
  const seen = new Set<number>();
  return tickets.filter((t) => {
    if (t.id === undefined || seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}

/** Return the first N words of a string (splits on whitespace). */
function firstNWords(text: string, n: number): string {
  return text.trim().split(/\s+/).slice(0, n).join(' ');
}

// ──────────────────────────────────────────────────────────────────────────────
// Handler
// ──────────────────────────────────────────────────────────────────────────────

export async function findTicket(
  client: unknown,
  params: {
    issue_number: number;
    issue_title?: string;
    ticket_number?: string;
    company_id?: number;
    project_id?: number;
  }
): Promise<{ result: FindTicketResult; message: string }> {
  const { issue_number, issue_title, ticket_number, company_id } = params;

  try {
    const collected: RawTicket[] = [];

    // ── Strategy 1: search by #<issue_number> in title ──────────────────────
    {
      const filters: { op: string; field: string; value: string | number | null }[] = [
        { op: 'contains', field: 'title', value: `#${issue_number}` },
      ];
      if (company_id !== undefined) {
        filters.push({ op: 'eq', field: 'companyID', value: company_id });
      }
      const results = await queryTickets(client, filters);
      collected.push(...results);
    }

    // ── Strategy 2: search by explicit ticket number (if provided) ───────────
    if (ticket_number) {
      const filters: { op: string; field: string; value: string | number | null }[] = [
        { op: 'eq', field: 'ticketNumber', value: ticket_number },
      ];
      const results = await queryTickets(client, filters);
      collected.push(...results);
    }

    // ── Strategy 3: keyword fallback (first 3 words of title) ───────────────
    if (collected.length === 0 && issue_title) {
      const keywords = firstNWords(issue_title, 3);
      if (keywords) {
        const filters: { op: string; field: string; value: string | number | null }[] = [
          { op: 'contains', field: 'title', value: keywords },
        ];
        if (company_id !== undefined) {
          filters.push({ op: 'eq', field: 'companyID', value: company_id });
        }
        const results = await queryTickets(client, filters);
        collected.push(...results);
      }
    }

    const unique = deduplicate(collected);
    const matches = unique.map(normalise);

    const result: FindTicketResult = {
      found: matches.length > 0,
      count: matches.length,
      matches,
    };

    const message =
      matches.length > 0
        ? `Found ${matches.length} ticket(s) for issue #${issue_number}`
        : `No tickets found for issue #${issue_number}`;

    return { result, message };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      result: { found: false, count: 0, matches: [], error },
      message: `Search failed: ${error}`,
    };
  }
}

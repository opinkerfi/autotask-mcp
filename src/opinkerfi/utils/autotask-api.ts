// opinkerfi: autotask-api utility
// Thin wrapper around AutotaskService that supports arbitrary filter arrays for
// ticket queries. AutotaskService.searchTickets builds its own filter array
// internally and does not expose a raw-filter path, so we access the underlying
// autotask-node client directly via the (private) ensureClient method.
//
// Usage:
//   import { queryTickets } from '../utils/autotask-api.js';
//   const tickets = await queryTickets(autotaskService, [
//     { op: 'contains', field: 'title', value: '#316' }
//   ]);

export interface TicketFilter {
  op: string;
  field: string;
  value: string | number | null;
}

export interface RawTicket {
  id?: number;
  ticketNumber?: string;
  title?: string;
  status?: number;
  companyID?: number;
  [key: string]: unknown;
}

/**
 * Run a POST /Tickets/query with an arbitrary filter array.
 *
 * We bypass AutotaskService's searchTickets method (which builds its own
 * closed filter set) by calling the private ensureClient() accessor via
 * TypeScript's any escape hatch. The autotask-node Tickets.list() method
 * passes the filter array through to the REST body unchanged when the value
 * is already an array.
 */
export async function queryTickets(
  service: unknown,
  filters: TicketFilter[],
  maxRecords = 50
): Promise<RawTicket[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svc = service as any;

  // ensureClient() triggers lazy initialisation if needed.
  const client = await svc['ensureClient']();

  const result = await client.tickets.list({
    filter: filters,
    pageSize: maxRecords,
  });

  return (result.data as RawTicket[]) ?? [];
}

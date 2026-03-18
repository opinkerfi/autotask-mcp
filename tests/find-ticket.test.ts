// Tests for ok_find_ticket – opinkerfi multi-strategy ticket search

// We mock the autotask-api utility so the tests never touch the real
// Autotask REST API.
jest.mock('../src/opinkerfi/utils/autotask-api', () => ({
  queryTickets: jest.fn(),
}));

import { findTicket } from '../src/opinkerfi/tools/find-ticket';
import { queryTickets } from '../src/opinkerfi/utils/autotask-api';

const mockQueryTickets = queryTickets as jest.MockedFunction<typeof queryTickets>;

// A minimal fake AutotaskService instance (the handler only passes it through
// to queryTickets, which is fully mocked here).
const fakeService = {};

// ─────────────────────────────────────────────────────────────────────────────

describe('findTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Happy path: issue # pattern match ──────────────────────────────────────

  test('returns match when #N pattern found in ticket title', async () => {
    const rawTicket = {
      id: 42,
      ticketNumber: 'T20260318.0042',
      title: 'Fix bug #316 in billing module',
      status: 1,
      companyID: 100,
    };

    // Strategy 1 returns a hit; strategies 2 & 3 are not called because
    // strategy 1 was provided no ticket_number and strategy 3 only runs on 0
    // results.
    mockQueryTickets.mockResolvedValueOnce([rawTicket]);

    const { result, message } = await findTicket(fakeService, { issue_number: 316 });

    expect(result.found).toBe(true);
    expect(result.count).toBe(1);
    expect(result.matches).toHaveLength(1);
    expect(result.matches[0]).toMatchObject({
      id: 42,
      ticket_number: 'T20260318.0042',
      title: 'Fix bug #316 in billing module',
      status: 1,
      company_id: 100,
    });
    expect(result.error).toBeUndefined();
    expect(message).toContain('Found 1 ticket');

    // Should have called queryTickets once for strategy 1
    expect(mockQueryTickets).toHaveBeenCalledTimes(1);
    expect(mockQueryTickets).toHaveBeenCalledWith(
      fakeService,
      [{ op: 'contains', field: 'title', value: '#316' }]
    );
  });

  // ── Strategy 2: explicit ticket number ────────────────────────────────────

  test('searches by ticket_number when provided', async () => {
    const rawTicket = {
      id: 55,
      ticketNumber: 'T20260318.0055',
      title: 'Some other ticket',
      status: 2,
      companyID: 200,
    };

    // Strategy 1 returns nothing, strategy 2 returns the ticket
    mockQueryTickets
      .mockResolvedValueOnce([])        // strategy 1
      .mockResolvedValueOnce([rawTicket]); // strategy 2

    const { result, message } = await findTicket(fakeService, {
      issue_number: 999,
      ticket_number: 'T20260318.0055',
    });

    expect(result.found).toBe(true);
    expect(result.count).toBe(1);
    expect(result.matches[0].ticket_number).toBe('T20260318.0055');
    expect(message).toContain('Found 1 ticket');

    expect(mockQueryTickets).toHaveBeenCalledTimes(2);
    // Second call must use eq on ticketNumber
    expect(mockQueryTickets).toHaveBeenNthCalledWith(
      2,
      fakeService,
      [{ op: 'eq', field: 'ticketNumber', value: 'T20260318.0055' }]
    );
  });

  // ── Strategy 3: keyword fallback ─────────────────────────────────────────

  test('falls back to keyword search when strategy 1 finds nothing', async () => {
    const rawTicket = {
      id: 77,
      ticketNumber: 'T20260318.0077',
      title: 'Fix prorata billing for YY licenses',
      status: 3,
      companyID: 300,
    };

    // Strategy 1 empty, no ticket_number so strategy 2 skipped,
    // strategy 3 returns hit.
    mockQueryTickets
      .mockResolvedValueOnce([])        // strategy 1
      .mockResolvedValueOnce([rawTicket]); // strategy 3

    const { result } = await findTicket(fakeService, {
      issue_number: 319,
      issue_title: 'Fix prorata billing for YY licenses in CSP',
    });

    expect(result.found).toBe(true);
    expect(result.count).toBe(1);
    expect(result.matches[0].id).toBe(77);

    expect(mockQueryTickets).toHaveBeenCalledTimes(2);
    // Second call uses first 3 words of the title
    expect(mockQueryTickets).toHaveBeenNthCalledWith(
      2,
      fakeService,
      [{ op: 'contains', field: 'title', value: 'Fix prorata billing' }]
    );
  });

  // ── Not found ─────────────────────────────────────────────────────────────

  test('returns found:false when all strategies return empty', async () => {
    mockQueryTickets.mockResolvedValue([]);

    const { result, message } = await findTicket(fakeService, {
      issue_number: 1,
      issue_title: 'Something obscure',
    });

    expect(result.found).toBe(false);
    expect(result.count).toBe(0);
    expect(result.matches).toHaveLength(0);
    expect(result.error).toBeUndefined();
    expect(message).toContain('No tickets found');
  });

  // ── Deduplication ─────────────────────────────────────────────────────────

  test('deduplicates tickets returned by multiple strategies', async () => {
    const ticket = {
      id: 11,
      ticketNumber: 'T20260318.0011',
      title: 'Ticket #88 and T20260318.0011',
      status: 1,
      companyID: 10,
    };

    // Strategy 1 and strategy 2 both return the same ticket
    mockQueryTickets
      .mockResolvedValueOnce([ticket])  // strategy 1
      .mockResolvedValueOnce([ticket]); // strategy 2

    const { result } = await findTicket(fakeService, {
      issue_number: 88,
      ticket_number: 'T20260318.0011',
    });

    expect(result.count).toBe(1);
    expect(result.matches).toHaveLength(1);
  });

  // ── company_id scoping ─────────────────────────────────────────────────────

  test('passes company_id filter when provided', async () => {
    mockQueryTickets.mockResolvedValue([]);

    await findTicket(fakeService, { issue_number: 42, company_id: 999 });

    expect(mockQueryTickets).toHaveBeenCalledWith(
      fakeService,
      [
        { op: 'contains', field: 'title', value: '#42' },
        { op: 'eq', field: 'companyID', value: 999 },
      ]
    );
  });

  // ── Error handling ─────────────────────────────────────────────────────────

  test('returns error field on API failure', async () => {
    mockQueryTickets.mockRejectedValueOnce(new Error('Network timeout'));

    const { result, message } = await findTicket(fakeService, { issue_number: 123 });

    expect(result.found).toBe(false);
    expect(result.count).toBe(0);
    expect(result.matches).toHaveLength(0);
    expect(result.error).toBe('Network timeout');
    expect(message).toContain('Search failed');
  });
});

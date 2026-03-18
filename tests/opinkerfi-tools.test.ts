// Tests for opinkerfi tools: get-repo-config, save-repo-config, get-ticket-status,
// list-project-phases, create-ticket, link-issue-to-ticket

import fs from 'fs';
import path from 'path';
import os from 'os';
import { getRepoConfig } from '../src/opinkerfi/tools/get-repo-config';
import { saveRepoConfig } from '../src/opinkerfi/tools/save-repo-config';
import { getTicketStatus } from '../src/opinkerfi/tools/get-ticket-status';
import { listProjectPhases } from '../src/opinkerfi/tools/list-project-phases';
import { createTicket } from '../src/opinkerfi/tools/create-ticket';
import { linkIssueToTicket } from '../src/opinkerfi/tools/link-issue-to-ticket';

// ─── Repo Config Tests ──────────────────────────────────────────────────────

describe('getRepoConfig / saveRepoConfig', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ok-config-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('returns not found when no CLAUDE.md exists', async () => {
    const { result } = await getRepoConfig(null, { repo_path: tmpDir });
    expect((result as any).found).toBe(false);
  });

  test('saves and reads company config round-trip', async () => {
    const saveResult = await saveRepoConfig(null, {
      repo_path: tmpDir,
      company_name: 'Test Co',
      company_id: 123,
      type: 'company',
      queue_name: 'Test Queue',
      queue_id: 999,
    });
    expect((saveResult.result as any).saved).toBe(true);

    const readResult = await getRepoConfig(null, { repo_path: tmpDir });
    const config = (readResult.result as any).config;
    expect(config.company_name).toBe('Test Co');
    expect(config.company_id).toBe(123);
    expect(config.type).toBe('company');
    expect(config.queue_id).toBe(999);
  });

  test('saves and reads project config round-trip', async () => {
    await saveRepoConfig(null, {
      repo_path: tmpDir,
      company_name: 'Project Corp',
      company_id: 456,
      type: 'project',
      project_name: 'MyProject',
      project_id: 789,
      queue_name: 'Dev Queue',
      queue_id: 111,
    });

    const { result } = await getRepoConfig(null, { repo_path: tmpDir });
    const config = (result as any).config;
    expect(config.type).toBe('project');
    expect(config.project_name).toBe('MyProject');
    expect(config.project_id).toBe(789);
  });

  test('save fails without required fields', async () => {
    const { result } = await saveRepoConfig(null, { repo_path: tmpDir });
    expect((result as any).saved).toBe(false);
  });
});

// ─── Get Ticket Status Tests ─────────────────────────────────────────────────

describe('getTicketStatus', () => {
  test('returns error when neither ticket_id nor ticket_number provided', async () => {
    const { result } = await getTicketStatus(null, {});
    expect((result as any).error).toBeTruthy();
  });

  test('returns ticket info when found by ID', async () => {
    const mockService = {
      getTicket: jest.fn().mockResolvedValue({
        id: 42,
        ticketNumber: 'T20260318.0042',
        title: '#100 - Fix bug',
        status: 1,
        priority: 3,
        queueID: 999,
        assignedResourceID: 5,
        companyID: 123,
        projectID: null,
      }),
    };

    const { result } = await getTicketStatus(mockService, { ticket_id: 42 });
    expect((result as any).found).toBe(true);
    expect((result as any).ticket_number).toBe('T20260318.0042');
    expect(mockService.getTicket).toHaveBeenCalledWith(42);
  });

  test('returns not found for missing ticket', async () => {
    const mockService = {
      getTicket: jest.fn().mockResolvedValue(null),
    };

    const { result } = await getTicketStatus(mockService, { ticket_id: 999 });
    expect((result as any).found).toBe(false);
  });
});

// ─── List Project Phases Tests ───────────────────────────────────────────────

describe('listProjectPhases', () => {
  test('returns phases from autotask client', async () => {
    const mockClient = {
      phases: {
        list: jest.fn().mockResolvedValue({
          data: [
            { id: 1, title: 'Phase 1', description: 'First', startDate: '2026-01-01' },
            { id: 2, title: 'Phase 2', description: 'Second', startDate: '2026-02-01' },
          ],
        }),
      },
    };
    const mockService = {
      ensureClient: jest.fn().mockResolvedValue(mockClient),
    };

    const { result } = await listProjectPhases(mockService, { project_id: 100 });
    expect((result as any).count).toBe(2);
    expect((result as any).phases[0].title).toBe('Phase 1');
  });

  test('returns empty array on error', async () => {
    const mockService = {
      ensureClient: jest.fn().mockRejectedValue(new Error('API down')),
    };

    const { result } = await listProjectPhases(mockService, { project_id: 100 });
    expect((result as any).count).toBe(0);
    expect((result as any).error).toContain('API down');
  });
});

// ─── Create Ticket Tests ─────────────────────────────────────────────────────

describe('createTicket', () => {
  test('creates company ticket successfully', async () => {
    const mockService = {
      createTicket: jest.fn().mockResolvedValue(42),
      getTicket: jest.fn().mockResolvedValue({ ticketNumber: 'T20260318.0042' }),
    };

    const { result } = await createTicket(mockService, {
      company_id: 123,
      issue_number: 100,
      issue_title: 'Fix the bug',
      mode: 'company',
    });

    expect((result as any).created).toBe(true);
    expect((result as any).ticket_number).toBe('T20260318.0042');
    expect(mockService.createTicket).toHaveBeenCalledWith(
      expect.objectContaining({
        companyID: 123,
        title: '#100 - Fix the bug',
      })
    );
  });

  test('rejects project mode without project_id', async () => {
    const { result } = await createTicket({}, {
      company_id: 123,
      issue_number: 100,
      issue_title: 'Test',
      mode: 'project',
    });

    expect((result as any).created).toBe(false);
    expect((result as any).error).toContain('project_id');
  });

  test('handles API errors gracefully', async () => {
    const mockService = {
      createTicket: jest.fn().mockRejectedValue(new Error('API error')),
    };

    const { result } = await createTicket(mockService, {
      company_id: 123,
      issue_number: 100,
      issue_title: 'Test',
      mode: 'company',
    });

    expect((result as any).created).toBe(false);
    expect((result as any).error).toContain('API error');
  });
});

// ─── Link Issue to Ticket Tests ──────────────────────────────────────────────

describe('linkIssueToTicket', () => {
  test('creates note on ticket with issue URL', async () => {
    const mockService = {
      searchTicketNotes: jest.fn().mockResolvedValue([]),
      createTicketNote: jest.fn().mockResolvedValue(1),
    };

    const { result } = await linkIssueToTicket(mockService, {
      ticket_id: 42,
      issue_number: 100,
      issue_url: 'https://github.com/opinkerfi/test/issues/100',
    });

    expect((result as any).linked).toBe(true);
    expect((result as any).skipped).toBe(false);
    expect(mockService.createTicketNote).toHaveBeenCalledWith(42, expect.objectContaining({
      noteText: expect.stringContaining('https://github.com/opinkerfi/test/issues/100'),
    }));
  });

  test('skips duplicate note', async () => {
    const mockService = {
      searchTicketNotes: jest.fn().mockResolvedValue([
        { noteText: 'Linked GitHub Issue: https://github.com/opinkerfi/test/issues/100' },
      ]),
      createTicketNote: jest.fn(),
    };

    const { result } = await linkIssueToTicket(mockService, {
      ticket_id: 42,
      issue_number: 100,
      issue_url: 'https://github.com/opinkerfi/test/issues/100',
    });

    expect((result as any).linked).toBe(true);
    expect((result as any).skipped).toBe(true);
    expect(mockService.createTicketNote).not.toHaveBeenCalled();
  });
});

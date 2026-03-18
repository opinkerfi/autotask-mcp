// opinkerfi tool module
// Exports all tool definitions and handler functions for opinkerfi workflow tools

import { McpTool } from '../handlers/tool.handler.js';

import { findTicketTool, findTicket } from './tools/find-ticket.js';
import { createTicketTool, createTicket } from './tools/create-ticket.js';
import { linkTicketToIssueTool, linkTicketToIssue } from './tools/link-ticket-to-issue.js';
import { linkIssueToTicketTool, linkIssueToTicket } from './tools/link-issue-to-ticket.js';
import { getRepoConfigTool, getRepoConfig } from './tools/get-repo-config.js';
import { saveRepoConfigTool, saveRepoConfig } from './tools/save-repo-config.js';
import { listProjectPhasesTool, listProjectPhases } from './tools/list-project-phases.js';
import { getTicketStatusTool, getTicketStatus } from './tools/get-ticket-status.js';

export const opinkerfiTools: McpTool[] = [
  findTicketTool,
  createTicketTool,
  linkTicketToIssueTool,
  linkIssueToTicketTool,
  getRepoConfigTool,
  saveRepoConfigTool,
  listProjectPhasesTool,
  getTicketStatusTool,
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const opinkerfiHandlers: Record<string, (_client: unknown, _params: any) => Promise<{ result: unknown; message: string }>> = {
  ok_find_ticket: findTicket,
  ok_create_ticket: createTicket,
  ok_link_ticket_to_issue: linkTicketToIssue,
  ok_link_issue_to_ticket: linkIssueToTicket,
  ok_get_repo_config: getRepoConfig,
  ok_save_repo_config: saveRepoConfig,
  ok_list_project_phases: listProjectPhases,
  ok_get_ticket_status: getTicketStatus,
};

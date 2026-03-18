// opinkerfi: save-repo-config tool
// Write opinkerfi configuration into the repo's CLAUDE.md

import path from 'path';
import { McpTool } from '../../types/mcp.js';
import { AutotaskConfig, updateClaudeMd } from '../utils/repo-config.js';

export const saveRepoConfigTool: McpTool = {
  name: 'ok_save_repo_config',
  description:
    'Write or update opinkerfi workflow configuration in the repository CLAUDE.md file (Autotask company ID, project ID, default assignee, etc.).',
  inputSchema: {
    type: 'object',
    properties: {
      repo_path: {
        type: 'string',
        description: 'Absolute path to the repository root (defaults to current working directory)',
      },
      company_name: {
        type: 'string',
        description: 'Autotask company name',
      },
      company_id: {
        type: 'number',
        description: 'Autotask company ID',
      },
      type: {
        type: 'string',
        enum: ['company', 'project'],
        description: 'Ticket type: direct company ticket or project task',
      },
      project_name: {
        type: 'string',
        description: 'Autotask project name (required when type is project)',
      },
      project_id: {
        type: 'number',
        description: 'Autotask project ID (required when type is project)',
      },
      queue_name: {
        type: 'string',
        description: 'Queue name (defaults to ok-lausnir ser)',
      },
      queue_id: {
        type: 'number',
        description: 'Queue ID (defaults to 29682833)',
      },
    },
    required: ['company_name', 'company_id', 'type'],
  },
};

export async function saveRepoConfig(
  _client: unknown,
  params: {
    repo_path?: string;
    company_name?: string;
    company_id?: number;
    type?: 'company' | 'project';
    project_name?: string;
    project_id?: number;
    queue_name?: string;
    queue_id?: number;
  }
): Promise<{ result: unknown; message: string }> {
  const repoPath = params.repo_path ?? process.cwd();
  const filePath = path.join(repoPath, 'CLAUDE.md');

  if (!params.company_id || !params.company_name || !params.type) {
    return {
      result: { saved: false, error: 'company_id, company_name, and type are required' },
      message: 'Missing required fields: company_id, company_name, type',
    };
  }

  try {
    const config: AutotaskConfig = {
      company_name: params.company_name,
      company_id: params.company_id,
      type: params.type,
      ...(params.project_name ? { project_name: params.project_name } : {}),
      ...(params.project_id ? { project_id: params.project_id } : {}),
      queue_name: params.queue_name ?? 'ok-lausnir ser',
      queue_id: params.queue_id ?? 29682833,
    };

    updateClaudeMd(filePath, config);
    return {
      result: { saved: true, path: filePath },
      message: `Saved Autotask config to ${filePath}`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      result: { saved: false, error },
      message: `Failed to save config: ${error}`,
    };
  }
}

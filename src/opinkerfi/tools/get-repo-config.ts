// opinkerfi: get-repo-config tool
// Read opinkerfi configuration from the repo's CLAUDE.md

import path from 'path';
import { McpTool } from '../../types/mcp.js';
import { parseClaudeMd } from '../utils/repo-config.js';

export const getRepoConfigTool: McpTool = {
  name: 'ok_get_repo_config',
  description:
    'Read opinkerfi workflow configuration (Autotask company ID, project ID, default assignee, etc.) from the repository CLAUDE.md file.',
  inputSchema: {
    type: 'object',
    properties: {
      repo_path: {
        type: 'string',
        description: 'Absolute path to the repository root (defaults to current working directory)',
      },
    },
    required: [],
  },
};

export async function getRepoConfig(
  _client: unknown,
  params: {
    repo_path?: string;
  }
): Promise<{ result: unknown; message: string }> {
  const repoPath = params.repo_path ?? process.cwd();
  const filePath = path.join(repoPath, 'CLAUDE.md');

  try {
    const config = parseClaudeMd(filePath);
    if (!config) {
      return {
        result: { found: false },
        message: `No valid Autotask configuration found in ${filePath}`,
      };
    }
    return {
      result: { found: true, config },
      message: `Autotask config: ${config.company_name} (${config.type})${config.project_name ? ` / ${config.project_name}` : ''}`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      result: { found: false, error },
      message: `Failed to read config: ${error}`,
    };
  }
}

// opinkerfi: save-repo-config tool
// Write opinkerfi configuration into the repo's CLAUDE.md

import { McpTool } from '../../types/mcp.js';

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
      company_id: {
        type: 'number',
        description: 'Autotask company ID for this repository',
      },
      project_id: {
        type: 'number',
        description: 'Autotask project ID for this repository',
      },
      default_assignee_resource_id: {
        type: 'number',
        description: 'Default Autotask resource ID for ticket assignment',
      },
      default_priority: {
        type: 'number',
        description: 'Default ticket priority ID',
      },
      default_status: {
        type: 'number',
        description: 'Default ticket status ID',
      },
    },
    required: [],
  },
};

export async function saveRepoConfig(
  _client: unknown,
  _params: {
    repo_path?: string;
    company_id?: number;
    project_id?: number;
    default_assignee_resource_id?: number;
    default_priority?: number;
    default_status?: number;
  }
): Promise<{ result: unknown; message: string }> {
  // TODO: Write opinkerfi config block to CLAUDE.md
  return {
    result: null,
    message: 'Not yet implemented',
  };
}

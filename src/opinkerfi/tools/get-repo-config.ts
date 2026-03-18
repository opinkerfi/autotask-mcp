// opinkerfi: get-repo-config tool
// Read opinkerfi configuration from the repo's CLAUDE.md

import { McpTool } from '../../handlers/tool.handler.js';

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
  _params: {
    repo_path?: string;
  }
): Promise<{ result: unknown; message: string }> {
  // TODO: Read and parse CLAUDE.md opinkerfi config block
  return {
    result: null,
    message: 'Not yet implemented',
  };
}

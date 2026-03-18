// opinkerfi: list-project-phases tool
// List phases for an Autotask project

import { McpTool } from '../../types/mcp.js';

export const listProjectPhasesTool: McpTool = {
  name: 'ok_list_project_phases',
  description:
    'List all phases for a given Autotask project, useful for selecting the correct phase when creating tickets.',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'number',
        description: 'Autotask project ID',
      },
    },
    required: ['project_id'],
  },
};

export async function listProjectPhases(
  _client: unknown,
  _params: {
    project_id: number;
  }
): Promise<{ result: unknown; message: string }> {
  // TODO: Implement project phase listing via Autotask API
  return {
    result: [],
    message: 'Not yet implemented',
  };
}

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
  client: unknown,
  params: {
    project_id: number;
  }
): Promise<{ result: unknown; message: string }> {
  const svc = client as any;

  try {
    // Access the underlying autotask-node client for phase queries
    const atClient = await svc['ensureClient']();
    const result = await atClient.phases.list({
      filter: { projectID: params.project_id },
    });

    const phases = (result.data ?? []).map((p: any) => ({
      id: p.id,
      title: p.title ?? p.name,
      description: p.description,
      start_date: p.startDate,
      due_date: p.dueDate,
      is_completed: p.isCompleted,
    }));

    return {
      result: { phases, count: phases.length },
      message: `Found ${phases.length} phase(s) for project ${params.project_id}`,
    };
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      result: { phases: [], count: 0, error },
      message: `Failed to list phases: ${error}`,
    };
  }
}

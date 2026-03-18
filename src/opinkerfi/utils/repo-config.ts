// opinkerfi: repo-config utility
// Reads/writes the ## Autotask Configuration section from a repo's CLAUDE.md

import fs from 'fs';

export interface AutotaskConfig {
  company_name: string;
  company_id: number;
  type: 'company' | 'project';
  project_name?: string;
  project_id?: number;
  queue_name: string;
  queue_id: number;
}

/**
 * Parse the Autotask Configuration section from a CLAUDE.md file.
 * Returns null if the file doesn't exist or the section is missing/incomplete.
 */
export function parseClaudeMd(filePath: string): AutotaskConfig | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const sectionMatch = content.match(
    /## Autotask Configuration\r?\n([\s\S]*?)(?=\r?\n##|\r?\n$|$)/
  );
  if (!sectionMatch) return null;

  const lines = sectionMatch[1].split('\n').filter((l) => l.trim().startsWith('-'));
  const config: Partial<AutotaskConfig> = {};

  for (const line of lines) {
    const t = line.trim();
    let m: RegExpMatchArray | null;

    if ((m = t.match(/^-\s*Company:\s*(.+?)\s*\(ID:\s*(\d+)\)/))) {
      config.company_name = m[1].trim();
      config.company_id = parseInt(m[2], 10);
    } else if ((m = t.match(/^-\s*Type:\s*(company|project)/i))) {
      config.type = m[1].toLowerCase() as 'company' | 'project';
    } else if ((m = t.match(/^-\s*Project:\s*(.+?)\s*\(ID:\s*(\d+)\)/))) {
      config.project_name = m[1].trim();
      config.project_id = parseInt(m[2], 10);
    } else if ((m = t.match(/^-\s*Default Queue:\s*(.+?)\s*\(ID:\s*(\d+)\)/))) {
      config.queue_name = m[1].trim();
      config.queue_id = parseInt(m[2], 10);
    }
  }

  if (!config.company_id || !config.company_name || !config.type || !config.queue_id) {
    return null;
  }
  if (config.type === 'project' && (!config.project_id || !config.project_name)) {
    return null;
  }

  return config as AutotaskConfig;
}

/**
 * Write or update the Autotask Configuration section in CLAUDE.md.
 * Creates the file if it doesn't exist. Replaces the section if it does.
 */
export function updateClaudeMd(filePath: string, config: AutotaskConfig): void {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

  // Remove existing section if present
  content = content.replace(/\n## Autotask Configuration\r?\n[\s\S]*?(?=\n##|$)/, '');

  const projectLine =
    config.project_name && config.project_id
      ? `\n- Project: ${config.project_name} (ID: ${config.project_id})`
      : '';

  const section = `\n## Autotask Configuration\n- Company: ${config.company_name} (ID: ${config.company_id})\n- Type: ${config.type}${projectLine}\n- Default Queue: ${config.queue_name} (ID: ${config.queue_id})\n`;

  fs.writeFileSync(filePath, content.trimEnd() + '\n' + section);
}

# Opinkerfi Autotask MCP Setup

## Prerequisites

- Node.js 18+
- Autotask API credentials (API-only resource)
- GitHub CLI (`gh`) installed and authenticated (for cross-linking tools)

## 1. Get Autotask API Credentials

1. In Autotask Admin, create an **API-only security level** resource
2. Generate an API key and secret from the resource profile
3. Get your **Integration Code** from Admin > Extensions & Integrations > API

You need three values:
- `AUTOTASK_USERNAME` — your API user email
- `AUTOTASK_SECRET` — your API secret key
- `AUTOTASK_INTEGRATION_CODE` — your integration code

## 2. Add the MCP Server

### Claude Code (CLI)

```bash
claude mcp add autotask-mcp \
  -e AUTOTASK_USERNAME=your-api-user@example.com \
  -e AUTOTASK_SECRET=your-secret-key \
  -e AUTOTASK_INTEGRATION_CODE=your-code \
  -- npx -y github:opinkerfi/autotask-mcp
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "autotask-mcp": {
      "command": "npx",
      "args": ["-y", "github:opinkerfi/autotask-mcp"],
      "env": {
        "AUTOTASK_USERNAME": "your-api-user@example.com",
        "AUTOTASK_SECRET": "your-secret-key",
        "AUTOTASK_INTEGRATION_CODE": "your-code"
      }
    }
  }
}
```

## 3. Verify Installation

Ask your AI assistant to call the `autotask_test_connection` tool. It should respond with a success message.

## 4. Per-Repository Configuration

The opinkerfi tools use a `## Autotask Configuration` section in your repo's `CLAUDE.md` to store project mappings. This is created automatically when you first use the `ok_save_repo_config` tool, or when the start-work skill sets up a new repo.

Example section in CLAUDE.md:

```markdown
## Autotask Configuration
- Company: Example Corp (ID: 12345)
- Type: project
- Project: Example Project (ID: 67890)
- Default Queue: ok-lausnir ser (ID: 29682833)
```

## Opinkerfi Tools Reference

| Tool | Purpose |
|------|---------|
| `ok_find_ticket` | Search tickets by issue number, title keywords, or ticket number |
| `ok_create_ticket` | Create tickets in company, project, or internal-dev mode |
| `ok_link_issue_to_ticket` | Add GitHub issue URL as note on Autotask ticket |
| `ok_link_ticket_to_issue` | Add Autotask ticket URL to GitHub issue body |
| `ok_get_repo_config` | Read Autotask config from CLAUDE.md |
| `ok_save_repo_config` | Write Autotask config to CLAUDE.md |
| `ok_list_project_phases` | List project phases for ticket assignment |
| `ok_get_ticket_status` | Quick ticket status lookup |

## Troubleshooting

**"Zone not found" or connection errors:**
Ensure your `AUTOTASK_USERNAME` is the full email of an API-only resource with the correct permissions.

**"Unauthorized" errors:**
Verify `AUTOTASK_SECRET` and `AUTOTASK_INTEGRATION_CODE` are correct. The integration code must be enabled in Autotask Admin.

**Cross-linking tools fail:**
The `ok_link_ticket_to_issue` tool requires `gh` CLI to be installed and authenticated (`gh auth login`).

# Claude Code Configuration

## BMad Method Slash Commands

This project uses the BMad Method framework with specialized AI agents. When the user types a BMad slash command, you should activate the corresponding agent persona by reading and following the instructions from the specified agent file.

### Available Slash Commands

#### Core Agent
- `/bmad` - Activate BMad Master agent from `.bmad-core/agents/bmad-master.md`

#### Specialized Agents
- `/bmad-dev` - Activate Developer agent from `.bmad-core/agents/dev.md`
- `/bmad-po` - Activate Product Owner agent from `.bmad-core/agents/po.md`
- `/bmad-pm` - Activate Project Manager agent from `.bmad-core/agents/pm.md`
- `/bmad-qa` - Activate QA Engineer agent from `.bmad-core/agents/qa.md`
- `/bmad-architect` - Activate System Architect agent from `.bmad-core/agents/architect.md`
- `/bmad-ux` - Activate UX Expert agent from `.bmad-core/agents/ux-expert.md`
- `/bmad-analyst` - Activate Business Analyst agent from `.bmad-core/agents/analyst.md`
- `/bmad-sm` - Activate Scrum Master agent from `.bmad-core/agents/sm.md`
- `/bmad-orchestrator` - Activate Orchestrator agent from `.bmad-core/agents/bmad-orchestrator.md`

### Workflow Commands
- `/bmad-story` - Create a new user story using `.bmad-core/tasks/create-next-story.md`
- `/bmad-epic` - Create a new epic using `.bmad-core/tasks/brownfield-create-epic.md`
- `/bmad-prd` - Generate PRD using `.bmad-core/templates/prd-tmpl.yaml`
- `/bmad-architecture` - Generate architecture docs using `.bmad-core/templates/architecture-tmpl.yaml`
- `/bmad-qa-gate` - Run QA validation using `.bmad-core/tasks/qa-gate.md`
- `/bmad-brainstorm` - Facilitate brainstorming using `.bmad-core/tasks/facilitate-brainstorming-session.md`

### How to Handle BMad Commands

When a user types a BMad slash command:

1. **Recognize the command** - Even if Claude says "Unknown slash command", still process it if it matches a BMad command
2. **Load the agent/task** - Read the corresponding file from `.bmad-core/`
3. **Activate the persona** - Follow the instructions and adopt the agent's role
4. **Respond appropriately** - Acknowledge activation and offer agent-specific help

### Example Response Pattern

When user types `/bmad-dev`:
```
I'm now acting as the BMad Developer agent. I'll help you with coding, implementation, and technical tasks.

Available commands:
- *help - Show all available commands
- *list-tasks - Show development tasks
- *implement - Start implementation
- *test - Create unit tests
- *refactor - Refactor code

What development task would you like to work on?
```

### Agent Command Syntax

Once an agent is activated, users can use asterisk (*) prefixed commands:
- `*help` - Show agent-specific commands
- `*list-tasks` - Show available tasks for this agent
- `*list-templates` - Show available templates
- `*exit` - Exit agent mode

## Project Conventions

### Testing Commands
- Run tests: `npm test`
- Lint code: `npm run lint`
- Type check: `npm run typecheck`

### Development Server
- Start dev server: `npm run dev`
- Build project: `npm run build`

## Important Notes

- Always check `.bmad-core/` directory for agent files and tasks
- Each agent has specific expertise - load and follow their instructions
- Agents can be chained for complex workflows
- When in doubt, use `/bmad` for the master agent
/**
 * BMad Slash Commands Configuration
 * Use this to register BMad agents as slash commands in your IDE or application
 */

const BMAD_AGENTS = {
  // Core agent
  'bmad': {
    agent: 'bmad-master',
    description: 'Universal Task Executor - handles all BMad capabilities',
    file: '.bmad-core/agents/bmad-master.md',
    aliases: ['BMad', 'bmad-master']
  },
  
  // Role-specific agents
  'bmad-po': {
    agent: 'po',
    description: 'Product Owner - user stories, epics, requirements',
    file: '.bmad-core/agents/po.md',
    aliases: ['bmad-product-owner']
  },
  
  'bmad-pm': {
    agent: 'pm',
    description: 'Project Manager - planning, tracking, coordination',
    file: '.bmad-core/agents/pm.md',
    aliases: ['bmad-project-manager']
  },
  
  'bmad-dev': {
    agent: 'dev',
    description: 'Developer - coding, implementation, technical tasks',
    file: '.bmad-core/agents/dev.md',
    aliases: ['bmad-developer']
  },
  
  'bmad-qa': {
    agent: 'qa',
    description: 'QA Engineer - testing, quality gates, validation',
    file: '.bmad-core/agents/qa.md',
    aliases: ['bmad-quality', 'bmad-test']
  },
  
  'bmad-architect': {
    agent: 'architect',
    description: 'System Architect - design, architecture, technical decisions',
    file: '.bmad-core/agents/architect.md',
    aliases: ['bmad-arch']
  },
  
  'bmad-analyst': {
    agent: 'analyst',
    description: 'Business Analyst - requirements analysis, documentation',
    file: '.bmad-core/agents/analyst.md',
    aliases: ['bmad-ba']
  },
  
  'bmad-sm': {
    agent: 'sm',
    description: 'Scrum Master - agile processes, sprint management',
    file: '.bmad-core/agents/sm.md',
    aliases: ['bmad-scrum-master', 'bmad-agile']
  },
  
  'bmad-ux': {
    agent: 'ux-expert',
    description: 'UX Expert - user experience, design, usability',
    file: '.bmad-core/agents/ux-expert.md',
    aliases: ['bmad-ux-expert', 'bmad-design']
  },
  
  'bmad-orchestrator': {
    agent: 'bmad-orchestrator',
    description: 'Multi-agent coordinator - complex workflows',
    file: '.bmad-core/agents/bmad-orchestrator.md',
    aliases: ['bmad-coordinator']
  }
};

const BMAD_WORKFLOWS = {
  'bmad-story': {
    task: 'create-next-story',
    description: 'Create a new user story',
    file: '.bmad-core/tasks/create-next-story.md'
  },
  
  'bmad-epic': {
    task: 'brownfield-create-epic',
    description: 'Create a new epic',
    file: '.bmad-core/tasks/brownfield-create-epic.md'
  },
  
  'bmad-prd': {
    template: 'prd-tmpl',
    description: 'Generate Product Requirements Document',
    file: '.bmad-core/templates/prd-tmpl.yaml'
  },
  
  'bmad-architecture': {
    template: 'architecture-tmpl',
    description: 'Generate Architecture Documentation',
    file: '.bmad-core/templates/architecture-tmpl.yaml'
  },
  
  'bmad-qa-gate': {
    task: 'qa-gate',
    description: 'Run QA validation gate',
    file: '.bmad-core/tasks/qa-gate.md'
  },
  
  'bmad-brainstorm': {
    task: 'facilitate-brainstorming-session',
    description: 'Facilitate brainstorming session',
    file: '.bmad-core/tasks/facilitate-brainstorming-session.md'
  }
};

const BMAD_TEAMS = {
  'bmad-team-fullstack': {
    config: '.bmad-core/agent-teams/team-fullstack.yaml',
    description: 'Full development team workflow'
  },
  
  'bmad-team-no-ui': {
    config: '.bmad-core/agent-teams/team-no-ui.yaml',
    description: 'Backend-only team workflow'
  },
  
  'bmad-team-ide': {
    config: '.bmad-core/agent-teams/team-ide-minimal.yaml',
    description: 'IDE-focused minimal team workflow'
  }
};

/**
 * Register slash command handler
 * @param {string} command - The slash command (e.g., '/bmad-dev')
 * @returns {Object} Command configuration or null if not found
 */
function handleSlashCommand(command) {
  // Remove leading slash and convert to lowercase
  const cmd = command.replace(/^\//, '').toLowerCase();
  
  // Check agents
  if (BMAD_AGENTS[cmd]) {
    return {
      type: 'agent',
      ...BMAD_AGENTS[cmd]
    };
  }
  
  // Check aliases
  for (const [key, config] of Object.entries(BMAD_AGENTS)) {
    if (config.aliases?.includes(cmd)) {
      return {
        type: 'agent',
        command: key,
        ...config
      };
    }
  }
  
  // Check workflows
  if (BMAD_WORKFLOWS[cmd]) {
    return {
      type: 'workflow',
      ...BMAD_WORKFLOWS[cmd]
    };
  }
  
  // Check teams
  if (BMAD_TEAMS[cmd]) {
    return {
      type: 'team',
      ...BMAD_TEAMS[cmd]
    };
  }
  
  // Handle dynamic task/template/checklist commands
  if (cmd.startsWith('bmad-task-')) {
    const taskName = cmd.replace('bmad-task-', '');
    return {
      type: 'task',
      name: taskName,
      file: `.bmad-core/tasks/${taskName}.md`
    };
  }
  
  if (cmd.startsWith('bmad-template-')) {
    const templateName = cmd.replace('bmad-template-', '');
    return {
      type: 'template',
      name: templateName,
      file: `.bmad-core/templates/${templateName}.yaml`
    };
  }
  
  if (cmd.startsWith('bmad-checklist-')) {
    const checklistName = cmd.replace('bmad-checklist-', '');
    return {
      type: 'checklist',
      name: checklistName,
      file: `.bmad-core/checklists/${checklistName}.md`
    };
  }
  
  return null;
}

/**
 * Get all available commands
 * @returns {Array} List of all command configurations
 */
function getAllCommands() {
  const commands = [];
  
  // Add agents
  Object.entries(BMAD_AGENTS).forEach(([cmd, config]) => {
    commands.push({
      command: `/${cmd}`,
      type: 'agent',
      ...config
    });
  });
  
  // Add workflows
  Object.entries(BMAD_WORKFLOWS).forEach(([cmd, config]) => {
    commands.push({
      command: `/${cmd}`,
      type: 'workflow',
      ...config
    });
  });
  
  // Add teams
  Object.entries(BMAD_TEAMS).forEach(([cmd, config]) => {
    commands.push({
      command: `/${cmd}`,
      type: 'team',
      ...config
    });
  });
  
  return commands;
}

/**
 * Example usage in an application
 */
function exampleUsage() {
  // Handle a slash command
  const result = handleSlashCommand('/bmad-dev');
  if (result) {
    console.log(`Activating: ${result.description}`);
    console.log(`Load file: ${result.file}`);
    
    if (result.type === 'agent') {
      // Load and activate agent persona
      // readFile(result.file)
    } else if (result.type === 'workflow') {
      // Execute workflow task
      // executeTask(result.task || result.template)
    }
  }
  
  // List all commands
  const allCommands = getAllCommands();
  console.log('Available BMad Commands:');
  allCommands.forEach(cmd => {
    console.log(`  ${cmd.command} - ${cmd.description}`);
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BMAD_AGENTS,
    BMAD_WORKFLOWS,
    BMAD_TEAMS,
    handleSlashCommand,
    getAllCommands
  };
}
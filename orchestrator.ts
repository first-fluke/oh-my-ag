#!/usr/bin/env ts-node

/**
 * Multi-Agent Orchestrator for Google Antigravity
 *
 * This script orchestrates multiple specialized agents (PM, Frontend, Backend, Mobile, QA)
 * to collaboratively build software projects.
 *
 * Usage:
 *   npm run orchestrate "Build a TODO app with user authentication"
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface Task {
  id: string;
  agent: string;
  title: string;
  description: string;
  priority: number;
  dependencies: string[];
  estimated_complexity: string;
  acceptance_criteria: string[];
  artifacts_expected: string[];
}

interface Plan {
  project_name: string;
  description: string;
  tech_stack: Record<string, string>;
  architecture_decisions: Array<{
    decision: string;
    rationale: string;
    alternatives_considered: string[];
  }>;
  tasks: Task[];
  api_contracts?: any[];
  data_models?: any[];
  non_functional_requirements?: any;
  testing_strategy?: any;
}

interface AgentResult {
  agent: string;
  taskId: string;
  output: string;
  status: 'success' | 'error';
  error?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
  skillsPath: '.agent/skills',
  outputPath: '.gemini/antigravity/brain',
  planFile: '.agent/plan.json',
  agentModel: 'gemini-3-pro', // or 'gemini-3-flash' for faster/cheaper
  outputFormat: 'markdown',
  maxRetries: 3,
  retryDelay: 2000, // ms
};

// ============================================================================
// Utility Functions
// ============================================================================

function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m', // Yellow
  };
  const reset = '\x1b[0m';
  const prefix = {
    info: 'ℹ',
    success: '✅',
    error: '❌',
    warning: '⚠️',
  };

  console.log(`${colors[type]}${prefix[type]} ${message}${reset}`);
}

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function extractJSON(text: string): string {
  // Try to extract JSON from markdown code block
  const jsonMatch = text.match(/```json\n([\s\S]+?)\n```/);
  if (jsonMatch) {
    return jsonMatch[1];
  }

  // Try to find JSON object in text
  const objMatch = text.match(/\{[\s\S]*\}/);
  if (objMatch) {
    return objMatch[0];
  }

  return text;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Agent Runner
// ============================================================================

async function runAgent(
  skillName: string,
  instruction: string,
  retries = 0
): Promise<string> {
  return new Promise((resolve, reject) => {
    log(`Spawning ${skillName} agent...`, 'info');

    const skillPath = path.join(CONFIG.skillsPath, skillName);

    // Check if skill exists
    if (!fs.existsSync(path.join(skillPath, 'SKILL.md'))) {
      reject(new Error(`Skill not found: ${skillPath}/SKILL.md`));
      return;
    }

    const proc = spawn('antigravity', [
      'agent',
      'run',
      '--skill', skillPath,
      '--instruction', instruction,
      '--model', CONFIG.agentModel,
      '--output-format', CONFIG.outputFormat,
    ], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      // Stream output for visibility
      process.stdout.write(chunk);
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    proc.on('error', (error) => {
      reject(new Error(`Failed to spawn agent: ${error.message}`));
    });

    proc.on('close', async (code) => {
      if (code === 0) {
        log(`${skillName} agent completed successfully`, 'success');
        resolve(output);
      } else {
        const errorMsg = `Agent failed with code ${code}: ${errorOutput}`;
        log(errorMsg, 'error');

        // Retry logic
        if (retries < CONFIG.maxRetries) {
          log(`Retrying (${retries + 1}/${CONFIG.maxRetries})...`, 'warning');
          await sleep(CONFIG.retryDelay * Math.pow(2, retries));
          try {
            const result = await runAgent(skillName, instruction, retries + 1);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error(errorMsg));
        }
      }
    });
  });
}

// ============================================================================
// Task Grouping
// ============================================================================

function groupByPriority(tasks: Task[]): Map<number, Task[]> {
  const groups = new Map<number, Task[]>();

  for (const task of tasks) {
    if (!groups.has(task.priority)) {
      groups.set(task.priority, []);
    }
    groups.get(task.priority)!.push(task);
  }

  // Sort by priority (ascending)
  return new Map([...groups.entries()].sort((a, b) => a[0] - b[0]));
}

function hasUnmetDependencies(task: Task, completedTaskIds: Set<string>): boolean {
  return task.dependencies.some(depId => !completedTaskIds.has(depId));
}

// ============================================================================
// Knowledge Base Management
// ============================================================================

function saveToKnowledgeBase(filename: string, content: string) {
  ensureDirectoryExists(CONFIG.outputPath);
  const filePath = path.join(CONFIG.outputPath, filename);
  fs.writeFileSync(filePath, content, 'utf-8');
  log(`Saved to Knowledge Base: ${filename}`, 'success');
}

function saveAgentResult(agent: string, taskId: string, output: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${agent}-${taskId}.md`;
  saveToKnowledgeBase(filename, output);
}

function savePlan(plan: Plan) {
  ensureDirectoryExists(path.dirname(CONFIG.planFile));
  fs.writeFileSync(CONFIG.planFile, JSON.stringify(plan, null, 2), 'utf-8');
  log(`Plan saved to ${CONFIG.planFile}`, 'success');

  // Also save to knowledge base
  const planMarkdown = generatePlanMarkdown(plan);
  saveToKnowledgeBase('current-plan.md', planMarkdown);
}

function generatePlanMarkdown(plan: Plan): string {
  return `# Project Plan: ${plan.project_name}

${plan.description}

## Tech Stack

${Object.entries(plan.tech_stack).map(([key, value]) => `- **${key}**: ${value}`).join('\n')}

## Architecture Decisions

${plan.architecture_decisions.map((dec, i) => `
### ${i + 1}. ${dec.decision}

**Rationale**: ${dec.rationale}

**Alternatives Considered**: ${dec.alternatives_considered.join(', ')}
`).join('\n')}

## Tasks

${plan.tasks.map(task => `
### ${task.id}: ${task.title} (Priority ${task.priority})

**Agent**: ${task.agent}
**Complexity**: ${task.estimated_complexity}
**Dependencies**: ${task.dependencies.join(', ') || 'None'}

**Description**: ${task.description}

**Acceptance Criteria**:
${task.acceptance_criteria.map(c => `- ${c}`).join('\n')}

**Expected Artifacts**:
${task.artifacts_expected.map(a => `- ${a}`).join('\n')}
`).join('\n')}
`;
}

// ============================================================================
// Main Orchestration Logic
// ============================================================================

async function main() {
  const userRequest = process.argv[2];

  if (!userRequest) {
    log('Usage: npm run orchestrate "<your request>"', 'error');
    log('Example: npm run orchestrate "Build a TODO app with authentication"', 'info');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(80));
  log(`🚀 Multi-Agent Orchestrator Started`, 'info');
  log(`Request: ${userRequest}`, 'info');
  console.log('='.repeat(80) + '\n');

  try {
    // ========================================================================
    // Step 1: PM Agent - Task Decomposition
    // ========================================================================
    console.log('\n📋 STEP 1: Task Decomposition\n');
    log('Consulting PM Agent to break down the request...', 'info');

    const pmResult = await runAgent(
      'pm-agent',
      `Break down this request into actionable tasks with priorities and dependencies:\n\n${userRequest}`
    );

    // Parse the plan
    const planJSON = extractJSON(pmResult);
    let plan: Plan;

    try {
      plan = JSON.parse(planJSON);
    } catch (error) {
      log('Failed to parse PM Agent output as JSON', 'error');
      log('Raw output:', 'error');
      console.log(pmResult);
      throw error;
    }

    savePlan(plan);

    log(`Generated ${plan.tasks.length} tasks across ${new Set(plan.tasks.map(t => t.agent)).size} agents`, 'success');

    // ========================================================================
    // Step 2: Execute Tasks by Priority
    // ========================================================================
    console.log('\n🔄 STEP 2: Task Execution\n');

    const taskGroups = groupByPriority(plan.tasks);
    const completedTaskIds = new Set<string>();
    const agentResults: AgentResult[] = [];

    for (const [priority, tasks] of taskGroups.entries()) {
      console.log(`\n--- Priority ${priority} (${tasks.length} tasks) ---\n`);

      // Filter tasks with unmet dependencies
      const readyTasks = tasks.filter(task => !hasUnmetDependencies(task, completedTaskIds));
      const blockedTasks = tasks.filter(task => hasUnmetDependencies(task, completedTaskIds));

      if (blockedTasks.length > 0) {
        log(`${blockedTasks.length} tasks blocked by dependencies, will retry after`, 'warning');
      }

      // Run ready tasks in parallel
      const promises = readyTasks.map(async (task) => {
        try {
          log(`Starting ${task.agent}-agent: ${task.title}`, 'info');

          const result = await runAgent(
            `${task.agent}-agent`,
            `${task.description}\n\nAcceptance Criteria:\n${task.acceptance_criteria.map(c => `- ${c}`).join('\n')}`
          );

          saveAgentResult(task.agent, task.id, result);

          completedTaskIds.add(task.id);
          log(`✅ Completed: ${task.title}`, 'success');

          return {
            agent: task.agent,
            taskId: task.id,
            output: result,
            status: 'success' as const,
          };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          log(`Failed: ${task.title} - ${errorMsg}`, 'error');

          return {
            agent: task.agent,
            taskId: task.id,
            output: '',
            status: 'error' as const,
            error: errorMsg,
          };
        }
      });

      const results = await Promise.all(promises);
      agentResults.push(...results);

      // Check if any tasks failed
      const failed = results.filter(r => r.status === 'error');
      if (failed.length > 0) {
        log(`${failed.length} tasks failed in priority ${priority}`, 'error');
        log('Continuing with remaining tasks...', 'warning');
      }

      // Retry blocked tasks if their dependencies are now met
      if (blockedTasks.length > 0) {
        const nowReady = blockedTasks.filter(task => !hasUnmetDependencies(task, completedTaskIds));
        if (nowReady.length > 0) {
          log(`${nowReady.length} previously blocked tasks are now ready`, 'info');
          // Add them back to the queue (simplified - could be improved)
        }
      }
    }

    // ========================================================================
    // Step 3: QA Review
    // ========================================================================
    console.log('\n🔍 STEP 3: Quality Assurance Review\n');
    log('Running QA Agent for final review...', 'info');

    const qaResult = await runAgent(
      'qa-agent',
      `Review all deliverables from the following agents:\n\n${agentResults
        .filter(r => r.status === 'success')
        .map(r => `- ${r.agent}: ${r.taskId}`)
        .join('\n')}\n\nCheck for:\n- Security vulnerabilities\n- Performance issues\n- Accessibility compliance\n- Code quality\n- Test coverage\n\nProvide a detailed report with prioritized issues.`
    );

    saveToKnowledgeBase('qa-report.md', qaResult);

    // ========================================================================
    // Step 4: Summary
    // ========================================================================
    console.log('\n' + '='.repeat(80));
    log('✨ Orchestration Complete!', 'success');
    console.log('='.repeat(80) + '\n');

    // Generate summary
    const summary = {
      projectName: plan.project_name,
      totalTasks: plan.tasks.length,
      completedTasks: completedTaskIds.size,
      failedTasks: agentResults.filter(r => r.status === 'error').length,
      agentsUsed: [...new Set(agentResults.map(r => r.agent))],
      outputLocation: CONFIG.outputPath,
    };

    console.log('Summary:');
    console.log(`  Project: ${summary.projectName}`);
    console.log(`  Tasks: ${summary.completedTasks}/${summary.totalTasks} completed`);
    console.log(`  Failed: ${summary.failedTasks}`);
    console.log(`  Agents: ${summary.agentsUsed.join(', ')}`);
    console.log(`  Output: ${summary.outputLocation}/\n`);

    // Save summary
    saveToKnowledgeBase('orchestration-summary.json', JSON.stringify(summary, null, 2));

    if (summary.failedTasks > 0) {
      log(`${summary.failedTasks} tasks failed. Review logs above.`, 'warning');
      process.exit(1);
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`Orchestration failed: ${errorMsg}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// ============================================================================
// Entry Point
// ============================================================================

main().catch((error) => {
  log('Unhandled error:', 'error');
  console.error(error);
  process.exit(1);
});

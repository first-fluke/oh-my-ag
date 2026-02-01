export interface ManifestFile {
  path: string;
  sha256: string;
  size: number;
}

export interface Manifest {
  name: string;
  version: string;
  releaseDate: string;
  repository: string;
  files: ManifestFile[];
}

export interface CLICheck {
  name: string;
  installed: boolean;
  version?: string;
  installCmd: string;
}

export interface SkillCheck {
  name: string;
  installed: boolean;
  hasSkillMd: boolean;
}

export interface Metrics {
  sessions: number;
  skillsUsed: Record<string, number>;
  tasksCompleted: number;
  totalSessionTime: number;
  filesChanged: number;
  linesAdded: number;
  linesRemoved: number;
  lastUpdated: string;
  startDate: string;
}

export interface Retrospective {
  id: string;
  date: string;
  summary: string;
  keyLearnings: string[];
  filesChanged: string[];
  nextSteps: string[];
}

export interface CleanupResult {
  cleaned: number;
  skipped: number;
  details: string[];
}

export interface SkillInfo {
  name: string;
  desc: string;
}

export interface SkillsRegistry {
  domain: SkillInfo[];
  coordination: SkillInfo[];
  utility: SkillInfo[];
}

# Changelog

## [3.0.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.2.0...cli-v3.0.0) (2026-03-13)


### ⚠ BREAKING CHANGES

* .agents/ replaces .agent/ as the canonical root directory. Cursor and Antigravity now natively support .agents/, so legacy symlinks (.cursor/skills/, .claude/skills/, .github/skills/) are no longer needed.

### Features

* Add /coordinate workflow for explicit multi-agent orchestration ([8089441](https://github.com/first-fluke/oh-my-agent/commit/80894416b745c7605330360bc35ee74d8751dbb8))
* Add /debug, /review, /plan, /orchestrate workflows ([14e94bf](https://github.com/first-fluke/oh-my-agent/commit/14e94bf28a11542a04447220f54b79f147d68a0d))
* Add 7 advanced enhancements to skill system ([46cd535](https://github.com/first-fluke/oh-my-agent/commit/46cd53588628382019999e97da3a5637b3035ece))
* add brainstorm skill for design-first ideation pipeline ([7fd31b8](https://github.com/first-fluke/oh-my-agent/commit/7fd31b8800046a51121d33ba0dc72e75f713db06))
* add CD tracking and migrate verify.sh to CLI ([e90ba23](https://github.com/first-fluke/oh-my-agent/commit/e90ba23c3327a71388ce7bc55238b3f324940841))
* Add cleanup logic to prevent zombie/orphan processes and /tmp leaks ([a63b49d](https://github.com/first-fluke/oh-my-agent/commit/a63b49d26fec51adada9f90a970deaf5b58653b9))
* Add CLI-based multi-agent orchestrator with Serena Memory coordination ([63102aa](https://github.com/first-fluke/oh-my-agent/commit/63102aaf0a1ec37a782d07eb6af67837a3e48544))
* add Codex environment configuration and enhance project description in READMEs ([1643099](https://github.com/first-fluke/oh-my-agent/commit/164309926c6dd080b96f317cf463181065d2d8c2))
* add commander.js for CLI argument parsing ([c82c54b](https://github.com/first-fluke/oh-my-agent/commit/c82c54bbea46547d05fcc1f7e2a44fb9153a3b2b))
* add coordinate-pro workflow with multi-review architecture ([9c6b3f9](https://github.com/first-fluke/oh-my-agent/commit/9c6b3f9674a1af19e0b97f7d5bd6e01f8a9cdf83))
* add coordinate-pro workflow with multi-review architecture ([59c6fd9](https://github.com/first-fluke/oh-my-agent/commit/59c6fd9049f5dfd09fee2c4a43acf5f09994cd7e))
* Add Debug Agent skill for bug diagnosis and fixing ([13a62dd](https://github.com/first-fluke/oh-my-agent/commit/13a62ddd48d277afef25f2409203a0930a10e5a7))
* add interactive CLI installer and real-time dashboard ([dca197a](https://github.com/first-fluke/oh-my-agent/commit/dca197a69116cac9c747a6d638e9a20bad9c6937))
* Add MANDATORY RULES to workflows and fix dashboard empty array bug ([1dad05a](https://github.com/first-fluke/oh-my-agent/commit/1dad05a7a3728a9d68f24120cca367d0f28771a2))
* add NPM deployment workflow, update command, and doctor command ([60fb8b8](https://github.com/first-fluke/oh-my-agent/commit/60fb8b8bed4ed688cb46368e5697d830703dc83b))
* add release-please automation and central registry support ([5875ee8](https://github.com/first-fluke/oh-my-agent/commit/5875ee8eda61f92226f24a55691cda4b45f6e8b7))
* Add Serena Memory real-time monitoring dashboards ([0f2e809](https://github.com/first-fluke/oh-my-agent/commit/0f2e80954d04dd8b5370064ead378cc7c7e294bf))
* Add SubAgent Orchestrator for CLI-based parallel execution ([0f86169](https://github.com/first-fluke/oh-my-agent/commit/0f8616998d753be29bf21d5851c430b71d3c7e64))
* Add SubAgent Orchestrator for CLI-based parallel execution ([d366d06](https://github.com/first-fluke/oh-my-agent/commit/d366d0656b3fe7677ea812f10814ac2f0cf89aa2))
* add terminal dashboard and route CLI commands correctly ([78af420](https://github.com/first-fluke/oh-my-agent/commit/78af420d3da7cc05e75e43a58deace1a084261eb))
* add usage command with model quota bar chart ([a6ddff2](https://github.com/first-fluke/oh-my-agent/commit/a6ddff2715e79e42083cc29eaecb154c79edaa97))
* adopt .agents/ as canonical root with auto-migration ([a2ade10](https://github.com/first-fluke/oh-my-agent/commit/a2ade10bb92be61d2d8f4b433b9f00481a900c56))
* **agent:** add monorepo config-based workspace detection ([c655f50](https://github.com/first-fluke/oh-my-agent/commit/c655f509257f09d19f89c1875055daf169f57a89))
* **agent:** improve spawn UX with auto-detect workspace, inline prompt, and -w option ([473c32b](https://github.com/first-fluke/oh-my-agent/commit/473c32b170b784da464bb6f81573c1f9d39a3329))
* **backend-agent:** enhance with Repository/Service/Router pattern ([f11be01](https://github.com/first-fluke/oh-my-agent/commit/f11be01eb2c886ae30d0f24a3e15cab18b99aba7))
* **bridge:** auto-fix missing languages key in Serena project configs ([8d76feb](https://github.com/first-fluke/oh-my-agent/commit/8d76febf9fdc94cb66b64b3f947d713988f51f60))
* **bridge:** migrate from SSE to Streamable HTTP transport ([16ad162](https://github.com/first-fluke/oh-my-agent/commit/16ad162d5de1ec8053f6de54d0081206ce938daa))
* broaden dashboard file filtering to all markdown files and enhance activity name parsing by removing additional prefixes and suffixes ([513d0ec](https://github.com/first-fluke/oh-my-agent/commit/513d0ec8bc647b0311528f1c3156a3d42631f62a))
* **cleanup:** add Gemini directory cleanup with -y flag ([061d193](https://github.com/first-fluke/oh-my-agent/commit/061d193b4f3b20eebf411ae3c190d75de37c6a7d))
* **cli:** add agent:parallel command to replace parallel-run.sh ([1527d6b](https://github.com/first-fluke/oh-my-agent/commit/1527d6b5619c98ba28fbe9a1ea9b7a3466085be2))
* **cli:** add Cursor (.cursor/skills/) support to install, update, doctor ([b699b29](https://github.com/first-fluke/oh-my-agent/commit/b699b299bc2e8e531223ae70db8798ea3881e7a0))
* **cli:** add DevOps preset to install wizard ([e428529](https://github.com/first-fluke/oh-my-agent/commit/e428529010aca69be8d08796afc7b328d747042d))
* **cli:** add help and version commands ([cdba845](https://github.com/first-fluke/oh-my-agent/commit/cdba84527627b859723a55d0add1431a0342db29))
* **cli:** add help command and star prompts ([851202a](https://github.com/first-fluke/oh-my-agent/commit/851202a8a48b242233f8c3091553dc2bc45e0e0e))
* **cli:** add infrastructure skills category with terraform and mise support ([48cae1a](https://github.com/first-fluke/oh-my-agent/commit/48cae1aa3113608b99259b2d8397c80581c1d185))
* **cli:** add multi-CLI symlink support for skills ([dc29b6d](https://github.com/first-fluke/oh-my-agent/commit/dc29b6d23ae4a53aefbd0ac9a16a34437bc28ab6))
* **cli:** add oma command alias ([c7a8a6b](https://github.com/first-fluke/oh-my-agent/commit/c7a8a6b7fd1bdd83b4db64e339bf0ce48a13e746))
* **cli:** add star command for GitHub starring with gh CLI integration ([de28489](https://github.com/first-fluke/oh-my-agent/commit/de28489d3e8cdb185a307060061398148d2a3898))
* **cli:** improve agent-facing ergonomics ([ca6661d](https://github.com/first-fluke/oh-my-agent/commit/ca6661d9e66f18868807b3f304ca59927b0af053))
* **cli:** introduce `deepinit` workflow for hierarchical `AGENTS.md` generation ([5247b77](https://github.com/first-fluke/oh-my-agent/commit/5247b77ecd6ab55d43b8952c68782d079bd24e34))
* **cli:** restore Claude Code and GitHub Copilot symlink prompt during install ([db93945](https://github.com/first-fluke/oh-my-agent/commit/db93945aa337dae1874ca7de91831720ee4f95b8))
* **cli:** show contextual support message based on star status ([42d7b19](https://github.com/first-fluke/oh-my-agent/commit/42d7b198bc1519ef523d7fa4a1d1d9d7e95497fb))
* Close 5 performance gaps between Pro and Opus models ([02b89aa](https://github.com/first-fluke/oh-my-agent/commit/02b89aaebeac38b6847e2d25547169b0e269c34f))
* **commit:** add smart commit splitting by feature/domain ([7b63a46](https://github.com/first-fluke/oh-my-agent/commit/7b63a46dc3184a0cf2927517eafb322bcdc64033))
* **doctor:** add symlink validation for multi-CLI setup ([1d6fa4f](https://github.com/first-fluke/oh-my-agent/commit/1d6fa4fa51e39ba7beb20c964ce876397b218c6c))
* **frontend-agent:** merge frontend-engineer content with FSD-lite architecture ([34a1e6f](https://github.com/first-fluke/oh-my-agent/commit/34a1e6f1bacd8470df9f551485fae2aa81eb69e7))
* Implement Multi-Agent Orchestrator for Google Antigravity ([5a2dfd9](https://github.com/first-fluke/oh-my-agent/commit/5a2dfd9825a42611da113e5dd1c657a891a5d0b2))
* improve cli config parsing and memory tooling ([9322a6b](https://github.com/first-fluke/oh-my-agent/commit/9322a6bdc411c437b1f1e6ef3d93c15aa6222187))
* install agent workflows, user preferences, and mcp.json during setup ([ada8beb](https://github.com/first-fluke/oh-my-agent/commit/ada8beb668bdd767e76938e136630ac78981a47d))
* **install,doctor:** add git rerere auto-detection and setup ([f027fc0](https://github.com/first-fluke/oh-my-agent/commit/f027fc033a1430e7731aefa07f6e2a78cfab9b68))
* **install,doctor:** show support prompt last with sponsor link ([96624f3](https://github.com/first-fluke/oh-my-agent/commit/96624f3c758df51430bc2664f3f26314e54b4ccf))
* introduce `oh-my-ag agent:spawn` and `agent:status` CLI commands ([ddff790](https://github.com/first-fluke/oh-my-agent/commit/ddff79018c16a1dcff0edcf77011d911c2d16f6e))
* introduce `read_only_memory_patterns` configuration to `project.yml` for defining read-only memory entries ([01db9fc](https://github.com/first-fluke/oh-my-agent/commit/01db9fc3f7f9d75f9fdcae6d87f0149910ab5230))
* merge OpenCode/Amp/Codex options and add GitHub Copilot support ([b2e7fa1](https://github.com/first-fluke/oh-my-agent/commit/b2e7fa1d8e6f748cfdf92f351d8f5d72f81eded6))
* ntroduce `bridge` command, integrate Biome for code formatting, and update dependencies ([8933349](https://github.com/first-fluke/oh-my-agent/commit/89333490cec8df439980534aa1d29d863c61648f))
* **orchestrator:** add multi-CLI agent mapping and user preferences ([a2585d8](https://github.com/first-fluke/oh-my-agent/commit/a2585d8d4fb24c2544a6af5ea421016deb4b4141))
* restore workflow and skill files from latest ([9395681](https://github.com/first-fluke/oh-my-agent/commit/9395681ccb41087ef2dea045c84be836a60c29a9))
* **scripts:** add MCP SSE bridge for Antigravity IDE ([4e50e2f](https://github.com/first-fluke/oh-my-agent/commit/4e50e2f427fa37ef23dce6ae5854fea923190ccf))
* **skills:** add mise-devops-runner skill for monorepo task automation ([7a2b9df](https://github.com/first-fluke/oh-my-agent/commit/7a2b9df12120e96867e17739a81968bd54de7a93))
* **skills:** add terraform-infra-engineer reference files ([4e0f6eb](https://github.com/first-fluke/oh-my-agent/commit/4e0f6eb407236b64de612722ba3187bc6e95a56a))
* **skills:** add terraform-infra-engineer skill for multi-cloud support ([a21f4e6](https://github.com/first-fluke/oh-my-agent/commit/a21f4e61dbb3a07f66a525be21976637e6008bec))
* **skills:** apply harness engineering patterns ([f73405a](https://github.com/first-fluke/oh-my-agent/commit/f73405a184aee8a3745154a5df9b242baf8d7d15))
* split cli/web workspaces and docs release flow ([5609032](https://github.com/first-fluke/oh-my-agent/commit/5609032bf657e4e4d71e0acaa2e319effcdf8a35))
* switch skills ssot to .agents ([c4b63a2](https://github.com/first-fluke/oh-my-agent/commit/c4b63a295e96aa471cf575495bc048cf0e3cda69))
* **update:** auto-update CLI symlinks when updating skills ([fe6a99c](https://github.com/first-fluke/oh-my-agent/commit/fe6a99c6a0ce49ad6355ba0a210271c31d944e30))
* **usage:** add flow credits, tier, default model, image support info ([b20224c](https://github.com/first-fluke/oh-my-agent/commit/b20224c94518f4c02e6a2dff6db3e4ab7a56b39e))
* **web:** add documentation search functionality ([0523012](https://github.com/first-fluke/oh-my-agent/commit/052301206e510a13b098f552b3ce7dd7e58ee4dc))
* **web:** add landing page and expand docs guides ([b18e4a1](https://github.com/first-fluke/oh-my-agent/commit/b18e4a137c852381edf31a4d4e98a5d96d476782))


### Bug Fixes

* also correct Gemini CLI package name in setup workflow ([4d37ef2](https://github.com/first-fluke/oh-my-agent/commit/4d37ef2e3690b2b8d5571f7aa93fb84dfdefec7c))
* **bridge:** add missing --transport sse flag and harden startup checks ([98a0019](https://github.com/first-fluke/oh-my-agent/commit/98a00199da2578aa01f0e53aae1adcad430e571c))
* **ci:** refine release-please publish flow ([1c98953](https://github.com/first-fluke/oh-my-agent/commit/1c989531d7df063bc216634e37871d4c9e05fa24))
* **cli:** correct release-please extra-files paths for root-level manifest ([ecd18f1](https://github.com/first-fluke/oh-my-agent/commit/ecd18f1d333f90d5fc19845fb52d104eeafc2b25))
* **cli:** fetch reference files during skill installation ([05be60d](https://github.com/first-fluke/oh-my-agent/commit/05be60d19c7738cdb914afc29e7f85dd42c3a294))
* **cli:** specify automatic exclusion of framework-generated cross-platform build directories in the deepinit workflow ([b6002bf](https://github.com/first-fluke/oh-my-agent/commit/b6002bfd7d2bedbb0f7a01965ba9e674e567f53b))
* **cli:** use SKILLS registry whitelist for symlink creation ([8f87501](https://github.com/first-fluke/oh-my-agent/commit/8f875015993a011316b4e018a4ae9979b5c518b8))
* commit prompt-manifest.json to repo on release ([a11dbfd](https://github.com/first-fluke/oh-my-agent/commit/a11dbfdc5b5eb0135a6f13eea4e553680d4e38e1))
* **commit:** update co_author to First Fluke ([23fbc34](https://github.com/first-fluke/oh-my-agent/commit/23fbc34e527f050c956acf545e3f354999c20053))
* convert generate-manifest.js to ES module syntax ([bce2296](https://github.com/first-fluke/oh-my-agent/commit/bce22962b4dc69ef18bb697c11bc3f8422877c26))
* correct broken file reference in SKILL.md files ([bddf54a](https://github.com/first-fluke/oh-my-agent/commit/bddf54a1f9161dec9c54d25e92e3ea3fef73d54f))
* correct Gemini CLI package name from [@anthropic-ai](https://github.com/anthropic-ai) to [@google](https://github.com/google) ([5081c45](https://github.com/first-fluke/oh-my-agent/commit/5081c45d1ed76647a11ff46178cb953905aecfdc))
* correct Gemini CLI package name from [@anthropic-ai](https://github.com/anthropic-ai) to [@google](https://github.com/google) ([2debc87](https://github.com/first-fluke/oh-my-agent/commit/2debc87d7fc7625f899c86700d67d68855280af3))
* Correct implementation to use Antigravity IDE native workflow ([2faec7c](https://github.com/first-fluke/oh-my-agent/commit/2faec7c2378e1b2e89d4f12fec2b9a93282c563e))
* correct manifest version lookup for release-please key change ([aab419f](https://github.com/first-fluke/oh-my-agent/commit/aab419f07dd21103681e864189cf56d7bb74a964))
* correct release-please extra file paths ([ae0da99](https://github.com/first-fluke/oh-my-agent/commit/ae0da997514a5e727028ccf17c7be070adf64b0c))
* **dashboard:** filter activity to progress/result files only ([99a0e63](https://github.com/first-fluke/oh-my-agent/commit/99a0e635a5c6522195181119c21fdb7ddf8abef4))
* **deps:** sync bun lockfile metadata ([d46dff4](https://github.com/first-fluke/oh-my-agent/commit/d46dff44cbacbf98f93d5aeb0aec34ad5d8e6294))
* **docs:** inline sync-agent-registry action and rename .yaml to .yml ([c25475c](https://github.com/first-fluke/oh-my-agent/commit/c25475cee6908a197ac17d3211e6405b620597fd))
* Improve dashboard flexibility and fix Gemini MCP config ([afefbca](https://github.com/first-fluke/oh-my-agent/commit/afefbca5b702a6a3de8f0bb32ab9d75163620c37))
* install workflows to global directory for Antigravity access (fixes [#12](https://github.com/first-fluke/oh-my-agent/issues/12)) ([05498a2](https://github.com/first-fluke/oh-my-agent/commit/05498a2b18bf12130e638e42fbe6fb24b5107fad))
* **lint:** auto-fix lint errors with biome ([7b8745b](https://github.com/first-fluke/oh-my-agent/commit/7b8745bc2fbee3a3c922e89a91f18b633495bb1a))
* make terminal dashboard async to keep event loop alive ([edda589](https://github.com/first-fluke/oh-my-agent/commit/edda589338859a4f3e98f228cef303635e842327))
* OpenCode, Amp, Codex all use .agents/skills/ ([ed4f9bd](https://github.com/first-fluke/oh-my-agent/commit/ed4f9bdf688d69620af22bc27234b0f7f8b0182e))
* **orchestrator:** correct user-preferences.yaml path in spawn-agent.sh ([d4f507d](https://github.com/first-fluke/oh-my-agent/commit/d4f507d6aa0492eaa00c33d1a8281e7326bf6890))
* **orchestrator:** replace spawn-agent.sh with oh-my-ag agent:spawn CLI ([f49701b](https://github.com/first-fluke/oh-my-agent/commit/f49701b5892000b3dd1dfac4b39fb9807a2591a1))
* **orchestrator:** restore wrapper scripts for CLI commands ([93715f0](https://github.com/first-fluke/oh-my-agent/commit/93715f02cba902638c8c2447fdff9ef2d52ffeb3))
* **release:** allow legacy publish without license file ([6c69839](https://github.com/first-fluke/oh-my-agent/commit/6c698394b23327bbc7bcff24076d5cc4d4440fcb))
* **release:** remove legacy publish lifecycle scripts ([26ac606](https://github.com/first-fluke/oh-my-agent/commit/26ac6061e7b37c8c3e6b021fe270b99fbd38553e))
* Replace Agent Manager UI with CLI-based workflow and remove Korean defaults ([62fa930](https://github.com/first-fluke/oh-my-agent/commit/62fa93064d2f47566dd584508cab7221f314ae58))
* resolve user-preferences.yaml by walking up parent directories ([0d1d68b](https://github.com/first-fluke/oh-my-agent/commit/0d1d68b0bd2d6e4922f35005f34f770698f7bdac))
* resolve vendor selection and update CLI configs ([bbfdb39](https://github.com/first-fluke/oh-my-agent/commit/bbfdb39464921930b6354105af01d22f99078519))
* route all non-web commits to cli release ([26c4753](https://github.com/first-fluke/oh-my-agent/commit/26c4753204e62ba950ed8f8f57a5cc71e8db31fe))
* **transport:** migrate MCP transport from SSE to Streamable HTTP ([5c85c32](https://github.com/first-fluke/oh-my-agent/commit/5c85c324c1109fb80fe3c5c2820c656fa2a13859))
* update Codex skills path from .codex/skills to .agents/skills ([8c30a97](https://github.com/first-fluke/oh-my-agent/commit/8c30a97cbe29d7117aa13322b11acad011a1a03d))
* update star command, add funding info, support dashboard:web alias ([2a6ec0a](https://github.com/first-fluke/oh-my-agent/commit/2a6ec0ae2fbcc759c3fa3ade36b83033bdf63800))
* **workflow:** add memory protocol and monitoring to coordinate-pro ([4c1fa1f](https://github.com/first-fluke/oh-my-agent/commit/4c1fa1f13101399e2a815138a1aaa32f34f1cf68))
* **workflow:** add monitoring wait loops to coordinate-pro phases ([9b8fd87](https://github.com/first-fluke/oh-my-agent/commit/9b8fd87863cbc25e563652215f93069d133ccd13))
* **workflow:** change PM Agent from spawn to inline activation ([46341d7](https://github.com/first-fluke/oh-my-agent/commit/46341d79adfabbddb8637e431bf7594ee7106e62))


### Refactoring

* Abstract MCP tools from Serena and update Gemini CLI flags ([ce74d81](https://github.com/first-fluke/oh-my-agent/commit/ce74d812fdea11aedaa82e0ef10875610dabe877))
* add Intelligent Escalation to backend agent execution protocol ([e366ad4](https://github.com/first-fluke/oh-my-agent/commit/e366ad4c122b8e44b5aa60cea4feb88e3481957f))
* add Intelligent Escalation to frontend agent execution protocol ([6766640](https://github.com/first-fluke/oh-my-agent/commit/6766640457a4f766a7006603d0b416336a20ba14))
* add Intelligent Escalation to mobile agent execution protocol ([4c99c98](https://github.com/first-fluke/oh-my-agent/commit/4c99c98e2604f0fe84151667c22eab9782cdfd51))
* add Intelligent Escalation to PM, QA, and debug agent execution protocols ([2b79d4e](https://github.com/first-fluke/oh-my-agent/commit/2b79d4ec6a742dbfb408fbc88af24fb71012b563))
* **cli:** extract commands to commands directory and add auto retro ([471669a](https://github.com/first-fluke/oh-my-agent/commit/471669a9d8ca007599727fd94432db4de4cc9dad))
* **cli:** extract types to dedicated types directory ([b702fd3](https://github.com/first-fluke/oh-my-agent/commit/b702fd367724307de5abaffa1c6580cc4e7f87b0))
* **cli:** extract utility functions to lib directory ([602b232](https://github.com/first-fluke/oh-my-agent/commit/602b2323ecdcd1df01aa46f381d9bc1b3cbf5b79))
* convert generate-manifest to TypeScript ([c9b13df](https://github.com/first-fluke/oh-my-agent/commit/c9b13dfa85bea41e14498231795404c263057e2e))
* **doctor:** remove dashboard checks and update CLI install commands ([12de2cf](https://github.com/first-fluke/oh-my-agent/commit/12de2cfcb4f59c064ca032cfc7f33ab3ae9a26a9))
* migrate CLI to commander.js framework ([2b48e5e](https://github.com/first-fluke/oh-my-agent/commit/2b48e5ed6875c01fa6ee5a347af3964d7c68d979))
* move brain output directory from .gemini/antigravity/brain/ to .agent/brain/ ([f093e52](https://github.com/first-fluke/oh-my-agent/commit/f093e52bac47f3938381bc48bdacde02c56be4e5))
* Reduce SKILL.md files for token efficiency ([4f198f9](https://github.com/first-fluke/oh-my-agent/commit/4f198f95a1b2e90be585b8c72c04e2fcd7519c86))
* Reduce SKILL.md files for token efficiency ([ff2b396](https://github.com/first-fluke/oh-my-agent/commit/ff2b396180024c22f035a157c39c7e67ce01dfea))
* remove old dashboard scripts, use CLI exclusively ([838fc26](https://github.com/first-fluke/oh-my-agent/commit/838fc26f356c707983b725e99d2658f4cf1871c9))
* rename .agent/ to .agents/ as canonical root ([ca3ca3f](https://github.com/first-fluke/oh-my-agent/commit/ca3ca3f658ed3ead256dad96dc1196b92d8a81c6))
* rename package from oh-my-antigravity to oh-my-ag ([21981ab](https://github.com/first-fluke/oh-my-agent/commit/21981ab052df0166c08c7d2e10d118179a1daf3f))
* rename references to resources and add dynamic file fetching ([7493587](https://github.com/first-fluke/oh-my-agent/commit/7493587fcaff96e9109ca5989932c6fb7b3c9ee2))
* rename terraform-infra-engineer to tf-infra-agent ([3c03852](https://github.com/first-fluke/oh-my-agent/commit/3c03852ef473a5e307ce7d497e15d16bbf89b468))
* Rewrite AGENT_GUIDE.md as executable instructions for agents ([a628dea](https://github.com/first-fluke/oh-my-agent/commit/a628dea0e132b41c478471493c9014f32ff48269))
* **skills:** rename mise-devops-runner to developer-workflow ([7a34b46](https://github.com/first-fluke/oh-my-agent/commit/7a34b46c44b060afc08c1634e6b66bedb54a5035))
* Slim SKILL.md files ~75% by extracting details to resources/ ([7a5fe26](https://github.com/first-fluke/oh-my-agent/commit/7a5fe26103fffd360473c2324f8973c5edeb4da8))
* vendor-agnostic execution protocol injection ([61fc225](https://github.com/first-fluke/oh-my-agent/commit/61fc2259ec0c5294db9c994ef266d745e722bbbe))
* **web:** migrate search to cmdk ([c282426](https://github.com/first-fluke/oh-my-agent/commit/c282426bd3596d74713ecc73f93550c983d1f94a))
* **web:** migrate to TypeScript and motion package ([bc9233b](https://github.com/first-fluke/oh-my-agent/commit/bc9233b598bf28c2d5f98a427109074f53dd8b28))
* **workflow:** redesign deepinit as harness initializer ([568f332](https://github.com/first-fluke/oh-my-agent/commit/568f3321d37672f8b7430a33ee6b2c9708de36dc))


### Documentation

* add 'and beyond' to tagline for broader platform support ([a501ef6](https://github.com/first-fluke/oh-my-agent/commit/a501ef664de20659500d48198ce2de088861edcd))
* add all language links to integration guide footer in README ([2bf88b4](https://github.com/first-fluke/oh-my-agent/commit/2bf88b489278f9e7021ffe289e9186a1145d5f63))
* add Antigravity as first AI IDE in README files ([80b1099](https://github.com/first-fluke/oh-my-agent/commit/80b1099bbf597b5a2506e6e97c1d22b265cb6ab8))
* add brainstorm and coordinate-pro to all README files ([a667654](https://github.com/first-fluke/oh-my-agent/commit/a6676546c03a3c885a86b5bc47cba1231ab98a93))
* add bun install hint to Korean README ([0c95218](https://github.com/first-fluke/oh-my-agent/commit/0c95218f50583682163e7a2d8307994c25ef075a))
* add Buy Me a Coffee badge to sponsor sections ([641302e](https://github.com/first-fluke/oh-my-agent/commit/641302e774b5a32c705268ec36eb2aab4bb4c4f9))
* add demo simulation script for promotional GIF ([20eaa6b](https://github.com/first-fluke/oh-my-agent/commit/20eaa6b7131a8b0406b8dcf27bf2edd0eb87c865))
* add doctor command recommendation for verifying setup ([458eece](https://github.com/first-fluke/oh-my-agent/commit/458eece331ab7a6d7cfb84ecba281d329d5323c8))
* add gh star command to README ([690d4c3](https://github.com/first-fluke/oh-my-agent/commit/690d4c301450cbc14fc686d81b9acbc4aa5693b5))
* Add integration instructions for existing Antigravity projects ([397c4e9](https://github.com/first-fluke/oh-my-agent/commit/397c4e9975617c9e65f1c2983d305343f23863b8))
* Add Korean USAGE guide and Agent execution guide ([bf2d385](https://github.com/first-fluke/oh-my-agent/commit/bf2d3857d376c744e492d2765e6c7cf196377830))
* add language selector links to all translated READMEs ([170b504](https://github.com/first-fluke/oh-my-agent/commit/170b5047fb03bdb762f4fb2cc06edf7f45db4e0f))
* add language selector links to all translated READMEs ([ff733c2](https://github.com/first-fluke/oh-my-agent/commit/ff733c2e95e52ffe8e7c6e94f3f552df3631a804))
* add project integration instructions to READMEs ([cc923d0](https://github.com/first-fluke/oh-my-agent/commit/cc923d0f39f34a852460823ca61af6cb77d04c4e))
* add Simplified Chinese (zh) translations ([a4d4c24](https://github.com/first-fluke/oh-my-agent/commit/a4d4c2490c825d8b507666b1aef600530498ac99))
* add sponsors section and SPONSORS.md ([507303a](https://github.com/first-fluke/oh-my-agent/commit/507303a0be7577dc7c3f5aa6c1b2514af160fc11))
* add Star History section to README files ([cab9cee](https://github.com/first-fluke/oh-my-agent/commit/cab9cee8bae1c0cb0a5767a1b90ae8dc2e74cce7))
* add translations for 9 languages (pt, ja, fr, es, nl, pl, uk, ru, de) ([bdfb06c](https://github.com/first-fluke/oh-my-agent/commit/bdfb06cafc6535d6d6ee9f6ed880fc9594759007))
* add usage command to CLI Commands section ([7d89582](https://github.com/first-fluke/oh-my-agent/commit/7d89582eaf7799c0aeecb47b41c427a4ee4286b7))
* add uv as prerequisite for Serena setup ([909c4db](https://github.com/first-fluke/oh-my-agent/commit/909c4db7428b61ba47efd7dd464bff3d54c133fc))
* clean up README files ([e73e674](https://github.com/first-fluke/oh-my-agent/commit/e73e674c999b0e63fd05dafd9d590447d3e5d0bb))
* **commit:** translate skill documentation to English ([3bb62c1](https://github.com/first-fluke/oh-my-agent/commit/3bb62c10e0a4640fc9f5b65071c3be3c063a9216))
* Enhance AGENT_GUIDE.md with comprehensive safety measures ([125294b](https://github.com/first-fluke/oh-my-agent/commit/125294b00a8615e9b68cc019328dbb2deecd4cce))
* enhance clarification-protocol with Intelligent Escalation ([2fee2f7](https://github.com/first-fluke/oh-my-agent/commit/2fee2f734f00b7a16e87a1e97e111ee7fb70b930))
* fix USAGE.ko.md filename reference in README files ([1b85842](https://github.com/first-fluke/oh-my-agent/commit/1b85842fabc35dcdab3d26f90df66f76cae01608))
* improve architecture diagram and fix README inconsistencies ([ad87c9d](https://github.com/first-fluke/oh-my-agent/commit/ad87c9dbc12ca9e7e45e4e8debf54f536dce441e))
* move detailed sections from READMEs to web/content ([552b654](https://github.com/first-fluke/oh-my-agent/commit/552b654348ae1d8797976bf029aff3bc1b3166a4))
* move README.*.md files to docs/ directory ([06ec167](https://github.com/first-fluke/oh-my-agent/commit/06ec167f3ecf570bded1583a8d683ccbe342d73e))
* move skill architecture details to web docs ([028afdb](https://github.com/first-fluke/oh-my-agent/commit/028afdb1483bb547adf8691f73c9cae8d62d3b6b))
* move star and starter template section below Sponsors ([2ab47b3](https://github.com/first-fluke/oh-my-agent/commit/2ab47b3c93fa83ab2ee983409193cffdc9c1677e))
* move USAGE docs to docs/ and update outdated spawn references ([970a187](https://github.com/first-fluke/oh-my-agent/commit/970a18722f58a32531107b77cf0124459dc447d8))
* **orchestrator:** remove deleted spawn-agent.sh from references ([6dbb009](https://github.com/first-fluke/oh-my-agent/commit/6dbb009d25eb170eca0c07c2df7cb2c1cfd95ea5))
* **orchestrator:** use script path for verification reference ([e2138e5](https://github.com/first-fluke/oh-my-agent/commit/e2138e5684683e3fea861d62ce0a58253a917ee3))
* **readme:** remove obsolete troubleshooting and prerequisites ([97c0061](https://github.com/first-fluke/oh-my-agent/commit/97c0061825cd207abf7730c199a75343ddc73a0d))
* **readme:** update CLI installation commands to use bun ([1af294e](https://github.com/first-fluke/oh-my-agent/commit/1af294e01822ea49a447fdb83581784e1d257ba1))
* reduce dashboard duplication in readmes ([1b0524f](https://github.com/first-fluke/oh-my-agent/commit/1b0524feebac4919f76f79d1549b6632a707c68b))
* remove duplicate Brainstorm rows and Ideation subgraph from diagrams ([f420dfd](https://github.com/first-fluke/oh-my-agent/commit/f420dfd5f51b0b8cb73d48e8bd31c1b3683c04be))
* remove extra blank line in table of contents ([7ca89a6](https://github.com/first-fluke/oh-my-agent/commit/7ca89a61cd201307a031ac7f9b5f0869855e8b68))
* remove npm scripts fallback from dashboard section ([5d888a9](https://github.com/first-fluke/oh-my-agent/commit/5d888a9d82b32a3c25199b46a8eba941f24408b7))
* remove redundant setup sections from README files ([fda0e61](https://github.com/first-fluke/oh-my-agent/commit/fda0e612639343895d6e3a73886abe6a048beacc))
* remove redundant Skills Overview section ([efc4665](https://github.com/first-fluke/oh-my-agent/commit/efc4665b6839dc118ad5fa28758c84c43fc8c484))
* rename Korean docs from -ko.md to .ko.md extension ([ad70cd6](https://github.com/first-fluke/oh-my-agent/commit/ad70cd66b95c16e5dc729404c0f9d15e93e2dcc9))
* reorder chat section to prioritize /coordinate workflow ([5e6a54a](https://github.com/first-fluke/oh-my-agent/commit/5e6a54a7cb3c13d5dd8879d66cf7a8126a7165f5))
* restructure and enhance installation instructions and prerequisites in READMEs ([fd1adaf](https://github.com/first-fluke/oh-my-agent/commit/fd1adaf8acdbba94f536e0a025a41addedd63991))
* Rewrite AGENT_GUIDE.md as integration guide for developers ([6711f34](https://github.com/first-fluke/oh-my-agent/commit/6711f34d3b9d8e1722729fbb7129ccd90c52fa38))
* Rewrite guides with dashboard docs in English and Korean ([2034b21](https://github.com/first-fluke/oh-my-agent/commit/2034b219e730acca5d7414837b0a1cc339974842))
* **setup:** add Antigravity IDE SSE bridge configuration ([1422790](https://github.com/first-fluke/oh-my-agent/commit/1422790e854aa767b5b416e0a3c9105655b4e9bb))
* **setup:** rewrite in English and make Serena config optional ([9f44393](https://github.com/first-fluke/oh-my-agent/commit/9f44393a0f3dbcd9d68a6b987235c6530796c629))
* simplify installation options in README files ([b4c9a7a](https://github.com/first-fluke/oh-my-agent/commit/b4c9a7a1ac3010742e9d993ec244f9f16beb9c8e))
* sort CLI commands alphabetically and simplify ([9d2086d](https://github.com/first-fluke/oh-my-agent/commit/9d2086d6c0af8424c94fa01fbd0f0d79129743f4))
* split project structure docs and sync Korean README registry ([fbdb3fb](https://github.com/first-fluke/oh-my-agent/commit/fbdb3fb968f78b7cb3fe3a9d17790677f02f4ac5))
* translate Korean comments to English ([752948c](https://github.com/first-fluke/oh-my-agent/commit/752948cd27d3c0901db5ee3c6441ff00d2afc04d))
* translate remaining Korean text to English ([aa8ed3b](https://github.com/first-fluke/oh-my-agent/commit/aa8ed3b3f0d8a726378e39f545806d1d38dc8b38))
* translate tools.md workflow from Korean to English ([34a0937](https://github.com/first-fluke/oh-my-agent/commit/34a093778eb61410b147f1294b12a070aa80d6bb))
* update agent descriptions and rename Framework to Harness ([896932d](https://github.com/first-fluke/oh-my-agent/commit/896932d096d864d680a803961ba08d7a6e7be6c7))
* update all documentation for oh-my-ag rebrand ([410ad0b](https://github.com/first-fluke/oh-my-agent/commit/410ad0b2774d5b0a68a5a2a3de978f508a490143))
* update Claude CLI installation command to official bash script ([2e5e6aa](https://github.com/first-fluke/oh-my-agent/commit/2e5e6aa1ce2ced32c00a94346182ae6ae1af6aa3))
* update dashboard commands to prioritize bunx CLI usage ([41b554f](https://github.com/first-fluke/oh-my-agent/commit/41b554f6f25f3167f96cb82515f3c5841198386c))
* Update project documentation to reflect new skill architecture ([f403958](https://github.com/first-fluke/oh-my-agent/commit/f4039589a140f83f2ffa18e42255fd9d89d3d121))
* update README headlines to include project name ([60192d6](https://github.com/first-fluke/oh-my-agent/commit/60192d63b0472bb8f854fe8ef1b36d519fdf81e3))
* update Real-time Dashboards section to use bunx commands ([f413e1d](https://github.com/first-fluke/oh-my-agent/commit/f413e1d19cb6b53c04da795c255cade7bfc48319))
* update usage command references to usage:anti in CHANGELOG ([d739d2c](https://github.com/first-fluke/oh-my-agent/commit/d739d2cf07bac097cfefdc8e939bb025ebb7599b))
* update usage command to usage:anti across all documentation ([c696920](https://github.com/first-fluke/oh-my-agent/commit/c6969203005ce46eae40d5a3fd0ccea77c0cba84))
* use bunx instead of npx for skills add ([a0413a6](https://github.com/first-fluke/oh-my-agent/commit/a0413a682c2be36284f7f242f0a5874d7a773364))
* **web:** move central registry guide into docs navigation ([1d50070](https://github.com/first-fluke/oh-my-agent/commit/1d50070b1083adc867e08e7d797d1c2442995c7c))


### Miscellaneous

* add __pycache__ to gitignore and remove tracked .pyc ([24915a6](https://github.com/first-fluke/oh-my-agent/commit/24915a6b42fa99996d4e34f2a0db4905ede7ebee))
* add .mimic/ to gitignore ([42b4e77](https://github.com/first-fluke/oh-my-agent/commit/42b4e774cfebcfea62436fccdbc52c21b85ccb6b))
* add GitHub Sponsors and Buy Me a Coffee funding ([5de8e5f](https://github.com/first-fluke/oh-my-agent/commit/5de8e5f10c5d6cf6895f116f7e91011023802db8))
* **cli:** bump package version to 1.25.1 ([3bcb4d4](https://github.com/first-fluke/oh-my-agent/commit/3bcb4d4bf09a5d8582b03e89fb7859299200dd06))
* **cli:** update dependencies to latest ([e73285a](https://github.com/first-fluke/oh-my-agent/commit/e73285a2aca442d4c596e2ddcc2b6541e0b210ef))
* **git:** ignore built CLI binary ([6807613](https://github.com/first-fluke/oh-my-agent/commit/6807613289df689d6be821440786f1757ccf3b29))
* **main:** release cli 1.15.0 ([5deacf7](https://github.com/first-fluke/oh-my-agent/commit/5deacf780afe674d37f8f8064cbf4b16c9a1477e))
* **main:** release cli 1.15.0 ([1f23594](https://github.com/first-fluke/oh-my-agent/commit/1f23594723e81caf084ef2ae14ed6b41febb1c53))
* **main:** release cli 1.16.0 ([7130613](https://github.com/first-fluke/oh-my-agent/commit/71306130547405288acb1801c0c38ab31a1daf90))
* **main:** release cli 1.16.0 ([ccba318](https://github.com/first-fluke/oh-my-agent/commit/ccba318b0afeeb1e6a9b6a7e9aadeeaad324fa3f))
* **main:** release cli 1.17.0 ([1aefed4](https://github.com/first-fluke/oh-my-agent/commit/1aefed40880be3bceac390d1220833977a48a315))
* **main:** release cli 1.17.0 ([26c70b2](https://github.com/first-fluke/oh-my-agent/commit/26c70b262ac37e0d752d9610d0e29a643ee892c7))
* **main:** release cli 1.18.0 ([4226997](https://github.com/first-fluke/oh-my-agent/commit/4226997393e3dc02b26767a67027c16f564521eb))
* **main:** release cli 1.18.0 ([fec3d99](https://github.com/first-fluke/oh-my-agent/commit/fec3d99344e205945c86853c14a8a858c63f2937))
* **main:** release cli 1.19.0 ([7bde6b6](https://github.com/first-fluke/oh-my-agent/commit/7bde6b6cfcf056c86d37bc8e3b8398b00a8cf7b1))
* **main:** release cli 1.19.0 ([a5c0ce3](https://github.com/first-fluke/oh-my-agent/commit/a5c0ce31feb8c2d18a70fb24b84e3c04bf91a8f3))
* **main:** release cli 1.20.0 ([6eb44db](https://github.com/first-fluke/oh-my-agent/commit/6eb44dbb6e76a1290c6606dcf12d94a4453793d2))
* **main:** release cli 1.20.0 ([18109b2](https://github.com/first-fluke/oh-my-agent/commit/18109b22d8ac23ad1499ec42390c111912eebbc7))
* **main:** release cli 1.20.1 ([ef2c038](https://github.com/first-fluke/oh-my-agent/commit/ef2c03846271c392b7e578ad404415a459d0bae2))
* **main:** release cli 1.20.1 ([35eb769](https://github.com/first-fluke/oh-my-agent/commit/35eb769a556c34bfa4a5bbef2f56daec6c7ec997))
* **main:** release cli 1.21.0 ([cb2094f](https://github.com/first-fluke/oh-my-agent/commit/cb2094ff1fbeb6a57a6522375ee2db5141e0ecb5))
* **main:** release cli 1.21.0 ([306d85b](https://github.com/first-fluke/oh-my-agent/commit/306d85b67cc48e5319b26c911a746efaf7810d0d))
* **main:** release cli 1.21.1 ([511309d](https://github.com/first-fluke/oh-my-agent/commit/511309d3f69884ca85c4193678816d826efadb0c))
* **main:** release cli 1.21.1 ([cd453d6](https://github.com/first-fluke/oh-my-agent/commit/cd453d631f3232c3c1820239531100a693e92bf0))
* **main:** release cli 1.24.0 ([98dcc7c](https://github.com/first-fluke/oh-my-agent/commit/98dcc7c70585f173cc650bb8f53af8d99044a4c4))
* **main:** release cli 1.24.0 ([165e5e5](https://github.com/first-fluke/oh-my-agent/commit/165e5e56a9386d7f935d134686cf736f10ef8c8c))
* **main:** release cli 1.25.0 ([75e4635](https://github.com/first-fluke/oh-my-agent/commit/75e46351bcb3773e24d2479a816fbe24f5ead50d))
* **main:** release cli 1.25.0 ([303d04c](https://github.com/first-fluke/oh-my-agent/commit/303d04c127744769508ca23fc734fc21d68b41e4))
* **main:** release cli 1.25.1 ([bff4e57](https://github.com/first-fluke/oh-my-agent/commit/bff4e570737e554aa249ca58ee79f848c432a11d))
* **main:** release cli 1.25.1 ([97a36ce](https://github.com/first-fluke/oh-my-agent/commit/97a36ce9e430cf2c33c81d208e40232773b3324b))
* **main:** release cli 1.26.0 ([4857ad5](https://github.com/first-fluke/oh-my-agent/commit/4857ad5b06795ec2c27ab35257dd6892c366691c))
* **main:** release cli 1.26.0 ([b02b635](https://github.com/first-fluke/oh-my-agent/commit/b02b6351575c1e3a9020a8c04aaf4a85ca153dcf))
* **main:** release cli 1.26.1 ([b20d065](https://github.com/first-fluke/oh-my-agent/commit/b20d065a36512b912125c5ebfcdbf4f9d640db3b))
* **main:** release cli 1.26.1 ([86db0ab](https://github.com/first-fluke/oh-my-agent/commit/86db0ab54964d78e2f085d474646c6c38399bcb9))
* **main:** release cli 1.26.2 ([fee5af8](https://github.com/first-fluke/oh-my-agent/commit/fee5af8a21490a31edf70f5776e46de49c175c98))
* **main:** release cli 1.27.0 ([e930a9b](https://github.com/first-fluke/oh-my-agent/commit/e930a9bb1ffce8ea2ebcd3b38f682efb43b56e75))
* **main:** release cli 1.27.0 ([21e78ab](https://github.com/first-fluke/oh-my-agent/commit/21e78abcca11c3a2c60f92d790f92f720e213be1))
* **main:** release cli 1.28.0 ([9ba7f3d](https://github.com/first-fluke/oh-my-agent/commit/9ba7f3d8b0ba994c1c98ce593ae82bcb8720243f))
* **main:** release cli 1.28.0 ([aa4edd7](https://github.com/first-fluke/oh-my-agent/commit/aa4edd7a18eb4e73181ad9a6108cf49fdb57c003))
* **main:** release cli 1.29.0 ([cbbc3df](https://github.com/first-fluke/oh-my-agent/commit/cbbc3df98a642192e852e69b997644172af6055c))
* **main:** release cli 1.29.0 ([903b634](https://github.com/first-fluke/oh-my-agent/commit/903b6345fd9f46ef2a85c3b95697ce6b850a331f))
* **main:** release cli 2.0.0 ([c00e64e](https://github.com/first-fluke/oh-my-agent/commit/c00e64e984402ce397cd07d9240f482467af918c))
* **main:** release cli 2.0.0 ([8892c50](https://github.com/first-fluke/oh-my-agent/commit/8892c50b86f6581196603f0aa7bcd16a8567831b))
* **main:** release cli 2.0.1 ([edac752](https://github.com/first-fluke/oh-my-agent/commit/edac7525f1d2406782c34d45c3848503e576dede))
* **main:** release cli 2.0.1 ([d567a45](https://github.com/first-fluke/oh-my-agent/commit/d567a4583cfb7bc49dae652e61f17f6098f2fa51))
* **main:** release cli 2.0.2 ([d3212aa](https://github.com/first-fluke/oh-my-agent/commit/d3212aa7fb9722e15631e57cc14333cd0d45dd78))
* **main:** release cli 2.0.2 ([a0f216e](https://github.com/first-fluke/oh-my-agent/commit/a0f216ebcb4448cd13876bf8d70b551341bcff3f))
* **main:** release cli 2.0.3 ([ddd790c](https://github.com/first-fluke/oh-my-agent/commit/ddd790cf1157ea224244c16e56f87617cd437bd9))
* **main:** release cli 2.0.3 ([4443caa](https://github.com/first-fluke/oh-my-agent/commit/4443caac6d5a250ba94975ac208f834ef987f4d1))
* **main:** release cli 2.0.4 ([3e4f4da](https://github.com/first-fluke/oh-my-agent/commit/3e4f4da1ca3c8d6f3c40fcbdffd8e7fa39f0151b))
* **main:** release cli 2.0.4 ([0ba46e5](https://github.com/first-fluke/oh-my-agent/commit/0ba46e553e35c2ae12294fbc67eb3c2b13c5ba61))
* **main:** release cli 2.0.5 ([3e15557](https://github.com/first-fluke/oh-my-agent/commit/3e1555781e71866cdae059903e638fea2bc184bd))
* **main:** release cli 2.0.5 ([943ef94](https://github.com/first-fluke/oh-my-agent/commit/943ef94ccd08979cdaa63fbab1a9f3be0d26b09b))
* **main:** release cli 2.0.6 ([90ba21a](https://github.com/first-fluke/oh-my-agent/commit/90ba21a240169ae11b37ae4463adcd235bd10be8))
* **main:** release cli 2.0.6 ([5267789](https://github.com/first-fluke/oh-my-agent/commit/5267789f0a5111258af35189fce82e621ff3dbdc))
* **main:** release cli 2.0.7 ([552cfcb](https://github.com/first-fluke/oh-my-agent/commit/552cfcb94e4da9b65151e047c2ad3eb9969c9d5b))
* **main:** release cli 2.0.7 ([a80ff8d](https://github.com/first-fluke/oh-my-agent/commit/a80ff8db55e7462ae2d0715b8488f9c420ae9199))
* **main:** release cli 2.0.8 ([0eddc5a](https://github.com/first-fluke/oh-my-agent/commit/0eddc5aadc12bb46956b78d7b64af158c56712eb))
* **main:** release cli 2.0.8 ([80160f0](https://github.com/first-fluke/oh-my-agent/commit/80160f0f07c2af049e5411cd2f2e77056217f65a))
* **main:** release cli 2.1.0 ([4eb2214](https://github.com/first-fluke/oh-my-agent/commit/4eb221419df9e5c721e514e45d7c0adcbe70b001))
* **main:** release cli 2.1.0 ([de91ad1](https://github.com/first-fluke/oh-my-agent/commit/de91ad13d918f4ce162659b7f00e463e0d4e028c))
* **main:** release cli 2.1.1 ([de4a7c2](https://github.com/first-fluke/oh-my-agent/commit/de4a7c22cc9af4a2c09cdbc64137b52b4e34665b))
* **main:** release cli 2.2.0 ([28a9a54](https://github.com/first-fluke/oh-my-agent/commit/28a9a543536a624b712c0436bd5ee855212177b6))
* **main:** release oh-my-ag 1.10.0 ([dd8a73d](https://github.com/first-fluke/oh-my-agent/commit/dd8a73de5590421aae71f7298f7b055862c74535))
* **main:** release oh-my-ag 1.10.0 ([81d2357](https://github.com/first-fluke/oh-my-agent/commit/81d23579ac5ca46df294a07af62efd32cfdd2005))
* **main:** release oh-my-ag 1.11.0 ([b35d270](https://github.com/first-fluke/oh-my-agent/commit/b35d270d756306cba1b6f815fc867394c1509c73))
* **main:** release oh-my-ag 1.11.0 ([71429cd](https://github.com/first-fluke/oh-my-agent/commit/71429cde078b91fabf8f00110b6aa8cda588dd1f))
* **main:** release oh-my-ag 1.12.0 ([c26d4b6](https://github.com/first-fluke/oh-my-agent/commit/c26d4b6e49dbddfbea6780ab10c88d67aabb7b3e))
* **main:** release oh-my-ag 1.12.0 ([1bb22ed](https://github.com/first-fluke/oh-my-agent/commit/1bb22ed5cdc94a8fcfba3e6bbe5b2f6cd074e438))
* **main:** release oh-my-ag 1.12.1 ([9e176e1](https://github.com/first-fluke/oh-my-agent/commit/9e176e10c35e02317e425379fa5356d8f9c1840a))
* **main:** release oh-my-ag 1.12.1 ([4a10feb](https://github.com/first-fluke/oh-my-agent/commit/4a10feb3330748b554152fbde123207fdc7bc3f7))
* **main:** release oh-my-ag 1.12.2 ([98cd3d4](https://github.com/first-fluke/oh-my-agent/commit/98cd3d43a5f1fd8275af5bfa1fff2bd41a9cb0a4))
* **main:** release oh-my-ag 1.12.2 ([5a2a1a8](https://github.com/first-fluke/oh-my-agent/commit/5a2a1a8fdc28e504dd2f3e0689487fc0be4665ad))
* **main:** release oh-my-ag 1.13.0 ([1c6e284](https://github.com/first-fluke/oh-my-agent/commit/1c6e284c612192c7c9a30d9943925773e18b0e9b))
* **main:** release oh-my-ag 1.13.0 ([de28391](https://github.com/first-fluke/oh-my-agent/commit/de28391259075fd832f3c8c6fb914c4991f2fb0f))
* **main:** release oh-my-ag 1.13.1 ([55d411e](https://github.com/first-fluke/oh-my-agent/commit/55d411ec93ca5cdfd6ef44ebe10c9e8bb9ab3e53))
* **main:** release oh-my-ag 1.13.1 ([20d7dc2](https://github.com/first-fluke/oh-my-agent/commit/20d7dc2f2b7baf9358ec0e86bb3068eee4cf867a))
* **main:** release oh-my-ag 1.13.2 ([6d66704](https://github.com/first-fluke/oh-my-agent/commit/6d667045a88d80202591c4649848bbd75aace6c2))
* **main:** release oh-my-ag 1.13.2 ([d0aef60](https://github.com/first-fluke/oh-my-agent/commit/d0aef602d99a25e33a7c92aec7e88298f4d22686))
* **main:** release oh-my-ag 1.14.0 ([5168de7](https://github.com/first-fluke/oh-my-agent/commit/5168de7c8d56670c8c4ac04a4a69ddc4d87638ed))
* **main:** release oh-my-ag 1.14.0 ([84e37b8](https://github.com/first-fluke/oh-my-agent/commit/84e37b87ded38fe9105a88bfbc49b47b4e52b5a6))
* **main:** release oh-my-ag 1.14.1 ([96ac21c](https://github.com/first-fluke/oh-my-agent/commit/96ac21c7e944ff224ac0b2435e153ea23334b75b))
* **main:** release oh-my-ag 1.14.1 ([d034fb9](https://github.com/first-fluke/oh-my-agent/commit/d034fb9d0be0363fbb1179725945f8569b1d09a7))
* **main:** release oh-my-ag 1.2.0 ([2c8527b](https://github.com/first-fluke/oh-my-agent/commit/2c8527b345ff9064f433c4e86f6c5cde449636c3))
* **main:** release oh-my-ag 1.2.0 ([dfbd788](https://github.com/first-fluke/oh-my-agent/commit/dfbd788387dc0e6782bbc99b2151da2bed3ee5b9))
* **main:** release oh-my-ag 1.3.0 ([92f2c11](https://github.com/first-fluke/oh-my-agent/commit/92f2c11d5438a91b6fdd33e7de2c437a9d5967d9))
* **main:** release oh-my-ag 1.3.0 ([8b65477](https://github.com/first-fluke/oh-my-agent/commit/8b65477484e8c92ccd696484672cd88b80fa0a37))
* **main:** release oh-my-ag 1.3.1 ([593b603](https://github.com/first-fluke/oh-my-agent/commit/593b603f0a1f7e7381a3eb06b2e3a515ab9084ad))
* **main:** release oh-my-ag 1.3.1 ([1c50124](https://github.com/first-fluke/oh-my-agent/commit/1c501244e5d4f809d2e754d3ee9b8e4101bb36a5))
* **main:** release oh-my-ag 1.4.0 ([6d031b6](https://github.com/first-fluke/oh-my-agent/commit/6d031b6ae13528ad5bc0431786e47815aedd4e15))
* **main:** release oh-my-ag 1.4.0 ([b940808](https://github.com/first-fluke/oh-my-agent/commit/b940808a34730829f6e108588b71f8fe4244b99a))
* **main:** release oh-my-ag 1.4.1 ([f25b54a](https://github.com/first-fluke/oh-my-agent/commit/f25b54a877dc93398c1dfce3e4616a0057838ab1))
* **main:** release oh-my-ag 1.4.1 ([d3ba0c5](https://github.com/first-fluke/oh-my-agent/commit/d3ba0c50e525dafa2533fe41e3fa3a97883bb320))
* **main:** release oh-my-ag 1.5.0 ([95f4fa2](https://github.com/first-fluke/oh-my-agent/commit/95f4fa23e7abf2f47e2572d62c71e21419b7738e))
* **main:** release oh-my-ag 1.5.0 ([8067bce](https://github.com/first-fluke/oh-my-agent/commit/8067bcec1c17e2ea2b9c438c3181bbca407b4c15))
* **main:** release oh-my-ag 1.5.1 ([8bd7556](https://github.com/first-fluke/oh-my-agent/commit/8bd7556efc79b9a05c903a2326f46a84876da5da))
* **main:** release oh-my-ag 1.5.1 ([021a6ba](https://github.com/first-fluke/oh-my-agent/commit/021a6baf9b4cbc34e967efdd82eeac359d82fc10))
* **main:** release oh-my-ag 1.5.2 ([b978b43](https://github.com/first-fluke/oh-my-agent/commit/b978b430898fb4b00486753d1bf0879911faa778))
* **main:** release oh-my-ag 1.5.2 ([19dbd34](https://github.com/first-fluke/oh-my-agent/commit/19dbd3460e484c60d6ffd10eec2fb60fb89f9d6a))
* **main:** release oh-my-ag 1.5.3 ([37afca7](https://github.com/first-fluke/oh-my-agent/commit/37afca77023eb3480ab8ba81649c382f9d76141b))
* **main:** release oh-my-ag 1.5.3 ([ef02aab](https://github.com/first-fluke/oh-my-agent/commit/ef02aaba702210ea910afce9bf697bf84fb7b7de))
* **main:** release oh-my-ag 1.5.4 ([77e9fcb](https://github.com/first-fluke/oh-my-agent/commit/77e9fcb8763295a5a7a27f3044ec2bc5f4d7269d))
* **main:** release oh-my-ag 1.5.4 ([1b204c3](https://github.com/first-fluke/oh-my-agent/commit/1b204c347c008275f268b4ec7e1c7b39a06cd1de))
* **main:** release oh-my-ag 1.5.5 ([0228cd2](https://github.com/first-fluke/oh-my-agent/commit/0228cd2edcdfef1736416afd48650c05dcafaad6))
* **main:** release oh-my-ag 1.5.5 ([1325790](https://github.com/first-fluke/oh-my-agent/commit/13257902e733c20ec663b1335bf45c3952ce79ba))
* **main:** release oh-my-ag 1.5.6 ([066f6a6](https://github.com/first-fluke/oh-my-agent/commit/066f6a60abe2351fd9f81f113487f823c8eff270))
* **main:** release oh-my-ag 1.5.6 ([7c3f233](https://github.com/first-fluke/oh-my-agent/commit/7c3f2334fb3b62cf52cc62b96af93f517ca4a640))
* **main:** release oh-my-ag 1.5.7 ([d9ec0d7](https://github.com/first-fluke/oh-my-agent/commit/d9ec0d7a771b9a9a4f8ad78298593a110ef5c199))
* **main:** release oh-my-ag 1.5.7 ([9cb2896](https://github.com/first-fluke/oh-my-agent/commit/9cb2896de2c965c7ae669db70cb40dfb6c367db8))
* **main:** release oh-my-ag 1.5.8 ([49f4c11](https://github.com/first-fluke/oh-my-agent/commit/49f4c11de11b0a8a6180891f6964b44957dc808d))
* **main:** release oh-my-ag 1.5.8 ([ab104a8](https://github.com/first-fluke/oh-my-agent/commit/ab104a8ecf82d4acbac57e71d360d2ef09fa21b2))
* **main:** release oh-my-ag 1.6.0 ([81ba3a2](https://github.com/first-fluke/oh-my-agent/commit/81ba3a2ea5f38766b4fec3a4eec1a887b91320b5))
* **main:** release oh-my-ag 1.6.1 ([2372a60](https://github.com/first-fluke/oh-my-agent/commit/2372a602e8ae06cc5755ced1fcd951c4ac1dd224))
* **main:** release oh-my-ag 1.6.1 ([cdd7514](https://github.com/first-fluke/oh-my-agent/commit/cdd7514d2843098bfb94d44d9b37f028baa7c8a3))
* **main:** release oh-my-ag 1.7.0 ([8cbee52](https://github.com/first-fluke/oh-my-agent/commit/8cbee52f713fa5e1226eeccc1a9c0e760e18326d))
* **main:** release oh-my-ag 1.7.0 ([e14882d](https://github.com/first-fluke/oh-my-agent/commit/e14882d0a70e9e03cace84aa1cb7b42c59a266e2))
* **main:** release oh-my-ag 1.7.1 ([37e09ad](https://github.com/first-fluke/oh-my-agent/commit/37e09adbd09316bc96232e010ae8706bc8cca9f8))
* **main:** release oh-my-ag 1.7.1 ([0c1b457](https://github.com/first-fluke/oh-my-agent/commit/0c1b457f604f914df8de62bd5a09659f1b4dc3fd))
* **main:** release oh-my-ag 1.8.0 ([23a7d82](https://github.com/first-fluke/oh-my-agent/commit/23a7d82090cb9a48181e3b87571511c00b6649e8))
* **main:** release oh-my-ag 1.8.0 ([857fb96](https://github.com/first-fluke/oh-my-agent/commit/857fb967917c803686274cd014c6d9a9e9c41423))
* **main:** release oh-my-ag 1.8.1 ([04549d0](https://github.com/first-fluke/oh-my-agent/commit/04549d0d4430970c4f87773e80077b7f02a1915f))
* **main:** release oh-my-ag 1.8.1 ([2404946](https://github.com/first-fluke/oh-my-agent/commit/240494688adf465efe5606e6dd71bbc2837dbaa8))
* **main:** release oh-my-ag 1.9.0 ([726b3d2](https://github.com/first-fluke/oh-my-agent/commit/726b3d2aa6f113766627bbd237e701d8f19b92f7))
* **main:** release oh-my-ag 1.9.0 ([e9e3c38](https://github.com/first-fluke/oh-my-agent/commit/e9e3c38c58651c748377f7084b7a42f1e65a15a0))
* **main:** release oh-my-ag 1.9.1 ([9780951](https://github.com/first-fluke/oh-my-agent/commit/9780951dcf6d30db08f2f31d125e58eac63bb86b))
* **main:** release oh-my-ag 1.9.1 ([9177088](https://github.com/first-fluke/oh-my-agent/commit/9177088b5a296cc0c8ea86acb255572c0b06f49f))
* **main:** release oh-my-ag 1.9.2 ([90dc21a](https://github.com/first-fluke/oh-my-agent/commit/90dc21a235b8c436b0439f8b58c231480d2e8abb))
* **main:** release oh-my-ag 1.9.2 ([ed30f4e](https://github.com/first-fluke/oh-my-agent/commit/ed30f4e4797db515e6bc29b2ce1aed05964b16f1))
* **main:** release oh-my-ag 1.9.3 ([849af8c](https://github.com/first-fluke/oh-my-agent/commit/849af8c57245861ecaf773bdca3c67b228e044fc))
* **main:** release oh-my-antigravity 1.1.0 ([198eb06](https://github.com/first-fluke/oh-my-agent/commit/198eb0639722dfbe39decae30d35774bca40c9cc))
* **main:** release oh-my-antigravity 1.1.0 ([1099bf6](https://github.com/first-fluke/oh-my-agent/commit/1099bf6fee38e841b289256529097427a6a4465c))
* **main:** release oh-my-antigravity 1.1.1 ([22b0e1e](https://github.com/first-fluke/oh-my-agent/commit/22b0e1e11c1b5167013021be712bdecc254e0237))
* **main:** release oh-my-antigravity 1.1.1 ([680776b](https://github.com/first-fluke/oh-my-agent/commit/680776ba67f7d3d62cc784985625d0895f9c6cfe))
* **main:** release web 0.1.1 ([5201765](https://github.com/first-fluke/oh-my-agent/commit/5201765eaec1249efcd6345ee031bfd64593bca6))
* **main:** release web 0.1.1 ([b09ebf9](https://github.com/first-fluke/oh-my-agent/commit/b09ebf924699c44b429bfde4b890f7b505cc3a40))
* **main:** release web 0.1.2 ([935ec9a](https://github.com/first-fluke/oh-my-agent/commit/935ec9ac036a35f503689cb644268196646e0f39))
* **main:** release web 0.1.2 ([a873b46](https://github.com/first-fluke/oh-my-agent/commit/a873b468f6d4e29e757e304ab567f17ea82d3a8d))
* **main:** release web 0.1.3 ([6ce48ea](https://github.com/first-fluke/oh-my-agent/commit/6ce48eaa0c633f68317f9b69f93bdc988c457a88))
* **main:** release web 0.1.3 ([13caa49](https://github.com/first-fluke/oh-my-agent/commit/13caa4902b387e713465f484039326f5ce8fcd6a))
* **main:** release web 0.1.4 ([6208978](https://github.com/first-fluke/oh-my-agent/commit/6208978eb301a9eeb975ffe6eafef0b42560c285))
* **main:** release web 0.1.4 ([9015c8b](https://github.com/first-fluke/oh-my-agent/commit/9015c8b35b23364c735377dfa6a5b7e06d50d55d))
* **main:** release web 0.1.5 ([7bbb64b](https://github.com/first-fluke/oh-my-agent/commit/7bbb64baa612c8e774ddbce1ad88e183a579178b))
* **main:** release web 0.1.5 ([96299c8](https://github.com/first-fluke/oh-my-agent/commit/96299c884447d05000062923eee35893e626f0f3))
* **main:** release web 0.1.6 ([4a1594c](https://github.com/first-fluke/oh-my-agent/commit/4a1594c198b576660d26f4a7cd3b1aa20440b483))
* **main:** release web 0.1.6 ([9274d5e](https://github.com/first-fluke/oh-my-agent/commit/9274d5ebe053cbda4a5535634157f9d9a5e09a2d))
* **main:** release web 0.1.7 ([9fb3b98](https://github.com/first-fluke/oh-my-agent/commit/9fb3b98f872b79c6a61b126c3f4de1df81fd0553))
* **main:** release web 0.1.7 ([5890f76](https://github.com/first-fluke/oh-my-agent/commit/5890f76c7d1a838f7eac57682d7ca14e84c997ee))
* **main:** release web 0.1.8 ([3df6769](https://github.com/first-fluke/oh-my-agent/commit/3df6769caaa186262f53f1fe7096c280aefa747a))
* **main:** release web 0.1.8 ([64cf06e](https://github.com/first-fluke/oh-my-agent/commit/64cf06ee442c59d85d383cbb690d1f07ef809f57))
* **main:** release web 0.1.9 ([9016b3d](https://github.com/first-fluke/oh-my-agent/commit/9016b3dc719e763a2ac8d3880ddc1080ebd1d276))
* **main:** release web 0.1.9 ([428e6b2](https://github.com/first-fluke/oh-my-agent/commit/428e6b2ae3cc294a6131167eebdde0b7b41d0527))
* **main:** release web 0.2.0 ([5609d11](https://github.com/first-fluke/oh-my-agent/commit/5609d11ed3b19d82cdca9d328e61ff1a1db8d27f))
* **main:** release web 0.2.0 ([d1cc988](https://github.com/first-fluke/oh-my-agent/commit/d1cc988288361588e04846f6c470fb601efe4536))
* **main:** release web 0.2.1 ([43b65bd](https://github.com/first-fluke/oh-my-agent/commit/43b65bd5bf0201d383cfb2bbc98f7b5c8c15ec42))
* **main:** release web 0.2.1 ([f9fd4b2](https://github.com/first-fluke/oh-my-agent/commit/f9fd4b23fefe9adf5c475ef5d22a706f33192ecb))
* **main:** release web 0.2.2 ([a24121d](https://github.com/first-fluke/oh-my-agent/commit/a24121dfc8f4913ba73a914674826109afdc06e0))
* **main:** release web 0.2.2 ([821d1bb](https://github.com/first-fluke/oh-my-agent/commit/821d1bb7bd9953237be4d5e59def00f3207d6d0f))
* **main:** release web 0.2.3 ([a36c653](https://github.com/first-fluke/oh-my-agent/commit/a36c653b2a58891da0582ea8a7f2ec767daca722))
* **main:** release web 0.2.3 ([d13385f](https://github.com/first-fluke/oh-my-agent/commit/d13385f2df7936fb86df1115cf4493c4aec27023))
* push remaining local updates ([cb80127](https://github.com/first-fluke/oh-my-agent/commit/cb80127fae0a99c68f70ee500d087ec428e01cf6))
* rebuild CLI after protocol updates ([24c314d](https://github.com/first-fluke/oh-my-agent/commit/24c314d6887f27834b72baa844520504804d3478))
* rebuild CLI and update lockfile ([efa2bd1](https://github.com/first-fluke/oh-my-agent/commit/efa2bd15bf2ba6f24cd9b84014a44eb3c0399e17))
* **release:** deprecate legacy npm package ([2b3ae4a](https://github.com/first-fluke/oh-my-agent/commit/2b3ae4a9451627af1e37312cef99919300f6f70b))
* **release:** publish legacy oh-my-ag package ([320edb2](https://github.com/first-fluke/oh-my-agent/commit/320edb26a0b8e649d3f47a972152d7bede35c1a6))
* remove bin/cli.js from git tracking ([0adcf85](https://github.com/first-fluke/oh-my-agent/commit/0adcf858bd6adb7c2cfb57b94a5645f4023f8388))
* remove legacy AGENT_GUIDE.md ([5ed2d24](https://github.com/first-fluke/oh-my-agent/commit/5ed2d24f4f829cff5bbbca355c9c9b4b693107fa))
* remove obsolete cleanup.sh script ([db1671d](https://github.com/first-fluke/oh-my-agent/commit/db1671dd2246998890972a35a6c80845be3dc628))
* rename project to mimic-skills ([eb5b174](https://github.com/first-fluke/oh-my-agent/commit/eb5b174ca759fd18f8a14ddfedae768dfe130f4e))
* rename project to oh-my-agent ([9d6edbf](https://github.com/first-fluke/oh-my-agent/commit/9d6edbf46e49e14df817f6a5baabfee7719690f2))
* rename to oh-my-antigravity (first-fluke org) ([cfd5661](https://github.com/first-fluke/oh-my-agent/commit/cfd5661cc70ac1786d39c45e1cf40e4f89d16281))
* **repo:** enforce conventional commits with husky ([0b5a852](https://github.com/first-fluke/oh-my-agent/commit/0b5a852cc4e3c619916ce4383ed6407c2d8566ec))
* revert sync-manifest trigger change ([b4f56fd](https://github.com/first-fluke/oh-my-agent/commit/b4f56fdc2833d238ba64b6339a25065b6b688c16))
* **serena:** configure project line endings ([fab928b](https://github.com/first-fluke/oh-my-agent/commit/fab928b634afab70453dfcca6b02010a76ee106b))
* sync prompt-manifest.json ([36d65bc](https://github.com/first-fluke/oh-my-agent/commit/36d65bc0e6121c3d5961fea3d0ffbdf6a0337a7a))
* sync prompt-manifest.json ([88983ff](https://github.com/first-fluke/oh-my-agent/commit/88983ffc8943afd64c766165419bfc730bd5b88d))
* sync prompt-manifest.json ([9d51af1](https://github.com/first-fluke/oh-my-agent/commit/9d51af154f70ed30751dab07784b5a926b04b473))
* sync prompt-manifest.json ([7fec362](https://github.com/first-fluke/oh-my-agent/commit/7fec362c7f200ddb47f98e81681a88dcdc8d7de9))
* sync prompt-manifest.json ([c652830](https://github.com/first-fluke/oh-my-agent/commit/c6528304bb43896662a9476b8ad609018718dce7))
* sync prompt-manifest.json ([8b9ca59](https://github.com/first-fluke/oh-my-agent/commit/8b9ca597c3b3b906a7cdc0854aaf591e8a4e20dc))
* sync prompt-manifest.json ([23d73a6](https://github.com/first-fluke/oh-my-agent/commit/23d73a64683ca207b7e6fe77090ae2ff9c5ebbc9))
* sync prompt-manifest.json ([3adacce](https://github.com/first-fluke/oh-my-agent/commit/3adacced034a247cedb0d4a49d8f854adb58a3af))
* sync prompt-manifest.json ([87b0e4d](https://github.com/first-fluke/oh-my-agent/commit/87b0e4d1b6c95cb6ca6e491a63133a8361ef7c3f))
* sync prompt-manifest.json ([22bc45c](https://github.com/first-fluke/oh-my-agent/commit/22bc45c0c944661044f38e51144f1cef46ec09ce))
* sync prompt-manifest.json ([e3db65d](https://github.com/first-fluke/oh-my-agent/commit/e3db65d410920aba196ba3242a3c39a1215e1c02))
* sync prompt-manifest.json ([43dc2b6](https://github.com/first-fluke/oh-my-agent/commit/43dc2b6b3ac922477acda6e32e7f0fd0e42d9f2b))
* sync prompt-manifest.json ([f04e473](https://github.com/first-fluke/oh-my-agent/commit/f04e473b951988f4e76f0ea7c346a6004d261abe))
* sync prompt-manifest.json ([7969a6f](https://github.com/first-fluke/oh-my-agent/commit/7969a6f4805cf1e043d3d45d21f909d413e378df))
* sync prompt-manifest.json ([c442789](https://github.com/first-fluke/oh-my-agent/commit/c442789f5850c77ce6f38d23105aadf982432b1c))
* sync prompt-manifest.json ([884fc20](https://github.com/first-fluke/oh-my-agent/commit/884fc20c3197ccbbdc1a32b5fdc3b6f6afe04bd0))
* sync prompt-manifest.json ([82f05bf](https://github.com/first-fluke/oh-my-agent/commit/82f05bf30c1fd5f93bcb1738253e910e8a900021))
* sync prompt-manifest.json ([9a6d09b](https://github.com/first-fluke/oh-my-agent/commit/9a6d09bcc669cff50eeb7bf5b8eac9003d0cdfd1))
* sync prompt-manifest.json ([c948fc4](https://github.com/first-fluke/oh-my-agent/commit/c948fc4b796eb3cb7407ce88f0e3c488e54fb4b7))
* sync prompt-manifest.json ([49b980d](https://github.com/first-fluke/oh-my-agent/commit/49b980d5738e909d5f9055e752102b504a3287ff))
* sync prompt-manifest.json ([ede04db](https://github.com/first-fluke/oh-my-agent/commit/ede04dbc5d35d818b365515b1226e66df7650c70))
* sync prompt-manifest.json ([8d4da84](https://github.com/first-fluke/oh-my-agent/commit/8d4da8432a0e404774df69450fa34f15f9dd12a3))
* sync prompt-manifest.json ([9a37ff8](https://github.com/first-fluke/oh-my-agent/commit/9a37ff8d1b8ab3f067d979aecb64802a26271992))
* sync prompt-manifest.json ([e8f6fe7](https://github.com/first-fluke/oh-my-agent/commit/e8f6fe7d38ff379f2c6d674f0aecfa5e25153963))
* sync prompt-manifest.json ([b0482a2](https://github.com/first-fluke/oh-my-agent/commit/b0482a2a14c3b3fbb980e787ee7846985107288a))
* sync prompt-manifest.json ([85438c5](https://github.com/first-fluke/oh-my-agent/commit/85438c5f906fb8d88b963d09afe5c80a8ffdfafa))
* sync prompt-manifest.json ([ad1ea2e](https://github.com/first-fluke/oh-my-agent/commit/ad1ea2ee05feecd148e6718d60e1eb7f631085ed))
* sync prompt-manifest.json ([7594fe0](https://github.com/first-fluke/oh-my-agent/commit/7594fe0c107a933eccb0580d73c5b838d705feb0))
* sync prompt-manifest.json ([a61ebf1](https://github.com/first-fluke/oh-my-agent/commit/a61ebf1f959123d4ee0d96e745d81bb2a07afce3))
* sync prompt-manifest.json ([cfec4a3](https://github.com/first-fluke/oh-my-agent/commit/cfec4a3984280076c7d4ca36d105435d13fa7c80))
* sync prompt-manifest.json ([70e7f06](https://github.com/first-fluke/oh-my-agent/commit/70e7f06a31f4395098158dee6a476f6fdc2aef44))
* sync prompt-manifest.json ([fed9622](https://github.com/first-fluke/oh-my-agent/commit/fed962217ddc7310d757de64a7aa53acb8d92667))
* sync versions to 1.21.1 and add _version.json to release-please ([d1ebd0d](https://github.com/first-fluke/oh-my-agent/commit/d1ebd0db3aeefe3016f89153eec6fa78c5f409ee))
* update `README.ko.md` ([0169671](https://github.com/first-fluke/oh-my-agent/commit/0169671faaae4296e63005438af5095aa63813c0))
* update CLI hints to show shared directories ([c0e78a2](https://github.com/first-fluke/oh-my-agent/commit/c0e78a221ab1a297affb9c91a9690efbf5978360))
* update prompt-manifest.json for 1.10.0 ([40badde](https://github.com/first-fluke/oh-my-agent/commit/40baddef05b50b4c74aa9b08215351d39b17e210))
* update prompt-manifest.json for 1.11.0 ([4f12317](https://github.com/first-fluke/oh-my-agent/commit/4f12317e5a11575aa87b25774794282af71f04e6))
* update prompt-manifest.json for 1.12.0 ([0473580](https://github.com/first-fluke/oh-my-agent/commit/04735801f9df955c32fafbeb6497b3e28076f02a))
* update prompt-manifest.json for 1.12.1 ([0fcfae4](https://github.com/first-fluke/oh-my-agent/commit/0fcfae4ddaf48c555d08fef9e4fcdc749e461bbc))
* update prompt-manifest.json for 1.12.2 ([583ddb0](https://github.com/first-fluke/oh-my-agent/commit/583ddb0f46ea79500b51a81138eb0fe015e30c8e))
* update prompt-manifest.json for 1.13.0 ([cd4025a](https://github.com/first-fluke/oh-my-agent/commit/cd4025aca6e7b1f0579539066087332ed74a609d))
* update prompt-manifest.json for 1.13.1 ([bfd0f72](https://github.com/first-fluke/oh-my-agent/commit/bfd0f72dd621cd8580be16819f520399bdabd091))
* update prompt-manifest.json for 1.13.2 ([e53b402](https://github.com/first-fluke/oh-my-agent/commit/e53b4027f990b6979efc6c3050c6529fb6d0cec5))
* update prompt-manifest.json for 1.14.0 ([aa7b105](https://github.com/first-fluke/oh-my-agent/commit/aa7b105e188956594c00b7c0641e2b12e78c2b54))
* update prompt-manifest.json for 1.14.1 ([cbd307f](https://github.com/first-fluke/oh-my-agent/commit/cbd307f2b439dc5706fd8ca954f17c1d0051a8f4))
* update prompt-manifest.json for 1.15.0 ([749326f](https://github.com/first-fluke/oh-my-agent/commit/749326f0f5383fbdeb6a448e08c0f1c526405103))
* update prompt-manifest.json for 1.16.0 ([341c679](https://github.com/first-fluke/oh-my-agent/commit/341c679d289683c17e28ab1a519fc7d01cf37936))
* update prompt-manifest.json for 1.17.0 ([7c6f9c0](https://github.com/first-fluke/oh-my-agent/commit/7c6f9c0ec14499571e3c6f3cfbf596e4117fde00))
* update prompt-manifest.json for 1.18.0 ([591bb5d](https://github.com/first-fluke/oh-my-agent/commit/591bb5d4b33bf79d2c5e0e0cd2867af86a907f03))
* update prompt-manifest.json for 1.19.0 ([a6e527e](https://github.com/first-fluke/oh-my-agent/commit/a6e527e53df40e8031654b4f72220db1f7057c97))
* update prompt-manifest.json for 1.20.0 ([0a0e686](https://github.com/first-fluke/oh-my-agent/commit/0a0e686aadeca6369bd563c4014d1f3205dc571c))
* update prompt-manifest.json for 1.20.1 ([810194c](https://github.com/first-fluke/oh-my-agent/commit/810194c8e033903fb84ac0f9fd975b5afa72d03f))
* update prompt-manifest.json for 1.21.0 ([f17f4b0](https://github.com/first-fluke/oh-my-agent/commit/f17f4b0ecb7e8af74feb7764f8d5a6abdcad1f24))
* update prompt-manifest.json for 1.5.4 ([3c01a32](https://github.com/first-fluke/oh-my-agent/commit/3c01a32ff87a3fd6bd5dbb14600ecfbee222d80e))
* update prompt-manifest.json for 1.5.5 ([1c89026](https://github.com/first-fluke/oh-my-agent/commit/1c8902637830de9086a5b4e7109be66ffa85e914))
* update prompt-manifest.json for 1.5.6 ([02aee6e](https://github.com/first-fluke/oh-my-agent/commit/02aee6e14f21a0f1baef3146ef7e9fd3ff33a243))
* update prompt-manifest.json for 1.5.7 ([beed26c](https://github.com/first-fluke/oh-my-agent/commit/beed26c56adcc5f7b4630e8bdd5bd4fa3592c1f1))
* update prompt-manifest.json for 1.5.8 ([2d1d3b1](https://github.com/first-fluke/oh-my-agent/commit/2d1d3b149538758ec84cc6dc1059304f6fccba98))
* update prompt-manifest.json for 1.6.0 ([183436f](https://github.com/first-fluke/oh-my-agent/commit/183436fc1b8c2505d74d5335987f6e8cc0cc2553))
* update prompt-manifest.json for 1.6.1 ([bada43d](https://github.com/first-fluke/oh-my-agent/commit/bada43d5066a67a508b3bf79e780a7049fe658be))
* update prompt-manifest.json for 1.7.0 ([eec2bb9](https://github.com/first-fluke/oh-my-agent/commit/eec2bb9e75be44b794426931422a2874296aae6b))
* update prompt-manifest.json for 1.7.1 ([b7ac12e](https://github.com/first-fluke/oh-my-agent/commit/b7ac12ed3e0a4904094ad0e06bbb4e71d631d799))
* update prompt-manifest.json for 1.8.0 ([897a476](https://github.com/first-fluke/oh-my-agent/commit/897a476e803daaabf6279f5ecf2e52ec98b075a2))
* update prompt-manifest.json for 1.8.1 ([f3d6ca7](https://github.com/first-fluke/oh-my-agent/commit/f3d6ca71a78fb6185dcd1e0c54e61ec3b74d2c08))
* update prompt-manifest.json for 1.9.0 ([0db8e78](https://github.com/first-fluke/oh-my-agent/commit/0db8e78e91d476b6b05b075b7c1cf9d355241d32))
* update prompt-manifest.json for 1.9.1 ([b8a2d71](https://github.com/first-fluke/oh-my-agent/commit/b8a2d719e328edcf95bd122df0b05f22047aee18))
* update prompt-manifest.json for 1.9.2 ([b01ebbb](https://github.com/first-fluke/oh-my-agent/commit/b01ebbbcd4c83a67ffc544cfd2ed9944b0d8b04d))
* update prompt-manifest.json for 1.9.3 ([8cbe854](https://github.com/first-fluke/oh-my-agent/commit/8cbe8544e8570eadc9db61f8a1dedae1214af313))
* update release-please manifest to cli 1.24.0 and web 0.1.7 ([ae3a478](https://github.com/first-fluke/oh-my-agent/commit/ae3a47801e1785ab0db509e3447e34d151424daa))
* version sync 1.23.0 ([6d09e9a](https://github.com/first-fluke/oh-my-agent/commit/6d09e9ab5dd4209c4e957210da0b511f2c943a58))

## [2.2.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.1.0...cli-v2.2.0) (2026-03-13)


### Features

* **cli:** add DevOps preset to install wizard ([e428529](https://github.com/first-fluke/oh-my-agent/commit/e428529010aca69be8d08796afc7b328d747042d))


### Miscellaneous

* sync prompt-manifest.json ([88983ff](https://github.com/first-fluke/oh-my-agent/commit/88983ffc8943afd64c766165419bfc730bd5b88d))

## [2.1.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.8...cli-v2.1.0) (2026-03-13)


### Features

* **cli:** restore Claude Code and GitHub Copilot symlink prompt during install ([db93945](https://github.com/first-fluke/oh-my-agent/commit/db93945aa337dae1874ca7de91831720ee4f95b8))
* **cli:** show contextual support message based on star status ([42d7b19](https://github.com/first-fluke/oh-my-agent/commit/42d7b198bc1519ef523d7fa4a1d1d9d7e95497fb))


### Miscellaneous

* sync prompt-manifest.json ([9d51af1](https://github.com/first-fluke/oh-my-agent/commit/9d51af154f70ed30751dab07784b5a926b04b473))

## [2.0.8](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.7...cli-v2.0.8) (2026-03-13)


### Documentation

* add Antigravity as first AI IDE in README files ([80b1099](https://github.com/first-fluke/oh-my-agent/commit/80b1099bbf597b5a2506e6e97c1d22b265cb6ab8))


### Miscellaneous

* sync prompt-manifest.json ([7fec362](https://github.com/first-fluke/oh-my-agent/commit/7fec362c7f200ddb47f98e81681a88dcdc8d7de9))

## [2.0.7](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.6...cli-v2.0.7) (2026-03-13)


### Refactoring

* vendor-agnostic execution protocol injection ([61fc225](https://github.com/first-fluke/oh-my-agent/commit/61fc2259ec0c5294db9c994ef266d745e722bbbe))


### Miscellaneous

* sync prompt-manifest.json ([8b9ca59](https://github.com/first-fluke/oh-my-agent/commit/8b9ca597c3b3b906a7cdc0854aaf591e8a4e20dc))

## [2.0.6](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.5...cli-v2.0.6) (2026-03-13)


### Miscellaneous

* **release:** deprecate legacy npm package ([2b3ae4a](https://github.com/first-fluke/oh-my-agent/commit/2b3ae4a9451627af1e37312cef99919300f6f70b))
* sync prompt-manifest.json ([23d73a6](https://github.com/first-fluke/oh-my-agent/commit/23d73a64683ca207b7e6fe77090ae2ff9c5ebbc9))

## [2.0.5](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.4...cli-v2.0.5) (2026-03-13)


### Bug Fixes

* **release:** remove legacy publish lifecycle scripts ([26ac606](https://github.com/first-fluke/oh-my-agent/commit/26ac6061e7b37c8c3e6b021fe270b99fbd38553e))


### Miscellaneous

* sync prompt-manifest.json ([3adacce](https://github.com/first-fluke/oh-my-agent/commit/3adacced034a247cedb0d4a49d8f854adb58a3af))

## [2.0.4](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.3...cli-v2.0.4) (2026-03-13)


### Bug Fixes

* **release:** allow legacy publish without license file ([6c69839](https://github.com/first-fluke/oh-my-agent/commit/6c698394b23327bbc7bcff24076d5cc4d4440fcb))


### Miscellaneous

* sync prompt-manifest.json ([87b0e4d](https://github.com/first-fluke/oh-my-agent/commit/87b0e4d1b6c95cb6ca6e491a63133a8361ef7c3f))

## [2.0.3](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.2...cli-v2.0.3) (2026-03-13)


### Documentation

* update Claude CLI installation command to official bash script ([2e5e6aa](https://github.com/first-fluke/oh-my-agent/commit/2e5e6aa1ce2ced32c00a94346182ae6ae1af6aa3))


### Miscellaneous

* **main:** release web 0.2.3 ([a36c653](https://github.com/first-fluke/oh-my-agent/commit/a36c653b2a58891da0582ea8a7f2ec767daca722))
* **main:** release web 0.2.3 ([d13385f](https://github.com/first-fluke/oh-my-agent/commit/d13385f2df7936fb86df1115cf4493c4aec27023))
* **release:** publish legacy oh-my-ag package ([320edb2](https://github.com/first-fluke/oh-my-agent/commit/320edb26a0b8e649d3f47a972152d7bede35c1a6))
* sync prompt-manifest.json ([22bc45c](https://github.com/first-fluke/oh-my-agent/commit/22bc45c0c944661044f38e51144f1cef46ec09ce))

## [2.0.2](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.1...cli-v2.0.2) (2026-03-13)


### Bug Fixes

* **ci:** refine release-please publish flow ([1c98953](https://github.com/first-fluke/oh-my-agent/commit/1c989531d7df063bc216634e37871d4c9e05fa24))
* **deps:** sync bun lockfile metadata ([d46dff4](https://github.com/first-fluke/oh-my-agent/commit/d46dff44cbacbf98f93d5aeb0aec34ad5d8e6294))


### Documentation

* update usage command references to usage:anti in CHANGELOG ([d739d2c](https://github.com/first-fluke/oh-my-agent/commit/d739d2cf07bac097cfefdc8e939bb025ebb7599b))
* update usage command to usage:anti across all documentation ([c696920](https://github.com/first-fluke/oh-my-agent/commit/c6969203005ce46eae40d5a3fd0ccea77c0cba84))


### Miscellaneous

* **main:** release web 0.2.2 ([a24121d](https://github.com/first-fluke/oh-my-agent/commit/a24121dfc8f4913ba73a914674826109afdc06e0))
* **main:** release web 0.2.2 ([821d1bb](https://github.com/first-fluke/oh-my-agent/commit/821d1bb7bd9953237be4d5e59def00f3207d6d0f))
* sync prompt-manifest.json ([e3db65d](https://github.com/first-fluke/oh-my-agent/commit/e3db65d410920aba196ba3242a3c39a1215e1c02))
* sync prompt-manifest.json ([43dc2b6](https://github.com/first-fluke/oh-my-agent/commit/43dc2b6b3ac922477acda6e32e7f0fd0e42d9f2b))

## [2.0.1](https://github.com/first-fluke/oh-my-agent/compare/cli-v2.0.0...cli-v2.0.1) (2026-03-13)


### Miscellaneous

* **main:** release web 0.2.1 ([43b65bd](https://github.com/first-fluke/oh-my-agent/commit/43b65bd5bf0201d383cfb2bbc98f7b5c8c15ec42))
* **main:** release web 0.2.1 ([f9fd4b2](https://github.com/first-fluke/oh-my-agent/commit/f9fd4b23fefe9adf5c475ef5d22a706f33192ecb))
* rename project to oh-my-agent ([9d6edbf](https://github.com/first-fluke/oh-my-agent/commit/9d6edbf46e49e14df817f6a5baabfee7719690f2))
* sync prompt-manifest.json ([f04e473](https://github.com/first-fluke/oh-my-agent/commit/f04e473b951988f4e76f0ea7c346a6004d261abe))
* sync prompt-manifest.json ([7969a6f](https://github.com/first-fluke/oh-my-agent/commit/7969a6f4805cf1e043d3d45d21f909d413e378df))

## [2.0.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.29.0...cli-v2.0.0) (2026-03-13)


### ⚠ BREAKING CHANGES

* .agents/ replaces .agent/ as the canonical root directory. Cursor and Antigravity now natively support .agents/, so legacy symlinks (.cursor/skills/, .claude/skills/, .github/skills/) are no longer needed.

### Features

* adopt .agents/ as canonical root with auto-migration ([a2ade10](https://github.com/first-fluke/oh-my-agent/commit/a2ade10bb92be61d2d8f4b433b9f00481a900c56))
* **cli:** add oma command alias ([c7a8a6b](https://github.com/first-fluke/oh-my-agent/commit/c7a8a6b7fd1bdd83b4db64e339bf0ce48a13e746))
* **skills:** apply harness engineering patterns ([f73405a](https://github.com/first-fluke/oh-my-agent/commit/f73405a184aee8a3745154a5df9b242baf8d7d15))


### Bug Fixes

* correct manifest version lookup for release-please key change ([aab419f](https://github.com/first-fluke/oh-my-agent/commit/aab419f07dd21103681e864189cf56d7bb74a964))
* correct release-please extra file paths ([ae0da99](https://github.com/first-fluke/oh-my-agent/commit/ae0da997514a5e727028ccf17c7be070adf64b0c))
* route all non-web commits to cli release ([26c4753](https://github.com/first-fluke/oh-my-agent/commit/26c4753204e62ba950ed8f8f57a5cc71e8db31fe))


### Refactoring

* rename .agent/ to .agents/ as canonical root ([ca3ca3f](https://github.com/first-fluke/oh-my-agent/commit/ca3ca3f658ed3ead256dad96dc1196b92d8a81c6))
* **workflow:** redesign deepinit as harness initializer ([568f332](https://github.com/first-fluke/oh-my-agent/commit/568f3321d37672f8b7430a33ee6b2c9708de36dc))


### Miscellaneous

* **main:** release web 0.2.0 ([5609d11](https://github.com/first-fluke/oh-my-agent/commit/5609d11ed3b19d82cdca9d328e61ff1a1db8d27f))
* **main:** release web 0.2.0 ([d1cc988](https://github.com/first-fluke/oh-my-agent/commit/d1cc988288361588e04846f6c470fb601efe4536))
* sync prompt-manifest.json ([c442789](https://github.com/first-fluke/oh-my-agent/commit/c442789f5850c77ce6f38d23105aadf982432b1c))
* sync prompt-manifest.json ([884fc20](https://github.com/first-fluke/oh-my-agent/commit/884fc20c3197ccbbdc1a32b5fdc3b6f6afe04bd0))
* sync prompt-manifest.json ([82f05bf](https://github.com/first-fluke/oh-my-agent/commit/82f05bf30c1fd5f93bcb1738253e910e8a900021))

## [1.29.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.28.0...cli-v1.29.0) (2026-03-11)


### Features

* switch skills ssot to .agents ([c4b63a2](https://github.com/first-fluke/oh-my-agent/commit/c4b63a295e96aa471cf575495bc048cf0e3cda69))

## [1.28.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.27.0...cli-v1.28.0) (2026-03-11)


### Features

* **cli:** improve agent-facing ergonomics ([ca6661d](https://github.com/first-fluke/oh-my-agent/commit/ca6661d9e66f18868807b3f304ca59927b0af053))

## [1.27.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.26.2...cli-v1.27.0) (2026-03-08)


### Features

* **cli:** add star command for GitHub starring with gh CLI integration ([de28489](https://github.com/first-fluke/oh-my-agent/commit/de28489d3e8cdb185a307060061398148d2a3898))

## [1.26.2](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.26.1...cli-v1.26.2) (2026-03-08)


### Refactoring

* rename terraform-infra-engineer to tf-infra-agent ([3c03852](https://github.com/first-fluke/oh-my-agent/commit/3c03852ef473a5e307ce7d497e15d16bbf89b468))

## [1.26.1](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.26.0...cli-v1.26.1) (2026-03-08)


### Bug Fixes

* **cli:** correct release-please extra-files paths for root-level manifest ([ecd18f1](https://github.com/first-fluke/oh-my-agent/commit/ecd18f1d333f90d5fc19845fb52d104eeafc2b25))

## [1.26.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.25.1...cli-v1.26.0) (2026-03-08)


### Features

* add brainstorm skill for design-first ideation pipeline ([7fd31b8](https://github.com/first-fluke/oh-my-agent/commit/7fd31b8800046a51121d33ba0dc72e75f713db06))

## [1.25.1](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.25.0...cli-v1.25.1) (2026-03-04)


### Miscellaneous

* **cli:** bump package version to 1.25.1 ([3bcb4d4](https://github.com/first-fluke/oh-my-agent/commit/3bcb4d4bf09a5d8582b03e89fb7859299200dd06))
* **cli:** update dependencies to latest ([e73285a](https://github.com/first-fluke/oh-my-agent/commit/e73285a2aca442d4c596e2ddcc2b6541e0b210ef))

## [1.25.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.24.0...cli-v1.25.0) (2026-02-19)


### Features

* broaden dashboard file filtering to all markdown files and enhance activity name parsing by removing additional prefixes and suffixes ([513d0ec](https://github.com/first-fluke/oh-my-agent/commit/513d0ec8bc647b0311528f1c3156a3d42631f62a))

## [1.24.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.23.0...cli-v1.24.0) (2026-02-19)


### Features

* **cleanup:** add Gemini directory cleanup with -y flag ([061d193](https://github.com/first-fluke/oh-my-agent/commit/061d193b4f3b20eebf411ae3c190d75de37c6a7d))
* **cli:** add agent:parallel command to replace parallel-run.sh ([1527d6b](https://github.com/first-fluke/oh-my-agent/commit/1527d6b5619c98ba28fbe9a1ea9b7a3466085be2))
* **cli:** add Cursor (.cursor/skills/) support to install, update, doctor ([b699b29](https://github.com/first-fluke/oh-my-agent/commit/b699b299bc2e8e531223ae70db8798ea3881e7a0))
* **cli:** add help and version commands ([cdba845](https://github.com/first-fluke/oh-my-agent/commit/cdba84527627b859723a55d0add1431a0342db29))
* **cli:** add infrastructure skills category with terraform and mise support ([48cae1a](https://github.com/first-fluke/oh-my-agent/commit/48cae1aa3113608b99259b2d8397c80581c1d185))
* **cli:** add multi-CLI symlink support for skills ([dc29b6d](https://github.com/first-fluke/oh-my-agent/commit/dc29b6d23ae4a53aefbd0ac9a16a34437bc28ab6))
* **doctor:** add symlink validation for multi-CLI setup ([1d6fa4f](https://github.com/first-fluke/oh-my-agent/commit/1d6fa4fa51e39ba7beb20c964ce876397b218c6c))
* merge OpenCode/Amp/Codex options and add GitHub Copilot support ([b2e7fa1](https://github.com/first-fluke/oh-my-agent/commit/b2e7fa1d8e6f748cfdf92f351d8f5d72f81eded6))
* split cli/web workspaces and docs release flow ([5609032](https://github.com/first-fluke/oh-my-agent/commit/5609032bf657e4e4d71e0acaa2e319effcdf8a35))
* **update:** auto-update CLI symlinks when updating skills ([fe6a99c](https://github.com/first-fluke/oh-my-agent/commit/fe6a99c6a0ce49ad6355ba0a210271c31d944e30))


### Bug Fixes

* **cli:** fetch reference files during skill installation ([05be60d](https://github.com/first-fluke/oh-my-agent/commit/05be60d19c7738cdb914afc29e7f85dd42c3a294))
* **cli:** use SKILLS registry whitelist for symlink creation ([8f87501](https://github.com/first-fluke/oh-my-agent/commit/8f875015993a011316b4e018a4ae9979b5c518b8))
* OpenCode, Amp, Codex all use .agents/skills/ ([ed4f9bd](https://github.com/first-fluke/oh-my-agent/commit/ed4f9bdf688d69620af22bc27234b0f7f8b0182e))
* resolve user-preferences.yaml by walking up parent directories ([0d1d68b](https://github.com/first-fluke/oh-my-agent/commit/0d1d68b0bd2d6e4922f35005f34f770698f7bdac))
* update Codex skills path from .codex/skills to .agents/skills ([8c30a97](https://github.com/first-fluke/oh-my-agent/commit/8c30a97cbe29d7117aa13322b11acad011a1a03d))


### Refactoring

* rename references to resources and add dynamic file fetching ([7493587](https://github.com/first-fluke/oh-my-agent/commit/7493587fcaff96e9109ca5989932c6fb7b3c9ee2))
* **skills:** rename mise-devops-runner to developer-workflow ([7a34b46](https://github.com/first-fluke/oh-my-agent/commit/7a34b46c44b060afc08c1634e6b66bedb54a5035))


### Miscellaneous

* **main:** release cli 1.15.0 ([5deacf7](https://github.com/first-fluke/oh-my-agent/commit/5deacf780afe674d37f8f8064cbf4b16c9a1477e))
* **main:** release cli 1.15.0 ([1f23594](https://github.com/first-fluke/oh-my-agent/commit/1f23594723e81caf084ef2ae14ed6b41febb1c53))
* **main:** release cli 1.16.0 ([7130613](https://github.com/first-fluke/oh-my-agent/commit/71306130547405288acb1801c0c38ab31a1daf90))
* **main:** release cli 1.16.0 ([ccba318](https://github.com/first-fluke/oh-my-agent/commit/ccba318b0afeeb1e6a9b6a7e9aadeeaad324fa3f))
* **main:** release cli 1.17.0 ([1aefed4](https://github.com/first-fluke/oh-my-agent/commit/1aefed40880be3bceac390d1220833977a48a315))
* **main:** release cli 1.17.0 ([26c70b2](https://github.com/first-fluke/oh-my-agent/commit/26c70b262ac37e0d752d9610d0e29a643ee892c7))
* **main:** release cli 1.18.0 ([4226997](https://github.com/first-fluke/oh-my-agent/commit/4226997393e3dc02b26767a67027c16f564521eb))
* **main:** release cli 1.18.0 ([fec3d99](https://github.com/first-fluke/oh-my-agent/commit/fec3d99344e205945c86853c14a8a858c63f2937))
* **main:** release cli 1.19.0 ([7bde6b6](https://github.com/first-fluke/oh-my-agent/commit/7bde6b6cfcf056c86d37bc8e3b8398b00a8cf7b1))
* **main:** release cli 1.19.0 ([a5c0ce3](https://github.com/first-fluke/oh-my-agent/commit/a5c0ce31feb8c2d18a70fb24b84e3c04bf91a8f3))
* **main:** release cli 1.20.0 ([6eb44db](https://github.com/first-fluke/oh-my-agent/commit/6eb44dbb6e76a1290c6606dcf12d94a4453793d2))
* **main:** release cli 1.20.0 ([18109b2](https://github.com/first-fluke/oh-my-agent/commit/18109b22d8ac23ad1499ec42390c111912eebbc7))
* **main:** release cli 1.20.1 ([ef2c038](https://github.com/first-fluke/oh-my-agent/commit/ef2c03846271c392b7e578ad404415a459d0bae2))
* **main:** release cli 1.20.1 ([35eb769](https://github.com/first-fluke/oh-my-agent/commit/35eb769a556c34bfa4a5bbef2f56daec6c7ec997))
* **main:** release cli 1.21.0 ([cb2094f](https://github.com/first-fluke/oh-my-agent/commit/cb2094ff1fbeb6a57a6522375ee2db5141e0ecb5))
* **main:** release cli 1.21.0 ([306d85b](https://github.com/first-fluke/oh-my-agent/commit/306d85b67cc48e5319b26c911a746efaf7810d0d))
* **main:** release cli 1.21.1 ([511309d](https://github.com/first-fluke/oh-my-agent/commit/511309d3f69884ca85c4193678816d826efadb0c))
* **main:** release cli 1.21.1 ([cd453d6](https://github.com/first-fluke/oh-my-agent/commit/cd453d631f3232c3c1820239531100a693e92bf0))
* update CLI hints to show shared directories ([c0e78a2](https://github.com/first-fluke/oh-my-agent/commit/c0e78a221ab1a297affb9c91a9690efbf5978360))
* version sync 1.23.0 ([6d09e9a](https://github.com/first-fluke/oh-my-agent/commit/6d09e9ab5dd4209c4e957210da0b511f2c943a58))

## [1.21.1](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.21.0...cli-v1.21.1) (2026-02-15)


### Bug Fixes

* resolve user-preferences.yaml by walking up parent directories ([0d1d68b](https://github.com/first-fluke/oh-my-agent/commit/0d1d68b0bd2d6e4922f35005f34f770698f7bdac))

## [1.21.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.20.1...cli-v1.21.0) (2026-02-12)


### Features

* **cli:** add agent:parallel command to replace parallel-run.sh ([1527d6b](https://github.com/first-fluke/oh-my-agent/commit/1527d6b5619c98ba28fbe9a1ea9b7a3466085be2))

## [1.20.1](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.20.0...cli-v1.20.1) (2026-02-12)


### Bug Fixes

* **cli:** use SKILLS registry whitelist for symlink creation ([8f87501](https://github.com/first-fluke/oh-my-agent/commit/8f875015993a011316b4e018a4ae9979b5c518b8))

## [1.20.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.19.0...cli-v1.20.0) (2026-02-11)


### Features

* **cli:** add Cursor (.cursor/skills/) support to install, update, doctor ([b699b29](https://github.com/first-fluke/oh-my-agent/commit/b699b299bc2e8e531223ae70db8798ea3881e7a0))

## [1.19.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.18.0...cli-v1.19.0) (2026-02-11)


### Features

* merge OpenCode/Amp/Codex options and add GitHub Copilot support ([b2e7fa1](https://github.com/first-fluke/oh-my-agent/commit/b2e7fa1d8e6f748cfdf92f351d8f5d72f81eded6))


### Bug Fixes

* OpenCode, Amp, Codex all use .agents/skills/ ([ed4f9bd](https://github.com/first-fluke/oh-my-agent/commit/ed4f9bdf688d69620af22bc27234b0f7f8b0182e))
* update Codex skills path from .codex/skills to .agents/skills ([8c30a97](https://github.com/first-fluke/oh-my-agent/commit/8c30a97cbe29d7117aa13322b11acad011a1a03d))


### Miscellaneous

* update CLI hints to show shared directories ([c0e78a2](https://github.com/first-fluke/oh-my-agent/commit/c0e78a221ab1a297affb9c91a9690efbf5978360))

## [1.18.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.17.0...cli-v1.18.0) (2026-02-11)


### Features

* **cleanup:** add Gemini directory cleanup with -y flag ([061d193](https://github.com/first-fluke/oh-my-agent/commit/061d193b4f3b20eebf411ae3c190d75de37c6a7d))

## [1.17.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.16.0...cli-v1.17.0) (2026-02-11)


### Features

* **cli:** add help and version commands ([cdba845](https://github.com/first-fluke/oh-my-agent/commit/cdba84527627b859723a55d0add1431a0342db29))
* **doctor:** add symlink validation for multi-CLI setup ([1d6fa4f](https://github.com/first-fluke/oh-my-agent/commit/1d6fa4fa51e39ba7beb20c964ce876397b218c6c))
* **update:** auto-update CLI symlinks when updating skills ([fe6a99c](https://github.com/first-fluke/oh-my-agent/commit/fe6a99c6a0ce49ad6355ba0a210271c31d944e30))

## [1.16.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.15.0...cli-v1.16.0) (2026-02-11)


### Features

* **cli:** add multi-CLI symlink support for skills ([dc29b6d](https://github.com/first-fluke/oh-my-agent/commit/dc29b6d23ae4a53aefbd0ac9a16a34437bc28ab6))

## [1.15.0](https://github.com/first-fluke/oh-my-agent/compare/cli-v1.14.1...cli-v1.15.0) (2026-02-09)


### Features

* split cli/web workspaces and docs release flow ([5609032](https://github.com/first-fluke/oh-my-agent/commit/5609032bf657e4e4d71e0acaa2e319effcdf8a35))

# Changelog

## [1.1.2](https://github.com/first-fluke/oh-my-ag/compare/oh-my-antigravity-v1.1.1...oh-my-antigravity-v1.1.2) (2026-01-30)


### Refactoring

* add Intelligent Escalation to backend agent execution protocol ([e366ad4](https://github.com/first-fluke/oh-my-ag/commit/e366ad4c122b8e44b5aa60cea4feb88e3481957f))
* add Intelligent Escalation to frontend agent execution protocol ([6766640](https://github.com/first-fluke/oh-my-ag/commit/6766640457a4f766a7006603d0b416336a20ba14))
* add Intelligent Escalation to mobile agent execution protocol ([4c99c98](https://github.com/first-fluke/oh-my-ag/commit/4c99c98e2604f0fe84151667c22eab9782cdfd51))
* add Intelligent Escalation to PM, QA, and debug agent execution protocols ([2b79d4e](https://github.com/first-fluke/oh-my-ag/commit/2b79d4ec6a742dbfb408fbc88af24fb71012b563))


### Documentation

* enhance clarification-protocol with Intelligent Escalation ([2fee2f7](https://github.com/first-fluke/oh-my-ag/commit/2fee2f734f00b7a16e87a1e97e111ee7fb70b930))


### Miscellaneous

* rebuild CLI after protocol updates ([24c314d](https://github.com/first-fluke/oh-my-ag/commit/24c314d6887f27834b72baa844520504804d3478))

## [1.1.1](https://github.com/first-fluke/oh-my-antigravity/compare/oh-my-antigravity-v1.1.0...oh-my-antigravity-v1.1.1) (2026-01-30)


### Bug Fixes

* convert generate-manifest.js to ES module syntax ([bce2296](https://github.com/first-fluke/oh-my-antigravity/commit/bce22962b4dc69ef18bb697c11bc3f8422877c26))


### Refactoring

* convert generate-manifest to TypeScript ([c9b13df](https://github.com/first-fluke/oh-my-antigravity/commit/c9b13dfa85bea41e14498231795404c263057e2e))


### Documentation

* remove npm scripts fallback from dashboard section ([5d888a9](https://github.com/first-fluke/oh-my-antigravity/commit/5d888a9d82b32a3c25199b46a8eba941f24408b7))

## [1.1.0](https://github.com/first-fluke/oh-my-antigravity/compare/oh-my-antigravity-v1.0.0...oh-my-antigravity-v1.1.0) (2026-01-30)


### Features

* Add /coordinate workflow for explicit multi-agent orchestration ([8089441](https://github.com/first-fluke/oh-my-antigravity/commit/80894416b745c7605330360bc35ee74d8751dbb8))
* Add /debug, /review, /plan, /orchestrate workflows ([14e94bf](https://github.com/first-fluke/oh-my-antigravity/commit/14e94bf28a11542a04447220f54b79f147d68a0d))
* Add 7 advanced enhancements to skill system ([46cd535](https://github.com/first-fluke/oh-my-antigravity/commit/46cd53588628382019999e97da3a5637b3035ece))
* Add cleanup logic to prevent zombie/orphan processes and /tmp leaks ([a63b49d](https://github.com/first-fluke/oh-my-antigravity/commit/a63b49d26fec51adada9f90a970deaf5b58653b9))
* Add CLI-based multi-agent orchestrator with Serena Memory coordination ([63102aa](https://github.com/first-fluke/oh-my-antigravity/commit/63102aaf0a1ec37a782d07eb6af67837a3e48544))
* Add Debug Agent skill for bug diagnosis and fixing ([13a62dd](https://github.com/first-fluke/oh-my-antigravity/commit/13a62ddd48d277afef25f2409203a0930a10e5a7))
* add interactive CLI installer and real-time dashboard ([dca197a](https://github.com/first-fluke/oh-my-antigravity/commit/dca197a69116cac9c747a6d638e9a20bad9c6937))
* Add MANDATORY RULES to workflows and fix dashboard empty array bug ([1dad05a](https://github.com/first-fluke/oh-my-antigravity/commit/1dad05a7a3728a9d68f24120cca367d0f28771a2))
* add NPM deployment workflow, update command, and doctor command ([60fb8b8](https://github.com/first-fluke/oh-my-antigravity/commit/60fb8b8bed4ed688cb46368e5697d830703dc83b))
* add release-please automation and central registry support ([5875ee8](https://github.com/first-fluke/oh-my-antigravity/commit/5875ee8eda61f92226f24a55691cda4b45f6e8b7))
* Add Serena Memory real-time monitoring dashboards ([0f2e809](https://github.com/first-fluke/oh-my-antigravity/commit/0f2e80954d04dd8b5370064ead378cc7c7e294bf))
* Add SubAgent Orchestrator for CLI-based parallel execution ([0f86169](https://github.com/first-fluke/oh-my-antigravity/commit/0f8616998d753be29bf21d5851c430b71d3c7e64))
* Add SubAgent Orchestrator for CLI-based parallel execution ([d366d06](https://github.com/first-fluke/oh-my-antigravity/commit/d366d0656b3fe7677ea812f10814ac2f0cf89aa2))
* add terminal dashboard and route CLI commands correctly ([78af420](https://github.com/first-fluke/oh-my-antigravity/commit/78af420d3da7cc05e75e43a58deace1a084261eb))
* **cli:** add help command and star prompts ([851202a](https://github.com/first-fluke/oh-my-antigravity/commit/851202a8a48b242233f8c3091553dc2bc45e0e0e))
* Close 5 performance gaps between Pro and Opus models ([02b89aa](https://github.com/first-fluke/oh-my-antigravity/commit/02b89aaebeac38b6847e2d25547169b0e269c34f))
* **commit:** add smart commit splitting by feature/domain ([7b63a46](https://github.com/first-fluke/oh-my-antigravity/commit/7b63a46dc3184a0cf2927517eafb322bcdc64033))
* Implement Multi-Agent Orchestrator for Google Antigravity ([5a2dfd9](https://github.com/first-fluke/oh-my-antigravity/commit/5a2dfd9825a42611da113e5dd1c657a891a5d0b2))
* **orchestrator:** add multi-CLI agent mapping and user preferences ([a2585d8](https://github.com/first-fluke/oh-my-antigravity/commit/a2585d8d4fb24c2544a6af5ea421016deb4b4141))


### Bug Fixes

* Correct implementation to use Antigravity IDE native workflow ([2faec7c](https://github.com/first-fluke/oh-my-antigravity/commit/2faec7c2378e1b2e89d4f12fec2b9a93282c563e))
* Improve dashboard flexibility and fix Gemini MCP config ([afefbca](https://github.com/first-fluke/oh-my-antigravity/commit/afefbca5b702a6a3de8f0bb32ab9d75163620c37))
* Replace Agent Manager UI with CLI-based workflow and remove Korean defaults ([62fa930](https://github.com/first-fluke/oh-my-antigravity/commit/62fa93064d2f47566dd584508cab7221f314ae58))
* update star command, add funding info, support dashboard:web alias ([2a6ec0a](https://github.com/first-fluke/oh-my-antigravity/commit/2a6ec0ae2fbcc759c3fa3ade36b83033bdf63800))


### Refactoring

* Abstract MCP tools from Serena and update Gemini CLI flags ([ce74d81](https://github.com/first-fluke/oh-my-antigravity/commit/ce74d812fdea11aedaa82e0ef10875610dabe877))
* Reduce SKILL.md files for token efficiency ([4f198f9](https://github.com/first-fluke/oh-my-antigravity/commit/4f198f95a1b2e90be585b8c72c04e2fcd7519c86))
* Reduce SKILL.md files for token efficiency ([ff2b396](https://github.com/first-fluke/oh-my-antigravity/commit/ff2b396180024c22f035a157c39c7e67ce01dfea))
* remove old dashboard scripts, use CLI exclusively ([838fc26](https://github.com/first-fluke/oh-my-antigravity/commit/838fc26f356c707983b725e99d2658f4cf1871c9))
* Rewrite AGENT_GUIDE.md as executable instructions for agents ([a628dea](https://github.com/first-fluke/oh-my-antigravity/commit/a628dea0e132b41c478471493c9014f32ff48269))
* Slim SKILL.md files ~75% by extracting details to resources/ ([7a5fe26](https://github.com/first-fluke/oh-my-antigravity/commit/7a5fe26103fffd360473c2324f8973c5edeb4da8))


### Documentation

* add bun install hint to Korean README ([0c95218](https://github.com/first-fluke/oh-my-antigravity/commit/0c95218f50583682163e7a2d8307994c25ef075a))
* add gh star command to README ([690d4c3](https://github.com/first-fluke/oh-my-antigravity/commit/690d4c301450cbc14fc686d81b9acbc4aa5693b5))
* Add integration instructions for existing Antigravity projects ([397c4e9](https://github.com/first-fluke/oh-my-antigravity/commit/397c4e9975617c9e65f1c2983d305343f23863b8))
* Add Korean USAGE guide and Agent execution guide ([bf2d385](https://github.com/first-fluke/oh-my-antigravity/commit/bf2d3857d376c744e492d2765e6c7cf196377830))
* Enhance AGENT_GUIDE.md with comprehensive safety measures ([125294b](https://github.com/first-fluke/oh-my-antigravity/commit/125294b00a8615e9b68cc019328dbb2deecd4cce))
* rename Korean docs from -ko.md to .ko.md extension ([ad70cd6](https://github.com/first-fluke/oh-my-antigravity/commit/ad70cd66b95c16e5dc729404c0f9d15e93e2dcc9))
* Rewrite AGENT_GUIDE.md as integration guide for developers ([6711f34](https://github.com/first-fluke/oh-my-antigravity/commit/6711f34d3b9d8e1722729fbb7129ccd90c52fa38))
* Rewrite guides with dashboard docs in English and Korean ([2034b21](https://github.com/first-fluke/oh-my-antigravity/commit/2034b219e730acca5d7414837b0a1cc339974842))
* update dashboard commands to prioritize bunx CLI usage ([41b554f](https://github.com/first-fluke/oh-my-antigravity/commit/41b554f6f25f3167f96cb82515f3c5841198386c))
* Update project documentation to reflect new skill architecture ([f403958](https://github.com/first-fluke/oh-my-antigravity/commit/f4039589a140f83f2ffa18e42255fd9d89d3d121))
* update Real-time Dashboards section to use bunx commands ([f413e1d](https://github.com/first-fluke/oh-my-antigravity/commit/f413e1d19cb6b53c04da795c255cade7bfc48319))
* use bunx instead of npx for skills add ([a0413a6](https://github.com/first-fluke/oh-my-antigravity/commit/a0413a682c2be36284f7f242f0a5874d7a773364))


### Miscellaneous

* add GitHub Sponsors and Buy Me a Coffee funding ([5de8e5f](https://github.com/first-fluke/oh-my-antigravity/commit/5de8e5f10c5d6cf6895f116f7e91011023802db8))
* rename project to mimic-skills ([eb5b174](https://github.com/first-fluke/oh-my-antigravity/commit/eb5b174ca759fd18f8a14ddfedae768dfe130f4e))
* rename to oh-my-antigravity (first-fluke org) ([cfd5661](https://github.com/first-fluke/oh-my-antigravity/commit/cfd5661cc70ac1786d39c45e1cf40e4f89d16281))

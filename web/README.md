# OMA documentation website

This directory contains the Docusaurus documentation website for oh-my-agent. English source pages live in `docs/`; translated pages live in `i18n/<locale>/docusaurus-plugin-content-docs/current/`.

## Run the website locally

Use the Node.js version required by `package.json` and Bun. From the repository root, install dependencies, then start the English development server:

```bash
bun install
bun run --cwd web dev
```

Open the URL printed by Docusaurus. Edit a page under `web/docs/` and the development server reloads it. To preview Korean instead:

```bash
bun run --cwd web dev --locale ko
```

## Find the files you need

| Change | File or directory |
|---|---|
| English guide content | `docs/` |
| Translated guide content | `i18n/<locale>/docusaurus-plugin-content-docs/current/` |
| Sidebar order and categories | `sidebars.ts` |
| Translated sidebar labels | `i18n/<locale>/docusaurus-plugin-content-docs/current.json` |
| Site URL, locales, plugins and navigation | `docusaurus.config.ts` |
| Landing page | `src/pages/index.tsx` |
| Shared styling | `src/css/custom.css` |

## Write a guide

Start with the reader's task and prerequisites. Give the smallest usable example, explain the result, then cover relevant defaults, choices and recovery. Link to the detailed command or configuration reference instead of copying the same long table into several guides.

Keep existing routes and correct technical details when reorganizing a page. Verify commands against the CLI's registration or `oma describe`, and verify configuration defaults against their implementation. Distinguish a skill, an agent definition and a workflow; they are different inventories.

Add each new page to `sidebars.ts`. Use relative Markdown links between pages. Keep English and Korean content aligned and record any remaining translation gaps for the other supported locales. A missing translated page falls back to English; that is not a completed translation.

## Check changes

From the repository root:

```bash
bun cli/cli.ts docs verify 'web/docs/**/*.md' --json --no-urls
bun cli/cli.ts docs i18n --json
bun cli/cli.ts docs lint --json
bunx tsc --noEmit -p web/tsconfig.json
git diff --check
```

The documentation verifier checks references; translation drift checks compare structure and recency. Neither proves that a tutorial teaches the correct behavior. Read examples against the implementation and check the learning path as well.

When a production build is explicitly requested, run:

```bash
bun run --cwd web build
```

The generated site is written to `web/build/`. Repository CI owns deployment; consult `.github/workflows/` from the repository root for the current publish workflow.

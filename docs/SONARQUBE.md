# SonarQube Cloud

This repository uses SonarQube Cloud CI analysis to enforce quality standards on new code without
requiring an immediate rewrite of existing debt.

## One-time setup

1. Import `abanobmikaeel/coptic.io` into a SonarQube Cloud Free or OSS organization.
2. Disable SonarQube Cloud automatic analysis for the project. This repository uses CI-based
   analysis so it can include test coverage.
3. Add these GitHub Actions variables under **Settings > Secrets and variables > Actions**:
   - `SONAR_PROJECT_KEY`: the key shown in the imported SonarQube Cloud project.
   - `SONAR_ORGANIZATION`: the SonarQube Cloud organization key.
4. Add `SONAR_TOKEN` as a GitHub Actions secret. Generate it from the SonarQube Cloud account used
   for analysis.
5. Run the workflow on `main` once to establish the baseline before relying on pull request results.

The workflow intentionally skips analysis until both repository variables are configured.
It also skips pull requests from forks because GitHub correctly withholds `SONAR_TOKEN` from
untrusted fork code. Those changes are analyzed when merged into `main`.

## Quality gate

Create or select a quality gate that applies these conditions to **new code**:

- Reliability rating: A
- Security rating: A
- Maintainability rating: A
- Reviewed security hotspots: 100%
- Coverage: at least 90%
- Duplicated lines: at most 3%

Set this gate as the project default and require the SonarQube quality-gate check in the GitHub
branch protection rules for `main`.

## Local coverage

Generate the same LCOV reports consumed by SonarQube Cloud:

```bash
pnpm test:coverage
```

Reports are generated under each tested workspace's `coverage/` directory and are ignored by Git.

# Use Tellbuster in GitHub Actions

Tellbuster can check the Markdown files in your repo every time someone opens a pull request. Each phrase that might read as AI shows as a note on the line where it appears, with the reason and a fix.

It runs on GitHub's own machine. Your text is not sent anywhere else.

## Set it up

1. In your repo, create the file `.github/workflows/tellbuster.yml`.
2. Paste this into it:

```yaml
name: Tellbuster
on:
  pull_request:
  push:
    branches: [main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: aiprofitwire/tellbuster@main
        with:
          files: README.md docs/*.md
          fail-on: high
```

3. Commit the file. The check runs on the next pull request.

## Options

All of them are optional.

- `files`: the files to check, separated by spaces or new lines. Patterns like `docs/*.md` and `**/*.md` work. Leave it out to check every `.md` file in the repo.
- `exclude`: files to leave out, separated by spaces or new lines. Patterns work here too, for example `docs/drafts/*.md`. Handy for files that quote AI phrases on purpose.
- `fail-on`: `low`, `medium` or `high` (the default). A finding at or above this level shows as an error and fails the check. Findings below it show as warnings and do not fail it.
- `strict`: `true` also uses the strict style rules (words with normal everyday uses).
- `lang`: `auto` (the default), `en`, `fr`, `es`, `de` or `pt`.
- `disable`: rule ids to skip, separated by commas, for example `en-em-dash,en-delve`.

## Quoting a tell on purpose

Sometimes you need to write a tell, for example to explain it. Tellbuster skips:

- code blocks and `inline code` in Markdown files,
- everything between `<!-- tellbuster-disable -->` and `<!-- tellbuster-enable -->`,
- the line right after `<!-- tellbuster-disable-next-line -->`.

These comments do not show on the page GitHub displays.

## Good to know

- Tellbuster is a linter, not a detector. It never says your text "is AI". People use these phrases too, so read each note and decide.
- `@main` always uses the latest version. To stay on one version, use a commit id instead of `main`.

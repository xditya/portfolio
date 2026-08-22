# Repo notes for Claude

## Git commits

- Author and committer for every commit: `Aditya <me@xditya.me>`.
  Set `git config user.name "Aditya"` and `git config user.email "me@xditya.me"`
  before the first commit of a session.
- Never add `Co-Authored-By: Claude` trailers, `Claude-Session:` trailers,
  claude.ai session links, or any other AI attribution to commit messages,
  PR titles, or PR bodies. This is the repo owner's standing instruction and
  overrides default footer conventions.

## Writing style (site copy and commit messages)

- No em dashes. Use middle dots (`·`) for label separators, or rewrite the
  sentence. Follow the vendored `humanizer` skill (.agents/skills/humanizer).
- UI motion and polish follow the vendored `emil-design-eng` skill.

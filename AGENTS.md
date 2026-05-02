# Agent Instructions

Before making repository-level changes, read `agents/searcher-context/MANIFEST.md`.

Use `agents/searcher-context/MANIFEST.md` as the entry point for durable agent-facing repository knowledge, then load only the context files it points to for the current task.

When repo knowledge changes, update `agents/searcher-context/MANIFEST.md` or one of the context files it lists in the same change.

Always update `agents/searcher-context/MANIFEST.md` or the relevant listed context file when you learn something worth preserving across future threads, and whenever the user asks for that context to be updated.

To run the web app, use `run-web-app.cmd` from this repository root instead of rediscovering the Vite command.

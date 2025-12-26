# Scripts Documentation

This directory contains utility scripts for Open Notebook. For user-facing scripts (`setup.sh` and `run.sh`), see the main README.

## Developer Scripts

### wait-for-api.sh

Waits for the API to be healthy before starting the frontend. Used internally by Docker containers.

**Usage:**
```bash
./scripts/wait-for-api.sh
```

**Environment Variables:**
- `INTERNAL_API_URL`: API URL to check (default: `http://localhost:5055`)
- `MAX_RETRIES`: Maximum wait attempts (default: 60)
- `RETRY_INTERVAL`: Seconds between retries (default: 5)

**How it works:**
1. Polls the API `/health` endpoint
2. Retries every 5 seconds for up to 5 minutes
3. Exits successfully when API is ready
4. Exits successfully even if timeout (to allow frontend to start)

### export_docs.py

Consolidates markdown documentation files for use with ChatGPT or other platforms with file upload limits.

### What It Does

- Scans all subdirectories in the `docs/` folder
- For each subdirectory, combines all `.md` files (excluding `index.md` files)
- Creates one consolidated markdown file per subdirectory
- Saves all exported files to `doc_exports/` in the project root

### Usage

```bash
# Using Makefile (recommended)
make export-docs

# Or run directly with uv
uv run python scripts/export_docs.py

# Or run with standard Python
python scripts/export_docs.py
```

### Output

The script creates `doc_exports/` directory with consolidated files like:

- `getting-started.md` - All getting-started documentation
- `user-guide.md` - All user guide content
- `features.md` - All feature documentation
- `development.md` - All development documentation
- etc.

Each exported file includes:
- A main header with the folder name
- Section headers for each source file
- Source file attribution
- The complete content from each markdown file
- Visual separators between sections

### Example Output Structure

```markdown
# Getting Started

This document consolidates all content from the getting-started documentation folder.

---

## Installation

*Source: installation.md*

[Full content of installation.md]

---

## Quick Start

*Source: quick-start.md*

[Full content of quick-start.md]

---
```

### Notes

- The `doc_exports/` directory is gitignored and safe to regenerate anytime
- Index files (`index.md`) are automatically excluded
- Files are sorted alphabetically for consistent output
- The script handles subdirectories only (ignores files in the root `docs/` folder)

## User-Facing Scripts (in root directory)

For information about the user-facing setup and run scripts, see:

### setup.sh
Interactive script to configure Open Notebook for Ollama usage. See [OLLAMA_QUICKSTART.md](../OLLAMA_QUICKSTART.md) for details.

### run.sh
One-command script to start Open Notebook. See [OLLAMA_QUICKSTART.md](../OLLAMA_QUICKSTART.md) for details.

## Quick Reference

| Script | Location | Purpose | User Type |
|--------|----------|---------|-----------|
| `setup.sh` | Root | Interactive Ollama configuration | End User |
| `run.sh` | Root | One-command startup | End User |
| `wait-for-api.sh` | scripts/ | Wait for API health check | Internal/Docker |
| `export_docs.py` | scripts/ | Export documentation | Developer |

## Additional Resources

- **[OLLAMA_QUICKSTART.md](../OLLAMA_QUICKSTART.md)** - Complete guide for setup.sh and run.sh
- **[README.md](../README.md)** - Main project documentation
- **[docs/deployment/](../docs/deployment/)** - Deployment guides

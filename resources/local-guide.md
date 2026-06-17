# MCP Workshop - Local Resource Guide

## Overview

This document is served from the local filesystem.
It demonstrates how MCP resources can be backed by simple file reads.

## Local Setup

- **Path**: `resources/local-guide.md`
- **Read by**: `node:fs/promises` (`readFile`)
- **Resolved from**: `process.cwd()`

## How It Works

The MCP server reads this markdown file from disk at runtime using
`fs.readFile`. This is the simplest way to expose static content as
an MCP resource — no external dependencies, no network calls.

## Use Cases

- Static documentation bundled with the server repository
- Configuration files or changelogs exposed to AI clients
- Quick prototyping before migrating to a remote storage backend (e.g. MinIO, S3)

## Comparison with MinIO Resource

| Aspect | Local Resource | MinIO Resource |
|--------|---------------|----------------|
| Source | Filesystem | S3-compatible object storage |
| Network | None (local read) | HTTP to MinIO |
| Update | Redeploy or edit file | Upload new object, no redeploy |
| Scalability | Single instance | Shared across services |

Both resources expose the same MCP interface (`resources/read`) — the client
has no way to tell the difference. This is the point: the backing store is
an implementation detail, the protocol layer is uniform.

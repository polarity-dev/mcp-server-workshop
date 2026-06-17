# MCP Workshop - MinIO Resource Guide

## Overview

This document is served from a MinIO object storage bucket.
It demonstrates how MCP resources can be backed by S3-compatible storage.

## MinIO Setup

- **Endpoint**: http://localhost:9000
- **Console**: http://localhost:9001
- **Bucket**: `docs`
- **Credentials**: minioadmin / minioadmin

## How It Works

The MCP server uses the AWS S3 SDK to connect to the local MinIO instance
and fetch this markdown file at runtime. This pattern allows you to store
documentation, configuration, or any text-based resource in object storage
and expose it through the MCP protocol.

## Use Cases

- Centralized documentation that multiple MCP servers can share
- Dynamic content that can be updated without redeploying the server
- Large files that don't belong in the codebase

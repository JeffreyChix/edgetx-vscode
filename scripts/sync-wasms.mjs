#!/usr/bin/env node
/**
 * sync-wasms.mjs
 *
 * Downloads all .wasm assets from the latest GitHub release and uploads them
 * directly to Vercel Blob — no intermediate files on disk.
 *
 * Required env vars (set in .env.local at the repo root or in the environment):
 *   BLOB_READ_WRITE_TOKEN  — Vercel Blob write token
 *
 * Optional:
 *   GITHUB_TOKEN           — GitHub personal access token (avoids rate-limiting)
 *
 * Usage:
 *   npm run sync-wasms
 */

import { readFileSync } from "fs";
import { put } from "@vercel/blob";

// ---------------------------------------------------------------------------
// Load .env.local (repo root, then apps/web-simu as fallback)
// ---------------------------------------------------------------------------

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf-8");
    for (const line of content.split("\n")) {
      const eq = line.indexOf("=");
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim();
      if (key && !(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {}
}

loadEnvFile(".env.local");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const GITHUB_REPO  = "JeffreyChix/edgetx";
const RELEASE_TAG  = "wasm-latest";
const CONCURRENCY  = 4; // simultaneous uploads

const githubHeaders = {
  Accept: "application/vnd.github+json",
  "User-Agent": "edgetx-vscode-sync",
  ...(process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {}),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchReleaseAssets() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/releases/tags/${RELEASE_TAG}`;
  const res = await fetch(url, { headers: githubHeaders });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }

  const release = await res.json();
  return release.assets.filter((a) => a.name.endsWith(".wasm"));
}

async function downloadAsset(asset) {
  // GitHub release assets need a redirect — follow it
  const res = await fetch(asset.browser_download_url, {
    headers: { ...githubHeaders, Accept: "application/octet-stream" },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Download failed for ${asset.name}: HTTP ${res.status}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function uploadToBlob(name, data) {
  const blob = await put(`wasm/${name}`, data, {
    access: "public",
    cacheControlMaxAge: 31536000,
    allowOverwrite: true,
    contentType: "application/wasm",
  });
  return blob.url;
}

// Run tasks with limited concurrency
async function runConcurrent(tasks, limit) {
  const results = [];
  const queue = [...tasks];

  async function worker() {
    while (queue.length > 0) {
      const task = queue.shift();
      results.push(await task());
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("✗ BLOB_READ_WRITE_TOKEN is not set.");
    console.error("  Add it to .env.local at the repo root.");
    process.exit(1);
  }

  console.log(`Fetching release assets from ${GITHUB_REPO}@${RELEASE_TAG}...`);
  const assets = await fetchReleaseAssets();

  if (assets.length === 0) {
    console.log("No .wasm assets found in the release.");
    return;
  }

  console.log(`Found ${assets.length} WASM file(s). Syncing...\n`);

  let passed = 0;
  let failed = 0;

  const tasks = assets.map((asset) => async () => {
    const label = asset.name.padEnd(40);
    try {
      const data = await downloadAsset(asset);
      const url  = await uploadToBlob(asset.name, data);
      console.log(`  ✓ ${label} → ${url}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${label} — ${err.message}`);
      failed++;
    }
  });

  await runConcurrent(tasks, CONCURRENCY);

  console.log(`\n${passed} uploaded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});

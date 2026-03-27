#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const GEMINI_BUNDLE_PATH = process.env.GEMINI_BUNDLE_PATH || process.env.GEMINI_BIN || "/usr/bin/gemini";
const EXPORT_MARKER = "// packages/cli/index.ts";
const DEFAULT_MODEL_ID = "gemini-3-pro-preview";
const DEFAULT_AUTH_TYPE = "oauth-personal";

function parseArgs(argv) {
  const args = { cwd: process.cwd(), profilesJson: "[]" };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--cwd" && argv[index + 1]) {
      args.cwd = argv[index + 1];
      index += 1;
      continue;
    }
    if (value === "--profiles-json" && argv[index + 1]) {
      args.profilesJson = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function readSettingsAuthType() {
  const settingsPath = path.join(os.homedir(), ".gemini", "settings.json");
  try {
    const parsed = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    const selectedType = parsed?.security?.auth?.selectedType;
    return typeof selectedType === "string" && selectedType.trim() ? selectedType.trim() : null;
  } catch {
    return null;
  }
}

function normalizeModelId(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().replace(/^gemini\//, "").replace(/^google\//, "");
}

function normalizeModelBase(value) {
  return normalizeModelId(value).replace(/-preview$/, "");
}

function buildProfileQuota(bucket, matchedModelId) {
  if (!bucket || typeof bucket !== "object") {
    return null;
  }
  return {
    matched_model_id: matchedModelId,
    remaining_amount: bucket.remainingAmount ?? null,
    limit_amount: bucket.remainingFraction != null && bucket.remainingAmount != null
      ? Math.round(Number(bucket.remainingAmount) / Number(bucket.remainingFraction || 1))
      : null,
    remaining_fraction: bucket.remainingFraction ?? null,
    reset_time: bucket.resetTime ?? null,
  };
}

function matchBucketForProfile(profileModelId, buckets) {
  const requested = normalizeModelId(profileModelId);
  const requestedBase = normalizeModelBase(profileModelId);
  if (!requested) {
    return null;
  }
  for (const bucket of buckets) {
    if (!bucket?.modelId) {
      continue;
    }
    if (normalizeModelId(bucket.modelId) === requested) {
      return buildProfileQuota(bucket, bucket.modelId);
    }
  }
  for (const bucket of buckets) {
    if (!bucket?.modelId) {
      continue;
    }
    const bucketBase = normalizeModelBase(bucket.modelId);
    if (bucketBase === requestedBase) {
      return buildProfileQuota(bucket, bucket.modelId);
    }
  }
  for (const bucket of buckets) {
    if (!bucket?.modelId) {
      continue;
    }
    const bucketBase = normalizeModelBase(bucket.modelId);
    if (bucketBase.startsWith(requestedBase) || requestedBase.startsWith(bucketBase)) {
      return buildProfileQuota(bucket, bucket.modelId);
    }
  }
  return null;
}

async function loadGeminiApi() {
  const source = fs.readFileSync(GEMINI_BUNDLE_PATH, "utf8");
  const markerIndex = source.lastIndexOf(EXPORT_MARKER);
  if (markerIndex === -1) {
    throw new Error(`Could not patch Gemini bundle exports from ${GEMINI_BUNDLE_PATH}`);
  }
  const patchedSource =
    source.slice(0, markerIndex) + "\nexport default dist_exports;\nexport { dist_exports };\n";
  const tempModule = path.join(os.tmpdir(), `bolzano-gemini-quota-${process.pid}-${Date.now()}.mjs`);
  fs.writeFileSync(tempModule, patchedSource, "utf8");
  try {
    const imported = await import(`${pathToFileURL(tempModule).href}?t=${Date.now()}`);
    return imported.default || imported.dist_exports;
  } finally {
    fs.rmSync(tempModule, { force: true });
  }
}

function buildProbeConfig(api, cwd, modelId) {
  return new api.Config({
    sessionId: `bolzano-gemini-quota-${Date.now()}`,
    clientVersion: "bolzano-web",
    targetDir: cwd,
    cwd,
    model: modelId,
    question: "Read Gemini quota state.",
    interactive: false,
    noBrowser: true,
    folderTrust: true,
    trustedFolder: true,
    approvalMode: "plan",
    output: { format: "json" },
    telemetry: { enabled: false },
    usageStatisticsEnabled: false,
    mcpEnabled: false,
    extensionsEnabled: false,
    checkpointing: false,
    enableInteractiveShell: false,
    useBackgroundColor: false,
    useAlternateBuffer: false,
    enableHooks: false,
    enableHooksUI: false,
    enableAgents: false,
  });
}

async function readQuotaSnapshot(api, cwd, modelId) {
  const config = buildProbeConfig(api, cwd, modelId);
  const authType = api.getAuthTypeFromEnv?.() || readSettingsAuthType() || DEFAULT_AUTH_TYPE;
  const contentGeneratorConfig = await api.createContentGeneratorConfig(config, authType);
  const generator = await api.createContentGenerator(contentGeneratorConfig, config, config.getSessionId());
  config.contentGenerator = generator;
  config.contentGeneratorConfig = contentGeneratorConfig;
  const quota = await config.refreshUserQuota();
  return {
    authType,
    quota: quota && typeof quota === "object" ? quota : {},
    pooled: typeof config.getPooledQuota === "function" ? config.getPooledQuota() : {},
  };
}

function normalizePooledQuota(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  return {
    remaining_amount: raw.remaining ?? null,
    limit_amount: raw.limit ?? null,
    remaining_fraction:
      raw.remaining != null && raw.limit
        ? Number(raw.remaining) / Number(raw.limit)
        : null,
    reset_time: raw.resetTime ?? null,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const profiles = JSON.parse(args.profilesJson);
  const api = await loadGeminiApi();
  const probeModelId =
    Array.isArray(profiles) && profiles[0] && typeof profiles[0].model_id === "string"
      ? profiles[0].model_id
      : DEFAULT_MODEL_ID;
  const { quota, pooled } = await readQuotaSnapshot(api, args.cwd, probeModelId);
  const buckets = Array.isArray(quota?.buckets) ? quota.buckets : [];
  const payload = {
    profiles: {},
    pooled: normalizePooledQuota(pooled),
  };
  for (const profile of Array.isArray(profiles) ? profiles : []) {
    if (!profile || typeof profile !== "object") {
      continue;
    }
    const profileId = typeof profile.profile_id === "string" ? profile.profile_id : "";
    const modelId = typeof profile.model_id === "string" ? profile.model_id : "";
    if (!profileId || !modelId) {
      continue;
    }
    payload.profiles[profileId] = matchBucketForProfile(modelId, buckets);
  }
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});

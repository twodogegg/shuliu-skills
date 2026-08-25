#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const skillDir = path.resolve(__dirname, "..");
const envPath = path.join(skillDir, ".env");
const defaultSessionPath = path.join(skillDir, ".session.json");
const inheritedEnvKeys = new Set(Object.keys(process.env));

function getSessionPath(profile) {
  const configuredPath = process.env.NEWAPI_ADMIN_SESSION_PATH;
  if (configuredPath) return path.resolve(skillDir, configuredPath);
  if (profile === "default") return defaultSessionPath;
  return path.join(skillDir, `.session.${profile}.json`);
}

function loadEnv(file, overrideFile = false) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!inheritedEnvKeys.has(key) && (overrideFile || process.env[key] === undefined)) process.env[key] = val;
  }
}

function parseArgs(args) {
  let profile = "default";
  let execToken = "";
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--profile") {
      profile = args[++i] || "";
      continue;
    }
    if (arg.startsWith("--profile=")) {
      profile = arg.slice("--profile=".length);
      continue;
    }
    if (arg === "--exec-token") {
      execToken = args[++i] || "";
      continue;
    }
    if (arg === "--") {
      if (!/^[A-Za-z0-9_-]+$/.test(profile)) throw new Error("invalid profile name");
      return { profile, positional, execToken, command: args.slice(i + 1) };
    }
    positional.push(arg);
  }
  if (!/^[A-Za-z0-9_-]+$/.test(profile)) throw new Error("invalid profile name");
  return { profile, positional, execToken, command: [] };
}

function mask(value) {
  if (typeof value === "string") {
    return value
      .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
      .replace(/(session=)[^;"\s]+/gi, "$1***")
      .replace(/(Bearer\s+)[A-Za-z0-9+/_=.-]+/gi, "$1***");
  }
  if (Array.isArray(value)) return value.map(mask);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => {
      if (/^(key|token|session|authorization|password|access_token|refresh_token)$/i.test(k)) return [k, "***"];
      return [k, mask(v)];
    }));
  }
  return value;
}

async function request(method, url, headers = {}, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json", ...headers } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { res, data };
}

async function readSecretLine() {
  const readline = require("readline");
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  for await (const line of rl) {
    rl.close();
    return line;
  }
  return "";
}

async function login(baseUrl, profile) {
  const body = {
    username: process.env.NEWAPI_ADMIN_USERNAME,
    password: process.env.NEWAPI_ADMIN_PASSWORD,
  };
  const { res, data } = await request("POST", `${baseUrl}/api/user/login`, {}, body);
  const cookie = res.headers.get("set-cookie") || "";
  const session = cookie.match(/session=([^;]+)/)?.[1];
  const accessToken = data?.data?.access_token;
  if (!res.ok || (!session && !accessToken)) throw new Error(`login failed: ${JSON.stringify(mask(data))}`);
  fs.writeFileSync(getSessionPath(profile), JSON.stringify({ session, accessToken, time: Date.now() }, null, 2));
  return { session, accessToken };
}

async function getSession(baseUrl, profile) {
  try {
    const cached = JSON.parse(fs.readFileSync(getSessionPath(profile), "utf8"));
    if ((cached.session || cached.accessToken) && Date.now() - cached.time < 25 * 24 * 3600 * 1000) return cached;
  } catch {}
  return login(baseUrl, profile);
}

async function runWithToken(baseUrl, userId, profile, tokenId, command) {
  if (!/^\d+$/.test(tokenId) || command.length === 0) {
    throw new Error("Usage: api.js [--profile name] --exec-token <token_id> -- <command>");
  }

  let auth = await getSession(baseUrl, profile);
  let headers = auth.accessToken
    ? { Authorization: `Bearer ${auth.accessToken}`, "New-Api-User": userId }
    : { Cookie: `session=${auth.session}`, "New-Api-User": userId };
  let response = await request("POST", `${baseUrl}/api/token/${tokenId}/key`, headers);
  if (response.res.status === 401) {
    auth = await login(baseUrl, profile);
    headers = auth.accessToken
      ? { Authorization: `Bearer ${auth.accessToken}`, "New-Api-User": userId }
      : { Cookie: `session=${auth.session}`, "New-Api-User": userId };
    response = await request("POST", `${baseUrl}/api/token/${tokenId}/key`, headers);
  }
  if (!response.res.ok) throw new Error(`token key request failed: ${JSON.stringify(mask(response.data))}`);

  const rawKey = response.data?.data?.key;
  if (!rawKey) throw new Error("token key request returned no key");
  const fullKey = String(rawKey).startsWith("sk-") ? String(rawKey) : `sk-${rawKey}`;
  const child = spawn(command[0], command.slice(1), {
    env: { ...process.env, NEWAPI_TOKEN: fullKey },
    stdio: ["inherit", "pipe", "pipe"],
  });
  const redact = (value) => mask(String(value).split(fullKey).join("sk-***").split(String(rawKey)).join("***"));
  child.stdout.on("data", (chunk) => process.stdout.write(redact(chunk)));
  child.stderr.on("data", (chunk) => process.stderr.write(redact(chunk)));
  await new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("close", (code) => resolve(code));
  }).then((code) => {
    if (code !== 0) process.exitCode = code || 1;
  });
}

async function main() {
  const { profile, positional, execToken, command } = parseArgs(process.argv.slice(2));
  loadEnv(envPath);
  if (profile !== "default") loadEnv(path.join(skillDir, `.env.${profile}`), true);
  const [method, apiPath, rawBody] = positional;
  if (!execToken && (!method || !apiPath)) {
    console.error("Usage: api.js [--profile name] METHOD /api/path [jsonBody]");
    process.exit(2);
  }

  const baseUrl = (process.env.NEWAPI_ADMIN_BASE_URL || "").replace(/\/$/, "");
  const userId = process.env.NEWAPI_ADMIN_USER_ID;
  if (!baseUrl || !userId) throw new Error("missing NEWAPI_ADMIN_BASE_URL or NEWAPI_ADMIN_USER_ID");

  if (execToken) {
    await runWithToken(baseUrl, userId, profile, execToken, command);
    return;
  }

  let requestBody = rawBody;
  const secretPlaceholder = "__NEWAPI_ADMIN_STDIN_SECRET__";
  if (requestBody && requestBody.includes(secretPlaceholder)) {
    const secret = await readSecretLine();
    if (!secret) throw new Error("missing secret input");
    requestBody = requestBody.replaceAll(secretPlaceholder, secret);
  }
  const body = requestBody ? JSON.parse(requestBody) : undefined;
  const auth = await getSession(baseUrl, profile);
  const headers = auth.accessToken
    ? { Authorization: `Bearer ${auth.accessToken}`, "New-Api-User": userId }
    : { Cookie: `session=${auth.session}`, "New-Api-User": userId };
  const { res, data } = await request(method.toUpperCase(), `${baseUrl}${apiPath}`, headers, body);

  if (res.status === 401) {
    const fresh = await login(baseUrl, profile);
    const retryHeaders = fresh.accessToken
      ? { Authorization: `Bearer ${fresh.accessToken}`, "New-Api-User": userId }
      : { Cookie: `session=${fresh.session}`, "New-Api-User": userId };
    const retry = await request(method.toUpperCase(), `${baseUrl}${apiPath}`, retryHeaders, body);
    console.log(JSON.stringify({ status: retry.res.status, data: mask(retry.data) }, null, 2));
    process.exit(retry.res.ok ? 0 : 1);
  }

  console.log(JSON.stringify({ status: res.status, data: mask(data) }, null, 2));
  process.exit(res.ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

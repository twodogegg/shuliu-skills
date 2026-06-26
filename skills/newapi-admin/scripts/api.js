#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const skillDir = path.resolve(__dirname, "..");
const envPath = path.join(skillDir, ".env");
const sessionPath = path.join(skillDir, ".session.json");

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = val;
  }
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

async function login(baseUrl) {
  const body = {
    username: process.env.NEWAPI_ADMIN_USERNAME,
    password: process.env.NEWAPI_ADMIN_PASSWORD,
  };
  const { res, data } = await request("POST", `${baseUrl}/api/user/login`, {}, body);
  const cookie = res.headers.get("set-cookie") || "";
  const session = cookie.match(/session=([^;]+)/)?.[1];
  if (!res.ok || !session) throw new Error(`login failed: ${JSON.stringify(mask(data))}`);
  fs.writeFileSync(sessionPath, JSON.stringify({ session, time: Date.now() }, null, 2));
  return session;
}

async function getSession(baseUrl) {
  try {
    const cached = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
    if (cached.session && Date.now() - cached.time < 25 * 24 * 3600 * 1000) return cached.session;
  } catch {}
  return login(baseUrl);
}

async function main() {
  loadEnv(envPath);
  const [method, apiPath, rawBody] = process.argv.slice(2);
  if (!method || !apiPath) {
    console.error("Usage: api.js METHOD /api/path [jsonBody]");
    process.exit(2);
  }

  const baseUrl = (process.env.NEWAPI_ADMIN_BASE_URL || "").replace(/\/$/, "");
  const userId = process.env.NEWAPI_ADMIN_USER_ID;
  if (!baseUrl || !userId) throw new Error("missing NEWAPI_ADMIN_BASE_URL or NEWAPI_ADMIN_USER_ID");

  const body = rawBody ? JSON.parse(rawBody) : undefined;
  const session = await getSession(baseUrl);
  const headers = { Cookie: `session=${session}`, "New-Api-User": userId };
  const { res, data } = await request(method.toUpperCase(), `${baseUrl}${apiPath}`, headers, body);

  if (res.status === 401) {
    const fresh = await login(baseUrl);
    const retry = await request(method.toUpperCase(), `${baseUrl}${apiPath}`, { Cookie: `session=${fresh}`, "New-Api-User": userId }, body);
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

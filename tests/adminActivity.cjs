const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const exportsObject = {};
const code = ts.transpileModule(fs.readFileSync("lib/adminActivity.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
vm.runInNewContext(code, { exports: exportsObject, require(name) {
  if (name === "server-only") return {};
  if (name === "./postUrl") return { buildPostPath: id => "/posts/" + id };
  if (name === "./profileUrl") return { buildProfilePath: row => "/profile/" + row.id };
  throw new Error(name);
}});
const fixtures = {
  profiles: [{ id: "host", display_name: "Host", created_at: "2026-10-01T00:00:00Z" }, { id: "guest", display_name: "Guest", created_at: "2026-10-02T00:00:00Z" }],
  posts: [{ id: 1, user_id: "host", meeting_purpose: "Coffee", place_name: "Cafe", created_at: "2026-10-03T00:00:00Z" }],
  match_requests: [{ id: 1, post_id: 1, requester_user_id: "guest", post_owner_user_id: "host", created_at: "2026-10-04T00:00:00Z" }],
  matches: [{ id: 1, post_id: 1, user_a: "guest", user_b: "host", created_at: "2026-10-05T00:00:00Z" }],
};
function client(data, fail) {
  return { from(table) {
    const query = { select() { return this; }, order() { return this; }, limit(n) { assert.equal(n, 50); return this; }, in() { return this; }, then(resolve) { return Promise.resolve({ data: data[table] || [], error: table === fail ? new Error("query failed") : null }).then(resolve); } };
    return query;
  }};
}
(async () => {
  const items = await exportsObject.getAdminActivity(client(fixtures));
  assert.equal(items.length, 5);
  assert.equal(items[0].kind, "Accepted");
  assert.equal(items[0].actor.name, "Host");
  assert.equal(items[0].other.name, "Guest");
  assert.equal(items[1].actor.name, "Guest");
  assert.equal(items[1].other.name, "Host");
  assert.equal(items[0].post.href, "/posts/1");
  assert.equal(items[4].kind, "Signup");
  assert.equal((await exportsObject.getAdminActivity(client({}))).length, 0);
  await assert.rejects(exportsObject.getAdminActivity(client(fixtures, "matches")), /query failed/);
  const missing = await exportsObject.getAdminActivity(client({ matches: fixtures.matches }));
  assert.equal(missing[0].actor.href, null);
  assert.equal(missing[0].post, undefined);
  const many = { profiles: Array.from({ length: 60 }, (_, id) => ({ id: String(id), display_name: "User", created_at: new Date(Date.UTC(2026, 0, 1, 0, id)).toISOString() })) };
  assert.equal((await exportsObject.getAdminActivity(client(many))).length, 50);
  const page = fs.readFileSync("app/admin/overview/page.tsx", "utf8");
  assert(page.indexOf("if (!profile?.is_admin)") < page.indexOf("getAdminActivity(createAdminClient())"));
  console.log("PASS: activity sorting, actors, links, empty/error/missing data, limit, admin gate.");
})().catch(error => { console.error(error); process.exitCode = 1; });

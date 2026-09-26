import assert from "node:assert";
import { parsePattern } from "../pattern.js";
import { isMatch } from "../match.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("parsePattern returns tokens", () => {
  assert.ok(Array.isArray(parsePattern("a*").tokens));
});

check("isMatch returns a boolean", () => {
  assert.strictEqual(typeof isMatch("a*", "abc"), "boolean");
});

check("isMatch handles plain text", () => {
  assert.strictEqual(typeof isMatch("abc", "abc"), "boolean");
});

check("render returns one result per pair", () => {
  const view = render({ pairs: [{ pattern: "a", text: "a" }, { pattern: "b", text: "c" }] });
  assert.strictEqual(view.results.length, 2);
});

check("render counts patterns", () => {
  const view = render({ pairs: [{ pattern: "a*", text: "a" }] });
  assert.strictEqual(typeof view.star_count, "number");
  assert.strictEqual(typeof view.pattern_chars, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);

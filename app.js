// app.js：渲染结果
import { parsePattern } from "./pattern.js";
import { isMatch } from "./match.js";

export function render(spec) {
  const pairs = spec.pairs || [];
  const results = pairs.map((pair) => isMatch(pair.pattern, pair.text));
  const patterns = pairs.map((pair) => pair.pattern);
  return { results: results, hits: results.filter((hit) => hit).length,
           star_count: patterns.filter((item) => item.indexOf("*") !== -1).length,
           class_count: patterns.filter((item) => item.indexOf("[") !== -1).length,
           single_count: patterns.filter((item) => item.indexOf("?") !== -1).length,
           pattern_chars: patterns.reduce((total, item) => total + item.length, 0),
           longest: patterns.reduce((best, item) => Math.max(best, item.length), 0) };
}

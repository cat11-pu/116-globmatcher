// match.js：匹配（基线：只做整串相等）
import { parsePattern } from "./pattern.js";

export function isMatch(pattern, text) {
  return String(pattern) === String(text);
}

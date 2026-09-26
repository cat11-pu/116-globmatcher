// match.js：NFA 状态集合匹配，每个文本字符只推进一次可达状态集合，
// 推进后补星号的空跳闭包；同一位置不重复算，复杂度 O(模式长 × 文本长)。
import { parsePattern } from "./pattern.js";

const CACHE_LIMIT = 256;
const cache = new Map();

function tokensOf(pattern) {
  const key = String(pattern);
  let tokens = cache.get(key);
  if (tokens === undefined) {
    tokens = parsePattern(key).tokens;
    if (cache.size >= CACHE_LIMIT) cache.clear();
    cache.set(key, tokens);
  }
  return tokens;
}

function tokenMatches(token, ch) {
  if (token.type === "any") return true;
  if (token.type === "lit") return token.ch === ch;
  if (token.type === "class") {
    let inside = false;
    for (const range of token.ranges) {
      if (range[0] <= ch && ch <= range[1]) { inside = true; break; }
    }
    return token.negated ? !inside : inside;
  }
  return false;
}

// 星号空跳闭包：star 不消耗字符，状态可直接越过它。
function closure(tokens, states, active) {
  for (let i = 0; i < active.length; i++) {
    const pos = active[i];
    if (pos < tokens.length && tokens[pos].type === "star" && !states[pos + 1]) {
      states[pos + 1] = true;
      active.push(pos + 1);
    }
  }
}

export function isMatch(pattern, text) {
  const tokens = tokensOf(pattern);
  const target = String(text);
  const count = tokens.length;
  let current = new Array(count + 1).fill(false);
  let spare = new Array(count + 1).fill(false);
  current[0] = true;
  let active = [0];
  closure(tokens, current, active);
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    const next = spare;
    const nextActive = [];
    for (const pos of active) {
      if (pos >= count) continue;
      if (tokens[pos].type === "star") {
        if (!next[pos]) { next[pos] = true; nextActive.push(pos); } // 星号消耗任意字符并停留原地
      } else if (!next[pos + 1] && tokenMatches(tokens[pos], ch)) {
        next[pos + 1] = true;
        nextActive.push(pos + 1);
      }
    }
    closure(tokens, next, nextActive);
    if (nextActive.length === 0) return false;
    for (const pos of active) current[pos] = false; // 只复位被动过的格子
    spare = current;
    current = next;
    active = nextActive;
  }
  return current[count];
}

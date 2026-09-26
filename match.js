// match.js：NFA 状态集匹配，每个文本字符只推进一次状态集合，无指数级回溯
import { parsePattern } from "./pattern.js";

function tokenAccepts(token, ch, cp) {
  if (token.type === "any") return true;
  if (token.type === "char") return token.value === ch;
  if (token.type === "class") {
    const inside = token.set.has(cp);
    return token.negate ? !inside : inside;
  }
  return false;
}

// 星号的空跳：站在星号记号上即可零宽走到它后面，链式星号一次扫描补齐
function closeStars(states, tokens) {
  for (let k = 0; k < tokens.length; k += 1) {
    if (states[k] === 1 && tokens[k].type === "star") states[k + 1] = 1;
  }
}

export function isMatch(pattern, text) {
  const parsed = parsePattern(pattern);
  const tokens = parsed.tokens;
  const count = tokens.length;

  let states = new Uint8Array(count + 1);
  states[0] = 1;
  closeStars(states, tokens);

  for (const ch of String(text)) {
    const cp = ch.codePointAt(0);
    const next = new Uint8Array(count + 1);
    for (let k = 0; k < count; k += 1) {
      if (states[k] !== 1) continue;
      const token = tokens[k];
      if (token.type === "star") {
        next[k] = 1; // 星号消费一个字符后仍停在自身，可继续消费
      } else if (tokenAccepts(token, ch, cp)) {
        next[k + 1] = 1;
      }
    }
    closeStars(next, tokens); // 推进后补齐星号空跳
    states = next;
  }

  return states[count] === 1;
}

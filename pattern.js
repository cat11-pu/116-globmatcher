// pattern.js：把通配符模式切成记号序列
// 记号类型：star（*）/ any（?）/ char（字面量）/ class（字符组）
export function parsePattern(text) {
  const raw = String(text);
  const chars = Array.from(raw);
  const tokens = [];
  let i = 0;

  function badPattern() {
    const error = new Error("非法模式：" + raw);
    error.code = "E_BAD_PATTERN";
    throw error;
  }

  // 读取字符组内的一个字面成员（支持反斜杠转义）
  function readMember() {
    if (chars[i] === "\\") {
      if (i + 1 >= chars.length) badPattern();
      const ch = chars[i + 1];
      i += 2;
      return ch;
    }
    return chars[i++];
  }

  while (i < chars.length) {
    const ch = chars[i];
    if (ch === "*") {
      tokens.push({ type: "star" });
      i += 1;
    } else if (ch === "?") {
      tokens.push({ type: "any" });
      i += 1;
    } else if (ch === "\\") {
      if (i + 1 >= chars.length) badPattern();
      tokens.push({ type: "char", value: chars[i + 1] });
      i += 2;
    } else if (ch === "[") {
      i += 1;
      let negate = false;
      if (chars[i] === "!") {
        negate = true;
        i += 1;
      }
      const set = new Set();
      while (i < chars.length && chars[i] !== "]") {
        const low = readMember().codePointAt(0);
        if (chars[i] === "-" && i + 1 < chars.length && chars[i + 1] !== "]") {
          i += 1; // 跳过减号
          const high = readMember().codePointAt(0);
          for (let cp = low; cp <= high; cp += 1) set.add(cp);
        } else {
          set.add(low);
        }
      }
      if (i >= chars.length) badPattern(); // 方括号没有闭合
      i += 1; // 跳过 ]
      tokens.push({ type: "class", negate: negate, set: set });
    } else {
      tokens.push({ type: "char", value: ch });
      i += 1;
    }
  }

  return { tokens: tokens, raw: raw };
}

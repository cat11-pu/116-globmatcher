// pattern.js：模式解析，把模式切成记号序列。
// 记号：star（*）、any（?）、lit（普通字符或反斜杠转义出的字面字符）、
// class（方括号字符组，支持 a-c 范围与 [!...] 取反）。
function badPattern(message) {
  const error = new Error(message);
  error.code = "E_BAD_PATTERN";
  return error;
}

function parseClass(source, start) {
  let index = start + 1;
  let negated = false;
  if (source[index] === "!") {
    negated = true;
    index += 1;
  }
  const ranges = [];
  let first = true;
  while (index < source.length) {
    let ch = source[index];
    if (ch === "]" && !first) {
      return { token: { type: "class", negated: negated, ranges: ranges }, next: index + 1 };
    }
    first = false;
    if (ch === "\\") {
      index += 1;
      if (index >= source.length) throw badPattern("dangling backslash in character class");
      ch = source[index];
    }
    index += 1;
    if (source[index] === "-" && index + 1 < source.length && source[index + 1] !== "]") {
      let hi = source[index + 1];
      if (hi === "\\") {
        if (index + 2 >= source.length) throw badPattern("dangling backslash in character class");
        hi = source[index + 2];
        index += 1;
      }
      ranges.push([ch, hi]);
      index += 2;
    } else {
      ranges.push([ch, ch]);
    }
  }
  throw badPattern("unclosed character class");
}

export function parsePattern(text) {
  const source = String(text);
  const tokens = [];
  let index = 0;
  while (index < source.length) {
    const ch = source[index];
    if (ch === "*") {
      tokens.push({ type: "star" });
      index += 1;
    } else if (ch === "?") {
      tokens.push({ type: "any" });
      index += 1;
    } else if (ch === "\\") {
      index += 1;
      if (index >= source.length) throw badPattern("dangling backslash at end of pattern");
      tokens.push({ type: "lit", ch: source[index] });
      index += 1;
    } else if (ch === "[") {
      const parsed = parseClass(source, index);
      tokens.push(parsed.token);
      index = parsed.next;
    } else {
      tokens.push({ type: "lit", ch: ch });
      index += 1;
    }
  }
  return { tokens: tokens, raw: source };
}

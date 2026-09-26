// pattern.js：模式解析（基线：不解析，整串按字面看）
export function parsePattern(text) {
  return { tokens: [], raw: String(text) };
}

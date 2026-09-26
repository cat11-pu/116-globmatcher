// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  let onlyHit = false;
  parts.log.textContent = "模式与文本 " + (spec.pairs || []).length + " 对，点匹配看结果。";

  function draw() {
    const scene = Object.assign({}, spec, { only_hit: onlyHit });
    let view = null;
    try {
      view = render(scene);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    (spec.pairs || []).forEach(function (pair, spot) {
      const hit = view.results[spot];
      if (onlyHit && !hit) return;
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = pair.pattern + " 对 " + pair.text;
      row.appendChild(head);
      const mark = document.createElement("span");
      mark.className = "chip" + (hit ? " ok" : " bad");
      mark.textContent = hit ? "匹配" : "不匹配";
      row.appendChild(mark);
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "命中 " + view.hits + " 对，模式共 " + view.pattern_chars + " 个字符";
    parts.log.textContent = "最长模式 " + view.longest + " 个字符，非法写法会报 " + spec.bad_pattern_error_code;
  }

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "逐对匹配";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const filterButton = document.createElement("button");
  filterButton.textContent = "只看匹配上的";
  filterButton.addEventListener("click", function () {
    onlyHit = !onlyHit;
    filterButton.textContent = onlyHit ? "看全部配对" : "只看匹配上的";
    draw();
  });
  parts.controls.appendChild(filterButton);

  const label = document.createElement("label");
  label.textContent = "拿来试的模式";
  parts.controls.appendChild(label);

  const box = document.createElement("input");
  box.type = "text";
  box.value = "a*";
  box.addEventListener("input", function () {
    try {
      const scene = Object.assign({}, spec, { pairs: (spec.pairs || []).concat([{ pattern: box.value, text: "abc" }]) });
      const view = render(scene);
      parts.out.textContent = box.value + " 对 abc 的结果是 " + view.results[view.results.length - 1];
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
    }
  });
  parts.controls.appendChild(box);

  const readButton = document.createElement("button");
  readButton.textContent = "只看命中数";
  readButton.addEventListener("click", function () {
    const scene = Object.assign({}, spec, { only_hit: onlyHit });
    const view = render(scene);
    parts.out.textContent = "命中 " + view.hits + " 对，带星号 " + view.star_count
      + " 条，带字符组 " + view.class_count + " 条";
  });
  parts.controls.appendChild(readButton);

  draw();
}

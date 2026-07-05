const steps = {
  start: { q: "① AC100V入力はありますか？", yes: "dc_power", no: "r_ac" },
  dc_power: { q: "② メイン電源DC出力 12V / 24V はありますか？", yes: "led_input", no: "r_power" },
  led_input: { q: "③ LED昇圧基板の入力電圧はありますか？", yes: "boost_output", no: "r_input" },
  boost_output: { q: "④ LED昇圧基板の出力電圧 40〜60V付近はありますか？", yes: "led_voltage", no: "gnd_check" },
  gnd_check: { q: "⑤ モニター裏鉄板・GND・アース接続は正常ですか？", yes: "r_boost", no: "r_gnd" },
  led_voltage: { q: "⑥ LEDバーのコネクタ部まで電圧は届いていますか？", yes: "led_bar", no: "r_led_wire" },
  led_bar: { q: "⑦ LEDバー単体は点灯しますか？", yes: "signal", no: "r_led_bar" },
  signal: { q: "⑧ BL_EN / PWM信号は出ていますか？", yes: "r_heat", no: "r_main" },
  r_ac: { result: "原因候補：AC100V入力不良\n確認：電源コード、ヒューズ、端子台、スイッチ、ACライン断線。" },
  r_power: { result: "原因候補：メイン電源基板不良\n確認：12V / 24V出力、ヒューズ、電解コンデンサ、焼損部品。" },
  r_input: { result: "原因候補：LED昇圧基板までの配線不良\n確認：コネクタ抜け、接触抵抗、端子焼け、配線断線。" },
  r_gnd: { result: "原因候補：GND・アース不良\nモニター裏鉄板との接続不良でLED昇圧基板が正常動作しない可能性があります。" },
  r_boost: { result: "原因候補：LED昇圧基板不良\n重点確認：MOSFET、昇圧インダクタ、電解コンデンサ、R8/R9、ダイオード、ハンダクラック。" },
  r_led_wire: { result: "原因候補：LEDバー配線・コネクタ不良\n確認：LEDコネクタ、細い配線、圧着部、導通、接触抵抗。" },
  r_led_bar: { result: "原因候補：LEDバー不良\n確認：LED断線、劣化、発熱変色、はんだ割れ、バー内部断線。" },
  r_main: { result: "原因候補：メイン基板・制御信号不良\n確認：BL_EN、PWM、LVDS、制御IC、信号線断線。" },
  r_heat: { result: "原因候補：熱劣化・間欠不良\n確認：MOSFET温度、インダクタ温度、電解コンデンサESR、カバー内熱だまり、アース接触。" }
};

let current = "start";
let historyStack = [];

function renderDiagnosis() {
  const step = steps[current];
  const q = document.getElementById("question");
  const b = document.getElementById("diagnosisButtons");
  if (step.result) {
    q.textContent = "診断結果";
    b.innerHTML = `<div class="result">${step.result}</div><button class="back" onclick="goBack()">戻る</button><button class="reset" onclick="resetDiagnosis()">最初から</button>`;
  } else {
    q.textContent = step.q;
    b.innerHTML = `<button class="yes" onclick="answer('yes')">はい</button><button class="no" onclick="answer('no')">いいえ</button><button class="back" onclick="goBack()">戻る</button><button class="reset" onclick="resetDiagnosis()">最初から</button>`;
  }
}
function answer(ans) { historyStack.push(current); current = steps[current][ans]; renderDiagnosis(); }
function goBack() { if (historyStack.length) { current = historyStack.pop(); renderDiagnosis(); } }
function resetDiagnosis() { current = "start"; historyStack = []; renderDiagnosis(); }

function val(id) { return parseFloat(document.getElementById(id).value); }
function tempJudge() {
  const outside = val("tOutside");
  const top = val("tTop");
  const mosfet = val("tMosfet");
  const ind = val("tInductor");
  const cap = val("tCap");
  let msg = "温度判定\n";
  if (!isNaN(outside) && !isNaN(top)) msg += `ケース上部−外気温：${(top - outside).toFixed(1)}℃\n`;
  if (!isNaN(mosfet)) msg += mosfet >= 80 ? "MOSFET：危険域。放熱・負荷・基板劣化確認。\n" : mosfet >= 70 ? "MOSFET：注意。寿命低下リスクあり。\n" : "MOSFET：概ね良好。\n";
  if (!isNaN(ind)) msg += ind >= 90 ? "インダクタ：高温。巻線・コア損失・換気不足確認。\n" : ind >= 75 ? "インダクタ：注意。\n" : "インダクタ：概ね良好。\n";
  if (!isNaN(cap)) msg += cap >= 70 ? "電解コンデンサ：寿命短縮リスク大。105℃長寿命品を検討。\n" : cap >= 60 ? "電解コンデンサ：注意。\n" : "電解コンデンサ：概ね良好。\n";
  document.getElementById("tempResult").textContent = msg;
}

function makeReport() {
  const report = `修理報告書\n\n設置先：${document.getElementById("siteName").value}\n機番：${document.getElementById("machineNo").value}\n作業者：${document.getElementById("worker").value}\n作業日：${document.getElementById("workDate").value}\n\n作業内容：\n${document.getElementById("workContent").value}\n\n診断結果：\n${steps[current].result || steps[current].q}\n\n写真メモ：\n${document.getElementById("photoMemo").value}`;
  document.getElementById("reportOutput").value = report;
}

function calcEstimate() {
  const prices = { boost: 8500, led: 7500, wire: 3500, check: 3000 };
  const total = (document.getElementById("qtyBoost").value || 0) * prices.boost +
                (document.getElementById("qtyLed").value || 0) * prices.led +
                (document.getElementById("qtyWire").value || 0) * prices.wire +
                (document.getElementById("qtyCheck").value || 0) * prices.check;
  document.getElementById("estimateResult").textContent = `概算見積：${total.toLocaleString()}円\n※単価は仮設定です。実際の部品代・作業単価に合わせてscript.js内で変更できます。`;
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.target).classList.add("active");
  });
});

document.getElementById("photoInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = document.getElementById("preview");
  img.src = URL.createObjectURL(file);
  img.style.display = "block";
});

document.getElementById("tempJudgeBtn").addEventListener("click", tempJudge);
document.getElementById("makeReportBtn").addEventListener("click", makeReport);
document.getElementById("calcEstimateBtn").addEventListener("click", calcEstimate);

renderDiagnosis();

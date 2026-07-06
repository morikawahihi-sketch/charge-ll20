const screens=[...document.querySelectorAll('.screen')];
const troubleItems=['LED点灯しない','LED点灯しない（部分的）','モニター画像が乱れる','モニター画像が映らない','スロット・カセットを取り出せない','スロット・カセットを戻しても認識しない','充電できない','通信異常','再起動を繰り返す','ブレーカーが落ちる'];
function openScreen(id){screens.forEach(s=>s.classList.toggle('active',s.id===id));scrollTo({top:0,behavior:'smooth'});}
document.getElementById('homeBtn').onclick=()=>openScreen('home');
document.querySelectorAll('[data-open]').forEach(btn=>btn.addEventListener('click',()=>{const id=btn.dataset.open;if(id==='diag'){startDiag(btn.dataset.title)}else openScreen(id);}));
const troubleSelect=document.getElementById('rTrouble'); if(troubleSelect){troubleItems.forEach(t=>{const o=document.createElement('option');o.textContent=t;troubleSelect.appendChild(o);});}

const flows={
'LED点灯しない':['AC100V入力はありますか？','電源基板からDC12V/24Vは出ていますか？','LED昇圧基板の入力電圧はありますか？','LED出力電圧は出ていますか？','LEDバー単体は点灯しますか？'],
'LED点灯しない（部分的）':['不点灯範囲は同じLEDバー内ですか？','コネクタを挿し直すと変化しますか？','LEDバーに焼け・変色がありますか？','LED昇圧基板の出力が不安定ですか？'],
'モニター画像が乱れる':['フラットケーブルを挿し直すと改善しますか？','メイン基板コネクタに汚れ・曲がりがありますか？','電源電圧に大きな変動がありますか？','モニター基板または液晶側の不良が疑われますか？'],
'モニター画像が映らない':['バックライトは点灯していますか？','メイン基板から映像信号は出ていますか？','フラットケーブルに折れ・抜けがありますか？','液晶パネルを交換すると映りますか？'],
'スロット・カセットを取り出せない':['ロック機構に異物がありますか？','電源再投入で解除されますか？','カセット検知スイッチは反応していますか？','機構部の変形・摩耗がありますか？'],
'スロット・カセットを戻しても認識しない':['カセット検知スイッチは押されていますか？','端子・コネクタに汚れがありますか？','スロット制御基板に電源はありますか？','別カセットで認識しますか？'],
'充電できない':['充電端子に電圧がありますか？','端子に汚れ・摩耗がありますか？','カセット側で同じ症状が出ますか？','制御基板の出力がありませんか？'],
'通信異常':['SIM/通信モジュールは認識していますか？','アンテナ線の抜けはありませんか？','電波環境を変えると改善しますか？','メイン基板再起動後も通信不可ですか？'],
'再起動を繰り返す':['AC100V入力が安定していますか？','DC電源が瞬断していませんか？','LED昇圧基板を外すと安定しますか？','メイン基板・電源基板に高温部品がありますか？'],
'ブレーカーが落ちる':['絶縁抵抗に異常がありますか？','AC入力部に水分・汚れがありますか？','電源基板を外すと落ちませんか？','配線被覆の傷・ショート痕がありますか？']
};
let flowState={title:'',idx:0,answers:[]};
function startDiag(title){flowState={title,idx:0,answers:[]};document.getElementById('diagTitle').textContent=title+' 診断';renderFlow();openScreen('diag');}
function renderFlow(){const box=document.getElementById('diagFlow'), qs=flows[flowState.title]||[]; if(flowState.idx>=qs.length){const yes=flowState.answers.filter(a=>a==='はい').length;let msg='確認完了。'; if(yes>=3) msg='該当部品・配線・基板不良の可能性が高いです。基板写真でコネクタ、発熱、焼損を確認してください。'; else msg='症状の再現条件を確認し、写真保存・温度記録を残してください。'; box.innerHTML=`<div class="resultbox"><b>診断結果</b><br>${msg}<br><br>回答：${flowState.answers.join(' / ')}</div><button onclick="startDiag('${flowState.title}')">最初からやり直す</button>`; return;} box.innerHTML=`<div class="q">${qs[flowState.idx]}</div><div class="actions"><button onclick="answerFlow('はい')">はい</button><button class="ghost" onclick="answerFlow('いいえ')">いいえ</button></div>`;}
function answerFlow(ans){flowState.answers.push(ans);flowState.idx++;renderFlow();}
window.answerFlow=answerFlow; window.startDiag=startDiag;

// 基板写真拡大
const modal=document.getElementById('modal'), modalImg=document.getElementById('modalImg');
document.querySelectorAll('.zoomable').forEach(img=>img.onclick=()=>{modalImg.src=img.src;modal.classList.add('active');});
document.getElementById('closeModal').onclick=()=>modal.classList.remove('active'); modal.onclick=e=>{if(e.target===modal)modal.classList.remove('active');};

// 写真保存
const photoInput=document.getElementById('photoInput'), photoList=document.getElementById('photoList');
function loadPhotos(){photoList.innerHTML=''; JSON.parse(localStorage.photos||'[]').forEach(src=>{const img=new Image();img.src=src;photoList.appendChild(img);});}
if(photoInput){photoInput.onchange=e=>{const arr=JSON.parse(localStorage.photos||'[]');[...e.target.files].forEach(f=>{const r=new FileReader();r.onload=()=>{arr.push(r.result);localStorage.photos=JSON.stringify(arr);loadPhotos();};r.readAsDataURL(f);});};document.getElementById('clearPhotos').onclick=()=>{localStorage.removeItem('photos');loadPhotos();};loadPhotos();}

// 温度記録
function tempJudge(v){v=Number(v); if(v>=80)return '<span class="tag-danger">高温注意</span>'; if(v>=65)return '<span class="tag-warn">要注意</span>'; return '<span class="tag-ok">正常範囲</span>';}
function loadTemps(){const tbody=document.getElementById('tempRows'); if(!tbody)return; tbody.innerHTML=''; JSON.parse(localStorage.temps||'[]').forEach(r=>tbody.insertAdjacentHTML('beforeend',`<tr><td>${r.time}</td><td>${r.point}</td><td>${r.val}</td><td>${tempJudge(r.val)}</td><td>${r.memo}</td></tr>`));}
const addTemp=document.getElementById('addTemp'); if(addTemp){addTemp.onclick=()=>{const arr=JSON.parse(localStorage.temps||'[]');arr.push({time:new Date().toLocaleString(),point:tempPoint.value,val:tempValue.value,memo:tempMemo.value});localStorage.temps=JSON.stringify(arr);loadTemps();};clearTemps.onclick=()=>{localStorage.removeItem('temps');loadTemps();};loadTemps();}

// 報告書
const makeReport=document.getElementById('makeReport'); if(makeReport){rDate.valueAsDate=new Date();makeReport.onclick=()=>{reportPreview.innerHTML=`<h2>修理報告書</h2><p><b>日付：</b>${rDate.value}</p><p><b>作業者：</b>${rWorker.value}</p><p><b>機器番号：</b>${rSerial.value}</p><p><b>設置場所：</b>${rPlace.value}</p><p><b>故障内容：</b>${rTrouble.value}</p><hr><p><b>原因・診断結果</b><br>${rCause.value.replaceAll('\n','<br>')}</p><p><b>修理内容</b><br>${rWork.value.replaceAll('\n','<br>')}</p><p><b>交換部品</b><br>${rParts.value.replaceAll('\n','<br>')}</p><p><b>備考</b><br>${rMemo.value.replaceAll('\n','<br>')}</p>`;};printReport.onclick=()=>window.print();}

// 見積
let estimate=[];function renderEstimate(){estimateRows.innerHTML='';let total=0;estimate.forEach(e=>{const sum=e.qty*e.price;total+=sum;estimateRows.insertAdjacentHTML('beforeend',`<tr><td>${e.item}</td><td>${e.qty}</td><td>${e.price.toLocaleString()}円</td><td>${sum.toLocaleString()}円</td></tr>`);});estimateTotal.textContent='合計：'+total.toLocaleString()+'円';}
const addEstimate=document.getElementById('addEstimate'); if(addEstimate){addEstimate.onclick=()=>{estimate.push({item:eItem.value,qty:Number(eQty.value||1),price:Number(ePrice.value||0)});renderEstimate();};clearEstimate.onclick=()=>{estimate=[];renderEstimate();};}

// AI推定
const runAi=document.getElementById('runAi'); if(runAi){runAi.onclick=()=>{const vals=[...document.querySelectorAll('#ai input:checked')].map(i=>i.value);let out=''; if(vals.includes('LED昇圧基板入力あり出力なし')) out+='LED昇圧基板不良、MOSFET、コイル、ダイオード、電解コンデンサ劣化を優先確認。<br>'; if(vals.includes('GNDアース不良')) out+='GND/アース接続不良の可能性。固定ネジ部、メッキ部、鉄板接触を確認。<br>'; if(vals.includes('BL_EN/PWMなし')) out+='メイン基板側の制御信号、フラットケーブル、コネクタを確認。<br>'; if(vals.includes('AC100Vなし')) out+='AC入力、ヒューズ、ブレーカー、漏電を確認。<br>'; aiResult.innerHTML=out||'選択内容からは断定できません。写真・温度・電圧を記録して比較してください。';};}

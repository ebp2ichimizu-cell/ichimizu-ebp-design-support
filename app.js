(() => {
  const $ = (id) => document.getElementById(id);
  const form = $("ebpForm"), formView = $("formView"), reviewView = $("reviewView");
  const reviewFields = $("reviewFields"), scanSummary = $("scanSummary");
  const warningBlock = $("warningBlock"), highRiskBlock = $("highRiskBlock");
  const warningAck = $("warningAck"), copyBtn = $("copyBtn"), copyStatus = $("copyStatus");

  const fields = [
    ["issue","現場の課題"],["target","対象・場所"],["known","現在分かっていること"],
    ["currentMeasures","現在実施している対策"],["ideas","現在考えている対策"],
    ["outcome","期待する変化"],["data","利用可能なデータ"],
    ["constraints","人員・期間・予算等の制約"],["other","その他の現場事情"]
  ];

  const highRiskRules = [
    {label:"メールアドレス",re:/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi},
    {label:"電話番号らしい文字列",re:/(?:\+81[-\s]?)?(?:0\d{1,4}[-\s]?\d{1,4}[-\s]?\d{3,4})/g},
    {label:"郵便番号",re:/〒?\s?\d{3}[-ー]\d{4}/g},
    {label:"詳細住所らしい表現",re:/(?:都|道|府|県).{0,20}(?:市|区|町|村).{0,30}\d{1,4}(?:番地?|丁目|[-ー]\d)/g}
  ];
  const warningKeywords = ["氏名","実名","住所","電話番号","メールアドレス","生年月日","被疑者","容疑者","被害者","参考人","逮捕","任意同行","捜査中","捜査情報","捜査手法","内偵","張り込み","尾行","令状","未公表","非公開","内部資料","部外秘","秘匿","秘密","事件番号","整理番号","受理番号","照会番号"];

  function getData(){const o={};for(const [id] of fields)o[id]=$(id).value.trim();return o}
  function scanText(text){
    const high=[],warn=[];
    highRiskRules.forEach(rule=>{rule.re.lastIndex=0;const m=[...text.matchAll(rule.re)];if(m.length)high.push(`${rule.label}（${m.length}件候補）`)});
    warningKeywords.forEach(k=>{if(text.includes(k))warn.push(`注意語「${k}」`)});
    return {high,warn};
  }
  function esc(s){return String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
  function renderReview(data){
    let totalHigh=0,totalWarn=0; reviewFields.innerHTML="";
    for(const [id,label] of fields){
      const value=data[id]||"未入力", r=scanText(data[id]||""); totalHigh+=r.high.length; totalWarn+=r.warn.length;
      const cls=r.high.length?"flag-high":r.warn.length?"flag-warn":"";
      const badge=r.high.length?'<span class="badge high">修正候補</span>':r.warn.length?'<span class="badge warn">要確認</span>':'<span class="badge ok">検出なし</span>';
      const findings=[...r.high,...r.warn];
      reviewFields.insertAdjacentHTML("beforeend",`<article class="review-item ${cls}"><div class="review-label"><span>${esc(label)}</span>${badge}</div><p class="review-text">${esc(value)}</p>${findings.length?`<ul class="findings">${findings.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:""}</article>`);
    }
    scanSummary.innerHTML=`<div class="scan-chip ${totalHigh?"block":"ok"}"><strong>${totalHigh?"修正候補あり":"明確な個人情報候補なし"}</strong><span>電話・メール・郵便番号・詳細住所等</span></div><div class="scan-chip ${totalWarn?"warn":"ok"}"><strong>${totalWarn?"要確認":"機微情報注意語なし"}</strong><span>捜査・未公表・秘密情報等の注意語</span></div><div class="scan-chip warn"><strong>最終確認は利用者</strong><span>自動スキャンですべてを検出できるわけではありません</span></div>`;
    highRiskBlock.classList.toggle("hidden",totalHigh===0);
    warningBlock.classList.toggle("hidden",totalWarn===0||totalHigh>0);
    warningAck.checked=false;
    copyBtn.disabled=totalHigh>0||totalWarn>0;
  }

  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    if(!$("issue").value.trim()){ $("issue").setCustomValidity("現場の課題を入力してください。"); $("issue").reportValidity(); $("issue").setCustomValidity(""); $("issue").focus(); return; }
    renderReview(getData()); formView.classList.add("hidden"); reviewView.classList.remove("hidden"); copyStatus.textContent="";
    window.scrollTo({top:reviewView.offsetTop-16,behavior:"smooth"});
  });

  warningAck.addEventListener("change",()=>{ if(!highRiskBlock.classList.contains("hidden")){copyBtn.disabled=true;return} copyBtn.disabled=!warningAck.checked; });
  $("backBtn").addEventListener("click",()=>{ reviewView.classList.add("hidden"); formView.classList.remove("hidden"); copyStatus.textContent=""; window.scrollTo({top:formView.offsetTop-16,behavior:"smooth"}); });
  $("clearBtn").addEventListener("click",()=>{ if(confirm("入力内容をすべて消去しますか？")){form.reset();$("issue").focus();} });

  copyBtn.addEventListener("click",async()=>{
    const data=getData(), whole=Object.values(data).join("\n"), check=scanText(whole);
    if(check.high.length){copyStatus.textContent="明確な個人情報候補が検出されたためコピーできません。入力内容を修正してください。";return;}
    if(check.warn.length&&!warningAck.checked){copyStatus.textContent="注意事項を確認し、チェックを入れてからコピーしてください。";return;}
    const prompt=window.buildMasterPrompt(data);
    try{await navigator.clipboard.writeText(prompt);copyStatus.textContent="コピーしました。利用中のAIの新しいチャットに貼り付けて開始してください。";}
    catch(err){
      const ta=document.createElement("textarea");ta.value=prompt;ta.setAttribute("readonly","");ta.style.position="absolute";ta.style.left="-9999px";document.body.appendChild(ta);ta.select();
      const ok=document.execCommand("copy");document.body.removeChild(ta);
      copyStatus.textContent=ok?"コピーしました。利用中のAIの新しいチャットに貼り付けて開始してください。":"自動コピーに失敗しました。ブラウザの権限設定を確認してください。";
    }
  });
})();
(() => {
  const $ = (id) => document.getElementById(id);
  const fieldIds = ["issue","target","known","currentMeasures","ideas","outcome","data","constraints","other"];
  const HUB_BASE = "https://ebp2ichimizu-cell.github.io/ichimizu-research-hub-github/#/studies?q=";
  const OVERSEAS_PROBLEM_BASE = "https://ebp2ichimizu-cell.github.io/overseas-ebp-jp-nav/#/problems?q=";
  const OVERSEAS_INTERVENTION_BASE = "https://ebp2ichimizu-cell.github.io/overseas-ebp-jp-nav/#/interventions?q=";

  function allInputText(){
    return fieldIds.map(id => ($(id)?.value || "").trim()).filter(Boolean).join("\n");
  }
  function uniq(items){return [...new Set(items.map(x=>String(x).trim()).filter(Boolean))]}
  function splitTerms(s){
    return uniq(String(s||"").split(/[、,，;；\n]/).map(x=>x.replace(/^[-・*]\s*/,"").trim()).filter(Boolean));
  }
  function openSearch(base, query){
    if(!query) return;
    window.open(base + encodeURIComponent(query), "_blank", "noopener,noreferrer");
  }
  async function copyText(text, statusEl, doneText){
    if(!text){statusEl.textContent="コピーする検索語がありません。";return;}
    try{await navigator.clipboard.writeText(text);statusEl.textContent=doneText;}
    catch(_){
      const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.left="-9999px";document.body.appendChild(ta);ta.select();
      const ok=document.execCommand("copy");ta.remove();statusEl.textContent=ok?doneText:"コピーに失敗しました。";
    }
  }
  function renderChoices(container, items, group){
    container.innerHTML="";
    if(!items.length){container.innerHTML='<span class="empty-note">該当する候補はありません。必要に応じて検索語を追加してください。</span>';return;}
    items.forEach((item,i)=>{
      const label=document.createElement("label");label.className="tag-choice";
      const cb=document.createElement("input");cb.type="checkbox";cb.checked=true;cb.dataset.bridgeGroup=group;cb.value=item;cb.id=`kb-${group}-${i}`;
      const span=document.createElement("span");span.textContent=item;
      label.append(cb,span);container.append(label);
    });
  }
  function selectedBridgeTerms(){
    const checked=[...document.querySelectorAll('#bridgeResults input[type="checkbox"]:checked')].map(x=>x.value);
    return uniq([...checked,...splitTerms($("bridgeExtra")?.value||"")]);
  }
  function refreshBridgeButtons(){
    const terms=selectedBridgeTerms();
    window.ICHIMIZU_BRIDGE_TERMS=terms;
    const enabled=terms.length>0;
    ["bridgeCopyBtn","bridgeHubBtn","bridgeOverseasProblemBtn","bridgeOverseasInterventionBtn"].forEach(id=>{if($(id))$(id).disabled=!enabled});
  }
  function runBridge(){
    const text=allInputText();
    const status=$("bridgeStatus");
    if(!text){status.textContent="まず上の入力欄に、現場の課題などを入力してください。";return;}
    const src=(window.ICHIMIZU_KNOWLEDGE_BRIDGE||[]);
    const hit=src.filter(row=>(row.match||[]).some(k=>text.toLowerCase().includes(String(k).toLowerCase())));
    const problems=uniq(hit.flatMap(x=>x.problems||[]));
    const mechanisms=uniq(hit.flatMap(x=>x.mechanisms||[]));
    const theories=uniq(hit.flatMap(x=>x.theories||[]));
    const interventions=uniq(hit.flatMap(x=>x.interventions||[]));
    renderChoices($("bridgeProblems"),problems,"problems");
    renderChoices($("bridgeMechanisms"),mechanisms,"mechanisms");
    renderChoices($("bridgeTheories"),theories,"theories");
    renderChoices($("bridgeInterventions"),interventions,"interventions");
    $("bridgeResults").classList.remove("hidden");
    status.textContent=hit.length?`入力内容から${hit.length}系統の候補を整理しました。不要な候補はチェックを外してください。`:
      "既登録の対応語では十分に整理できませんでした。問題を言い換えるか、検索語を追加してください。";
    refreshBridgeButtons();
  }

  $("bridgeRunBtn")?.addEventListener("click",runBridge);
  $("bridgeResults")?.addEventListener("change",refreshBridgeButtons);
  $("bridgeExtra")?.addEventListener("input",refreshBridgeButtons);
  $("bridgeCopyBtn")?.addEventListener("click",()=>copyText(selectedBridgeTerms().join("\n"),$("bridgeStatus"),"選択した検索語をコピーしました。"));
  $("bridgeHubBtn")?.addEventListener("click",()=>openSearch(HUB_BASE,selectedBridgeTerms().slice(0,4).join(" ")));
  $("bridgeOverseasProblemBtn")?.addEventListener("click",()=>openSearch(OVERSEAS_PROBLEM_BASE,selectedBridgeTerms().slice(0,4).join(" ")));
  $("bridgeOverseasInterventionBtn")?.addEventListener("click",()=>openSearch(OVERSEAS_INTERVENTION_BASE,selectedBridgeTerms().slice(0,4).join(" ")));

  function extractBlock(text){
    const m=String(text||"").match(/\[EBP_CHECK\]([\s\S]*?)\[\/EBP_CHECK\]/i);
    return m?m[1].trim():String(text||"").trim();
  }
  function parseLabeledBlock(text){
    const block=extractBlock(text);
    const lines=block.split(/\r?\n/);
    const labels={
      interventions:["施策候補","interventions","intervention options"],
      ja:["検索キーワード_日本語","検索キーワード（日本語）","日本語検索語","japanese keywords"],
      en:["検索キーワード_英語","検索キーワード（英語）","英語検索語","english keywords"],
      concepts:["関連概念","関連理論","concepts","related concepts"],
      refs:["確認対象文献","参考文献候補","references","sources to verify"]
    };
    const out={interventions:[],keywords:[],concepts:[],refs:[]};
    let current=null;
    function keyFor(line){
      const normalized=line.replace(/[：:]\s*$/,"" ).trim().toLowerCase();
      for(const [k,alts] of Object.entries(labels)) if(alts.some(a=>normalized===a.toLowerCase())) return k;
      return null;
    }
    for(const raw of lines){
      const line=raw.trim(); if(!line) continue;
      const direct=line.match(/^([^：:]{1,40})[：:]\s*(.*)$/);
      if(direct){
        const k=keyFor(direct[1]);
        if(k){current=k; if(direct[2]) add(k,direct[2]); continue;}
      }
      const k=keyFor(line);
      if(k){current=k;continue;}
      if(current) add(current,line.replace(/^[-・*]\s*/,""));
    }
    function add(k,val){
      if(!val) return;
      const values=(k==="refs")?[val]:splitTerms(val);
      if(k==="ja"||k==="en") out.keywords.push(...values);
      else out[k].push(...values);
    }
    out.interventions=uniq(out.interventions);out.keywords=uniq(out.keywords);out.concepts=uniq(out.concepts);out.refs=uniq(out.refs);
    const doiMatches=uniq([...block.matchAll(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi)].map(m=>m[0].replace(/[.,;)]+$/,"")));
    const urlMatches=uniq([...block.matchAll(/https?:\/\/[^\s<>()]+/gi)].map(m=>m[0].replace(/[.,;)]+$/,"")));
    out.refs=uniq([...out.refs,...doiMatches.map(x=>`DOI: ${x}`),...urlMatches]);
    if(!out.keywords.length && !out.concepts.length){
      const mapped=(window.ICHIMIZU_KNOWLEDGE_BRIDGE||[]).filter(row=>(row.match||[]).some(k=>block.toLowerCase().includes(String(k).toLowerCase())));
      out.keywords=uniq(mapped.flatMap(x=>[...(x.problems||[]),...(x.interventions||[])]));
      out.concepts=uniq(mapped.flatMap(x=>[...(x.mechanisms||[]),...(x.theories||[])]));
    }
    return out;
  }
  function renderPlainTags(el,items){
    el.innerHTML="";
    if(!items.length){el.innerHTML='<span class="empty-note">抽出できませんでした。</span>';return;}
    items.forEach(item=>{const span=document.createElement("span");span.className="tag-choice";span.textContent=item;el.append(span)});
  }
  let evidenceState={interventions:[],keywords:[],concepts:[],refs:[]};
  function evidenceSearchTerms(){return uniq([...evidenceState.interventions,...evidenceState.keywords,...evidenceState.concepts]).slice(0,8)}
  function parseEvidence(){
    const raw=$("evidencePaste").value.trim(), status=$("evidenceStatus");
    if(!raw){status.textContent="AI回答またはEBP確認用ブロックを貼り付けてください。";return;}
    evidenceState=parseLabeledBlock(raw);
    renderPlainTags($("evidenceInterventions"),evidenceState.interventions);
    renderPlainTags($("evidenceKeywords"),evidenceState.keywords);
    renderPlainTags($("evidenceConcepts"),evidenceState.concepts);
    const refs=$("evidenceReferences");refs.innerHTML="";
    if(!evidenceState.refs.length) refs.innerHTML='<span class="empty-note">文献名・DOI・URLを抽出できませんでした。AI回答の原典情報を確認してください。</span>';
    else evidenceState.refs.forEach(x=>{const d=document.createElement("div");d.className="reference-item";d.textContent=x;refs.append(d)});
    $("evidenceResults").classList.remove("hidden");
    const enabled=evidenceSearchTerms().length>0;
    ["evidenceHubBtn","evidenceOverseasProblemBtn","evidenceOverseasInterventionBtn","evidenceCopyBtn"].forEach(id=>$(id).disabled=!enabled);
    status.textContent=/\[EBP_CHECK\]/i.test(raw)?"EBP確認用ブロックを整理しました。原典確認へ進んでください。":"回答全体から簡易抽出しました。精度を上げるにはAI回答末尾の [EBP_CHECK] ブロックを貼り付けてください。";
  }
  $("evidenceParseBtn")?.addEventListener("click",parseEvidence);
  $("evidenceClearBtn")?.addEventListener("click",()=>{$("evidencePaste").value="";$("evidenceResults").classList.add("hidden");$("evidenceStatus").textContent="";evidenceState={interventions:[],keywords:[],concepts:[],refs:[]}});
  $("evidenceHubBtn")?.addEventListener("click",()=>openSearch(HUB_BASE,evidenceSearchTerms().slice(0,4).join(" ")));
  $("evidenceOverseasProblemBtn")?.addEventListener("click",()=>openSearch(OVERSEAS_PROBLEM_BASE,evidenceSearchTerms().slice(0,4).join(" ")));
  $("evidenceOverseasInterventionBtn")?.addEventListener("click",()=>openSearch(OVERSEAS_INTERVENTION_BASE,evidenceSearchTerms().slice(0,4).join(" ")));
  $("evidenceCopyBtn")?.addEventListener("click",()=>copyText(evidenceSearchTerms().join("\n"),$("evidenceStatus"),"確認用の検索語をコピーしました。"));
  // Knowledge Bridgeで利用者が残した候補を、生成プロンプトにも補助情報として渡す。
  // 原因・施策の確定情報ではなく、検索候補であることを明示する。
  const baseBuildMasterPrompt=window.buildMasterPrompt;
  if(typeof baseBuildMasterPrompt==="function"){
    window.buildMasterPrompt=function(data){
      let prompt=baseBuildMasterPrompt(data);
      const terms=uniq(window.ICHIMIZU_BRIDGE_TERMS||[]);
      if(!terms.length) return prompt;
      const bridge=`# Knowledge Bridge｜利用者が確認した検索候補\n以下はブラウザ内の簡易マッピングから利用者が残した検索候補です。問題の原因、理論の適用、施策の有効性を確定する情報ではありません。Stage 1〜3の検索語拡張に利用し、実際の問題構造・原典確認により修正してください。\n\n${terms.map(x=>`- ${x}`).join("\n")}\n\n---\n\n`;
      const marker="# いちみず会関連ページ・URL台帳";
      return prompt.includes(marker)?prompt.replace(marker,bridge+marker):prompt+"\n\n"+bridge;
    };
  }

})();

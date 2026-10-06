(() => {
  const $ = (id) => document.getElementById(id);
  const HUB_BASE = "https://ebp2ichimizu-cell.github.io/ichimizu-research-hub-github/#/studies?q=";
  const OVERSEAS_PROBLEM_BASE = "https://ebp2ichimizu-cell.github.io/overseas-ebp-jp-nav/#/problems?q=";
  const OVERSEAS_INTERVENTION_BASE = "https://ebp2ichimizu-cell.github.io/overseas-ebp-jp-nav/#/interventions?q=";

  function uniq(items){
    return [...new Set(items.map(x=>String(x).trim()).filter(Boolean))];
  }

  function splitTerms(s){
    return uniq(String(s||"")
      .split(/[、,，;；\n]/)
      .map(x=>x.replace(/^[-・*]\s*/,"").trim())
      .filter(Boolean));
  }

  function openSearch(base, query){
    if(!query) return;
    window.open(base + encodeURIComponent(query), "_blank", "noopener,noreferrer");
  }

  async function copyText(text, statusEl, doneText){
    if(!text){
      statusEl.textContent="コピーする検索語がありません。";
      return;
    }
    try{
      await navigator.clipboard.writeText(text);
      statusEl.textContent=doneText;
    }catch(_){
      const ta=document.createElement("textarea");
      ta.value=text;
      ta.style.position="fixed";
      ta.style.left="-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok=document.execCommand("copy");
      ta.remove();
      statusEl.textContent=ok?doneText:"コピーに失敗しました。";
    }
  }

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
      const normalized=line.replace(/[：:]\s*$/,"").trim().toLowerCase();
      for(const [k,alts] of Object.entries(labels)){
        if(alts.some(a=>normalized===a.toLowerCase())) return k;
      }
      return null;
    }

    function add(k,val){
      if(!val) return;
      const values=(k==="refs")?[val]:splitTerms(val);
      if(k==="ja"||k==="en") out.keywords.push(...values);
      else out[k].push(...values);
    }

    for(const raw of lines){
      const line=raw.trim();
      if(!line) continue;
      const direct=line.match(/^([^：:]{1,40})[：:]\s*(.*)$/);
      if(direct){
        const k=keyFor(direct[1]);
        if(k){
          current=k;
          if(direct[2]) add(k,direct[2]);
          continue;
        }
      }
      const k=keyFor(line);
      if(k){current=k;continue;}
      if(current) add(current,line.replace(/^[-・*]\s*/,""));
    }

    out.interventions=uniq(out.interventions);
    out.keywords=uniq(out.keywords);
    out.concepts=uniq(out.concepts);
    out.refs=uniq(out.refs);

    const doiMatches=uniq([...block.matchAll(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi)]
      .map(m=>m[0].replace(/[.,;)]+$/,"")));
    const urlMatches=uniq([...block.matchAll(/https?:\/\/[^\s<>()]+/gi)]
      .map(m=>m[0].replace(/[.,;)]+$/,"")));

    out.refs=uniq([
      ...out.refs,
      ...doiMatches.map(x=>`DOI: ${x}`),
      ...urlMatches
    ]);
    return out;
  }

  function renderPlainTags(el,items){
    el.innerHTML="";
    if(!items.length){
      el.innerHTML='<span class="empty-note">抽出できませんでした。</span>';
      return;
    }
    items.forEach(item=>{
      const span=document.createElement("span");
      span.className="tag-choice";
      span.textContent=item;
      el.append(span);
    });
  }

  let evidenceState={interventions:[],keywords:[],concepts:[],refs:[]};

  function evidenceSearchTerms(){
    return uniq([
      ...evidenceState.interventions,
      ...evidenceState.keywords,
      ...evidenceState.concepts
    ]).slice(0,8);
  }

  function parseEvidence(){
    const raw=$("evidencePaste")?.value.trim() || "";
    const status=$("evidenceStatus");
    if(!raw){
      status.textContent="AI回答またはEBP確認用ブロックを貼り付けてください。";
      return;
    }

    evidenceState=parseLabeledBlock(raw);
    renderPlainTags($("evidenceInterventions"),evidenceState.interventions);
    renderPlainTags($("evidenceKeywords"),evidenceState.keywords);
    renderPlainTags($("evidenceConcepts"),evidenceState.concepts);

    const refs=$("evidenceReferences");
    refs.innerHTML="";
    if(!evidenceState.refs.length){
      refs.innerHTML='<span class="empty-note">文献名・DOI・URLを抽出できませんでした。AI回答の原典情報を確認してください。</span>';
    }else{
      evidenceState.refs.forEach(x=>{
        const d=document.createElement("div");
        d.className="reference-item";
        d.textContent=x;
        refs.append(d);
      });
    }

    $("evidenceResults").classList.remove("hidden");
    const enabled=evidenceSearchTerms().length>0;
    ["evidenceHubBtn","evidenceOverseasProblemBtn","evidenceOverseasInterventionBtn","evidenceCopyBtn"]
      .forEach(id=>$(id).disabled=!enabled);

    status.textContent=/\[EBP_CHECK\]/i.test(raw)
      ?"EBP確認用ブロックを整理しました。原典確認へ進んでください。"
      :"回答全体から簡易抽出しました。精度を上げるにはAI回答末尾の [EBP_CHECK] ブロックを貼り付けてください。";
  }

  $("evidenceParseBtn")?.addEventListener("click",parseEvidence);
  $("evidenceClearBtn")?.addEventListener("click",()=>{
    $("evidencePaste").value="";
    $("evidenceResults").classList.add("hidden");
    $("evidenceStatus").textContent="";
    evidenceState={interventions:[],keywords:[],concepts:[],refs:[]};
  });
  $("evidenceHubBtn")?.addEventListener("click",()=>openSearch(HUB_BASE,evidenceSearchTerms().slice(0,4).join(" ")));
  $("evidenceOverseasProblemBtn")?.addEventListener("click",()=>openSearch(OVERSEAS_PROBLEM_BASE,evidenceSearchTerms().slice(0,4).join(" ")));
  $("evidenceOverseasInterventionBtn")?.addEventListener("click",()=>openSearch(OVERSEAS_INTERVENTION_BASE,evidenceSearchTerms().slice(0,4).join(" ")));
  $("evidenceCopyBtn")?.addEventListener("click",()=>copyText(
    evidenceSearchTerms().join("\n"),
    $("evidenceStatus"),
    "確認用の検索語をコピーしました。"
  ));
})();
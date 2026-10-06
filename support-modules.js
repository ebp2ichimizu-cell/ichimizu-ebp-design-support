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

  // ===== 広報物作成支援 =====
  const DESIGN_SIZES = {
    "チラシ": ["A4縦","A4横","A3縦","A3横"],
    "ポスター": ["A3縦","A3横","A2縦","A2横","B2縦","B2横"],
    "のぼり旗": ["600×1800mm（縦）","450×1800mm（縦）","600×1500mm（縦）"],
    "横断幕": ["3000×900mm（横）","2400×600mm（横）","1800×600mm（横）","カスタム"],
    "スマホ画面": ["1080×1920px（9:16）","1080×1350px（4:5）","1080×1080px（1:1）"],
    "SNS投稿画像": ["1080×1080px（1:1）","1080×1350px（4:5）","1080×1920px（9:16）"],
    "その他": ["カスタム"]
  };

  function refreshDesignSizes(){
    const medium=$("designMedium")?.value || "ポスター";
    const select=$("designSize");
    if(!select) return;
    select.innerHTML="";
    (DESIGN_SIZES[medium] || ["カスタム"]).forEach(size=>{
      const opt=document.createElement("option");
      opt.value=size;
      opt.textContent=size;
      select.append(opt);
    });
  }

  function refreshCharacterRole(){
    const charValue=$("designCharacter")?.value || "なし";
    const role=$("designCharacterRole");
    if(!role) return;
    role.disabled=(charValue==="なし");
  }

  function buildDesignPrompt(){
    const source=$("designSource")?.value.trim() || "";
    const medium=$("designMedium")?.value || "ポスター";
    const size=$("designSize")?.value || "未指定";
    const character=$("designCharacter")?.value || "なし";
    const characterRole=$("designCharacterRole")?.value || "補助";
    const required=$("designRequired")?.value.trim() || "特になし";

    if(!source) return "";

    let characterInstruction="";
    if(character==="あり"){
      characterInstruction=`キャラクターを使用します。役割は「${characterRole}」です。
キャラクター自体を新規に描き込まず、後から既存の公式キャラクター画像を貼り付けられる空きスペースを確保してください。
各案で、配置位置・おおよその占有面積・文字や他要素との関係を具体的に示してください。`;
    }else if(character==="未定"){
      characterInstruction=`キャラクターの使用は未定です。
キャラクターなしでも成立するレイアウトとしつつ、必要になった場合に後から既存キャラクター画像を置ける余白または差し替え領域を確保してください。
キャラクターを追加しても主メッセージや情報階層が崩れない構成にしてください。`;
    }else{
      characterInstruction=`キャラクターは使用しません。キャラクター用の空き領域は不要です。`;
    }

    return `# 防犯施策｜広報物デザイン支援プロンプト

あなたは、警察・自治体等の犯罪予防施策に関する広報デザインを支援するAIです。
以下の「施策内容」を読み、施策の目的・対象者・促したい行動・実施場所・想定メカニズムを踏まえた広報物のデザイン案を作成してください。

重要：
- 広報物は施策そのものではなく、施策を実装する手段の一部として扱ってください。
- 元の施策目的や想定メカニズムを、デザイン上の都合で勝手に変更しないでください。
- 不足情報があっても、重要でない点について質問だけで止まらず、仮定を明示して暫定案を提示してください。
- 効果が実証されていないデザイン要素を「効果がある」と断定しないでください。
- 既存の著作物・他団体のポスター・キャラクター等を無断で模倣しないでください。
- 公共機関の広報物として、誤認、過度な恐怖訴求、差別・偏見、過度な監視感を生じさせないよう配慮してください。

## 施策内容
${source}

## 作成条件
媒体：${medium}
出力サイズ：${size}

キャラクター：${character}
${characterInstruction}

必ず入れたい文字・要素：
${required}

## デザインの基本条件
1. 指定した媒体とサイズに合わせて、文字量・余白・視認距離・情報階層を調整してください。
2. 「何をしてほしいか」が一目で分かることを優先してください。
3. 長い説明より、主メッセージ → 具体的な行動 → 補足情報の順で読める構成にしてください。
4. 写真、イラスト、キャラクター等は、後から差し替え可能な構造を優先してください。
5. ロゴ、QRコード、組織名等を入れる場合は、本文を邪魔しない固定領域として扱ってください。
6. スマホ画面では小画面での可読性、のぼり旗・横断幕では遠距離からの瞬時の理解を特に重視してください。
7. 防犯行動を促す場合、抽象的な「気をつけましょう」だけで終わらず、可能なら具体的な行動を示してください。

## 出力
方向性の異なるデザイン案を3案提示してください。
単なる色違いではなく、訴求方法・情報配置・視線誘導の考え方が異なる3案にしてください。

各案について、次の順で整理してください。

### 案1〜3
- デザインコンセプト
- この案が施策目的とどうつながるか
- 主コピー
- サブコピー
- レイアウト構成
- 写真・イラスト等の配置案
- キャラクターを使用する場合の貼付スペース
- 色・文字・視認性の考え方
- 対象者が取るべき行動がどこで分かるか
- 注意点・誤解される可能性
- ${medium}・${size}として実制作する際の具体的な配置指示

3案を提示した後に、次も作成してください。

## 比較
3案を、
- 一瞬での分かりやすさ
- 行動の具体性
- 公共広報としての使いやすさ
- 情報量
- 実制作のしやすさ
の観点で簡潔に比較してください。

## 画像生成AI用プロンプト
各案について、画像生成AIにそのまま渡せる日本語プロンプトを1本ずつ作成してください。
ただし、後から差し替えるキャラクター・ロゴ・QRコードは描き込まず、「空きスペース」「プレースホルダー」として指定してください。

## 再編集用レイアウト仕様
最後に、PowerPoint等で再現・修正しやすいように、
上部／中央／下部、または左／中央／右などの領域単位で、文字・画像・キャラクター・ロゴ等の配置を簡潔に示してください。`;
  }

  function generateDesignPrompt(){
    const prompt=buildDesignPrompt();
    const status=$("designStatus");
    if(!prompt){
      status.textContent="まず、施策内容またはAI回答の必要部分を貼り付けてください。";
      return;
    }
    $("designPrompt").value=prompt;
    $("designPromptWrap").classList.remove("hidden");
    status.textContent="デザイン用プロンプトを生成しました。内容を確認して利用中のAIへ貼り付けてください。";
  }

  $("designMedium")?.addEventListener("change",refreshDesignSizes);
  $("designCharacter")?.addEventListener("change",refreshCharacterRole);
  $("designGenerateBtn")?.addEventListener("click",generateDesignPrompt);
  $("designCopyBtn")?.addEventListener("click",()=>copyText(
    $("designPrompt")?.value || "",
    $("designStatus"),
    "デザイン用プロンプトをコピーしました。"
  ));
  $("designClearBtn")?.addEventListener("click",()=>{
    if($("designSource")) $("designSource").value="";
    if($("designRequired")) $("designRequired").value="";
    if($("designPrompt")) $("designPrompt").value="";
    $("designPromptWrap")?.classList.add("hidden");
    if($("designStatus")) $("designStatus").textContent="";
  });

  refreshDesignSizes();
  refreshCharacterRole();

})();

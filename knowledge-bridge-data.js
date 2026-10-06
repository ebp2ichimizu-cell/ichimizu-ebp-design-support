window.ICHIMIZU_KNOWLEDGE_BRIDGE = [
  {
    match:["自転車盗","自転車窃盗","チャリ盗","無施錠","二重ロック","駐輪場"],
    problems:["自転車盗 / bicycle theft"],
    mechanisms:["対象物へのアクセスを難しくする / increase effort","発見・検挙されると感じる可能性を高める / increase perceived risk","防護行動を実行しやすくする / facilitate protective behaviour"],
    theories:["状況的犯罪予防 / Situational Crime Prevention","日常活動理論 / Routine Activity Theory"],
    interventions:["bicycle locking","double locking","secure bicycle parking","guardianship","target hardening"]
  },
  {
    match:["侵入窃盗","空き巣","忍込み","居空き","住宅侵入","住宅窃盗"],
    problems:["住宅対象侵入窃盗 / residential burglary"],
    mechanisms:["侵入に必要な労力を増やす / increase effort","自然監視・発見可能性を高める / increase surveillance","再被害リスクを下げる / reduce repeat victimisation"],
    theories:["状況的犯罪予防 / Situational Crime Prevention","日常活動理論 / Routine Activity Theory","CPTED"],
    interventions:["target hardening","repeat burglary prevention","security assessment","lighting","access control"]
  },
  {
    match:["車上ねらい","車上荒らし","車内盗","自動車盗","駐車場犯罪"],
    problems:["車両関連窃盗 / theft from or of vehicles"],
    mechanisms:["対象物の魅力・報酬を下げる / reduce rewards","監視可能性を高める / increase surveillance","犯行機会へのアクセスを制御する / control access"],
    theories:["状況的犯罪予防 / Situational Crime Prevention","日常活動理論 / Routine Activity Theory","CPTED"],
    interventions:["CCTV","parking security","lighting","target hardening","guardianship"]
  },
  {
    match:["万引き","店舗窃盗","店内窃盗"],
    problems:["万引き / shoplifting"],
    mechanisms:["監視・発見可能性を高める / increase surveillance","犯行機会を減らす / reduce opportunity","商品取得の報酬を下げる / reduce rewards"],
    theories:["状況的犯罪予防 / Situational Crime Prevention","日常活動理論 / Routine Activity Theory"],
    interventions:["retail guardianship","store layout","CCTV","EAS","situational crime prevention shoplifting"]
  },
  {
    match:["特殊詐欺","詐欺電話","オレオレ詐欺","還付金詐欺","架空料金","SNS型投資詐欺","ロマンス詐欺"],
    problems:["特殊詐欺・非対面型詐欺 / fraud and scams"],
    mechanisms:["欺罔への気づきを高める / increase scam recognition","行動直前の確認を促す / prompt verification","送金・連絡の機会構造を変える / disrupt opportunity"],
    theories:["防護動機理論 / Protection Motivation Theory","行動科学・ナッジ / behavioural insights","状況的犯罪予防 / Situational Crime Prevention"],
    interventions:["fraud prevention messaging","behavioural rehearsal","warning prompts","protective behaviour","scam intervention"]
  },
  {
    match:["落書き","グラフィティ","graffiti","器物損壊","破壊行為","vandalism"],
    problems:["落書き・器物損壊 / graffiti and vandalism"],
    mechanisms:["監視可能性を高める / increase surveillance","場所の管理を強める / strengthen place management","犯行の報酬・可視性を下げる / reduce rewards"],
    theories:["CPTED","状況的犯罪予防 / Situational Crime Prevention","日常活動理論 / Routine Activity Theory"],
    interventions:["rapid graffiti removal","place management","natural surveillance","lighting","access control"]
  },
  {
    match:["不審者","声かけ","つきまとい","公園の安全","駅前の安全","犯罪不安"],
    problems:["公共空間の安全・犯罪不安 / public-space safety and fear of crime"],
    mechanisms:["監視可能性を高める / increase surveillance","有能な監視者を増やす / strengthen guardianship","場所管理を改善する / improve place management"],
    theories:["日常活動理論 / Routine Activity Theory","CPTED","犯罪パターン理論 / Crime Pattern Theory"],
    interventions:["guardianship","place management","natural surveillance","hot spots policing","lighting"]
  },
  {
    match:["ホットスポット","多発地点","集中地点","特定地点","特定時間帯","重点パトロール"],
    problems:["犯罪の場所・時間的集中 / crime concentration at micro places"],
    mechanisms:["高リスク地点への警察資源集中 / focused deterrence at places","監視・介入頻度を高める / increase guardianship"],
    theories:["犯罪パターン理論 / Crime Pattern Theory","日常活動理論 / Routine Activity Theory","Place-based criminology"],
    interventions:["hot spots policing","micro places","directed patrol","problem-oriented policing"]
  },
  {
    match:["防犯カメラ","監視カメラ","CCTV","カメラ設置"],
    problems:["監視を用いた犯罪予防 / surveillance-based prevention"],
    mechanisms:["発見・検挙リスクの知覚を高める / increase perceived risk","事後の識別・捜査可能性を高める / increase detection capability"],
    theories:["状況的犯罪予防 / Situational Crime Prevention","CPTED"],
    interventions:["CCTV","active monitoring","surveillance","camera coverage"]
  },
  {
    match:["照明","街路灯","暗い","夜間","明るさ"],
    problems:["夜間環境と犯罪 / nighttime environmental crime prevention"],
    mechanisms:["視認性・監視可能性を高める / improve visibility and surveillance","場所利用・非公式監視を変える / change legitimate use and informal surveillance"],
    theories:["CPTED","状況的犯罪予防 / Situational Crime Prevention","日常活動理論 / Routine Activity Theory"],
    interventions:["street lighting","improved lighting","natural surveillance"]
  },
  {
    match:["巡回","パトロール","警ら","見せる警察活動"],
    problems:["警察活動による場所ベースの犯罪予防 / place-based policing"],
    mechanisms:["警察の存在・発見リスクを高める / increase perceived detection risk","高リスク地点に監視資源を集中する / concentrate guardianship"],
    theories:["Evidence-Based Policing","犯罪パターン理論 / Crime Pattern Theory"],
    interventions:["directed patrol","hot spots policing","high visibility patrol"]
  },
  {
    match:["啓発","ポスター","チラシ","広報","メッセージ","ナッジ","注意喚起"],
    problems:["防犯情報・行動変容 / crime-prevention communication and behaviour change"],
    mechanisms:["注意を喚起する / capture attention","リスク認知・対処可能感を変える / change threat and coping appraisal","行動直前に選択を促す / prompt action at point of decision"],
    theories:["防護動機理論 / Protection Motivation Theory","行動科学・ナッジ / behavioural insights"],
    interventions:["behavioural nudges","risk communication","point-of-decision prompts","protective behaviour messaging"]
  },
  {
    match:["再被害","繰り返し被害","反復被害","repeat victim"],
    problems:["反復被害 / repeat victimisation"],
    mechanisms:["高リスク対象を早期に保護する / protect high-risk repeat targets","被害後の短期高リスク期間に介入する / intervene during elevated-risk period"],
    theories:["Repeat victimisation","日常活動理論 / Routine Activity Theory"],
    interventions:["repeat victimisation prevention","target hardening","cocooning"]
  },
  {
    match:["学校","通学路","児童","生徒","子ども","こども"],
    problems:["学校・通学環境の安全 / school and journey safety"],
    mechanisms:["監視者を増やす / strengthen guardianship","移動経路・時間帯のリスクを減らす / reduce risky convergence"],
    theories:["日常活動理論 / Routine Activity Theory","犯罪パターン理論 / Crime Pattern Theory"],
    interventions:["guardianship","safe routes","place management","school safety"]
  }
];

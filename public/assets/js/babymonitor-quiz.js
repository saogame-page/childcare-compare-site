/* =========================================================
   ベビーモニター タイプ診断（約30秒・5問）
   - まず「タイプ」を提案し、その後に商品候補を表示する
   - 順位付け・1位の決定は行わない
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("quiz-app");
  if (!root) return;

  /* ---- 質問定義 ----
     score: wifi_free / hybrid / app / record / budget への加点
     flag : budget(low|mid|high), ai(true), multiroom(true)
  */
  var QUESTIONS = [
    {
      q: "スマホでの操作・通知は必要ですか？",
      options: [
        { label: "スマホは使わず、モニター画面だけで見たい", score: { wifi_free: 2 } },
        { label: "外出先からも確認したいので、アプリを積極的に使いたい", score: { app: 2 } },
        { label: "家では専用モニター、外出時はスマホと使い分けたい", score: { hybrid: 3 } }
      ]
    },
    {
      q: "ご自宅のWi-Fi環境について当てはまるものは？",
      options: [
        { label: "Wi-Fiが赤ちゃんの部屋まで安定して届かない・常時接続の予定がない", score: { wifi_free: 2 } },
        { label: "Wi-Fi環境は安定していて、外出先からの確認も重視したい", score: { app: 1, record: 1 } },
        { label: "特にこだわりはない", score: {} }
      ]
    },
    {
      q: "見守りたい範囲・部屋数は？",
      options: [
        { label: "1部屋だけで十分", score: {} },
        { label: "兄弟の部屋やリビングなど、複数部屋を見守りたい", score: { app: 1, hybrid: 1 }, flag: { multiroom: true } }
      ]
    },
    {
      q: "映像を記録・見返したいですか？",
      options: [
        { label: "リアルタイムで確認できれば十分、記録は不要", score: { wifi_free: 1, budget: 2 } },
        { label: "後から見返せるよう録画・記録を残したい", score: { record: 2 } },
        { label: "泣き声・寝返り・体調変化などをAIで分析してほしい", score: { record: 3 }, flag: { ai: true } }
      ]
    },
    {
      q: "月額料金・予算についてどう考えますか？",
      options: [
        { label: "月額課金は避けたい・本体価格も抑えたい", score: { budget: 2 }, flag: { budget: "low" } },
        { label: "高機能なら月額課金があってもよい", score: { record: 1 }, flag: { budget: "high" } },
        { label: "特にこだわりはない", flag: { budget: "mid" } }
      ]
    }
  ];

  /* ---- 商品データ（比較ページ内のアンカーへリンク） ---- */
  var PRODUCTS = {
    panasonic: { name: "パナソニック ベビーモニター KX-HC705-W", price: "価格目安 15,000〜17,000円程度", href: "#p-kxhc705" },
    tribute:   { name: "トリビュート ワイヤレスベビーカメラ BM-LTL2", price: "価格目安 24,860円", href: "#p-bmltl2" },
    eufy:      { name: "Eufy Baby Monitor C10", price: "価格目安 15,340〜17,990円", href: "#p-c10" },
    greenhouse:{ name: "グリーンハウス みまもりスマートカメラ GH-SMCA-WH", price: "価格目安 3,980円前後（月額無料）", href: "#p-ghsmca" },
    switchbot: { name: "SwitchBot 見守りカメラ Plus 3MP", price: "価格目安 3,980円（クラウドは任意）", href: "#p-mimamoruplus" },
    tapo:      { name: "TP-Link Tapo C230/A", price: "価格目安 6,120〜6,800円（クラウドは任意）", href: "#p-c230a" },
    cuboai:    { name: "CuboAi スマートベビーモニター（第3世代）", price: "価格目安 45,800円（AI拡張機能は月額課金）", href: "#p-cuboai" }
  };

  /* ---- 判定ロジック ---- */
  function judge(score, flags) {
    var budget = flags.budget || "mid";
    var result = { type: "", desc: "", candidates: [], extraNote: "" };

    var order = ["wifi_free", "hybrid", "app", "record", "budget"];
    var top = "wifi_free";
    var maxScore = -1;
    order.forEach(function (k) {
      var v = score[k] || 0;
      if (v > maxScore) { maxScore = v; top = k; }
    });

    if (top === "wifi_free") {
      result.type = "Wi-Fi不要＋専用モニター型";
      result.desc = "Wi-Fiやスマホアプリに頼らず、専用モニターの画面で確認したい使い方です。ネットワーク環境に依存しない一方、外出先からの確認機能は基本的にありません。";
      result.candidates = [PRODUCTS.panasonic, PRODUCTS.tribute];
    } else if (top === "hybrid") {
      result.type = "専用モニター＋スマホ両対応型";
      result.desc = "宅内では専用モニター、外出先ではスマホアプリと使い分けたい使い方です。外出先からの確認にはWi-Fi接続が必要になる点にご注意ください。";
      result.candidates = [PRODUCTS.eufy];
      result.extraNote = "現時点の掲載候補では、専用モニターとスマホアプリの両方に公式対応しているのはEufy Baby Monitor C10のみです。";
    } else if (top === "app") {
      result.type = "スマホアプリ型";
      result.desc = "専用モニターは持たず、スマホアプリでの確認を基本にしたい使い方です。外出先からの確認や複数カメラでの管理がしやすいタイプです。";
      if (flags.multiroom) {
        result.candidates = [PRODUCTS.switchbot, PRODUCTS.tapo];
        result.extraNote = "複数部屋を見守りたい場合は、複数カメラの同時表示に公式対応しているSwitchBotやEufy（最大2台）が候補になります。";
      } else if (budget === "low") {
        result.candidates = [PRODUCTS.greenhouse, PRODUCTS.switchbot];
      } else {
        result.candidates = [PRODUCTS.tapo, PRODUCTS.switchbot];
      }
    } else if (top === "record") {
      result.type = "録画重視型";
      result.desc = "映像を後から見返したい、あるいはAIによる泣き声・寝返り等の分析までしてほしい使い方です。録画・分析機能の充実度が比較の中心になります。";
      if (flags.ai) {
        result.candidates = [PRODUCTS.cuboai, PRODUCTS.tapo];
        result.extraNote = "AIによる顔覆われ検知・寝返り検知など高度な分析機能を求める場合はCuboAiが候補になりますが、拡張機能の多くは月額課金制です。";
      } else if (budget === "low") {
        result.candidates = [PRODUCTS.eufy, PRODUCTS.greenhouse];
        result.extraNote = "月額課金をかけずに録画したい場合は、SDカード保存が基本のEufyやグリーンハウスが候補になります。";
      } else {
        result.candidates = [PRODUCTS.tapo, PRODUCTS.switchbot];
      }
    } else {
      result.type = "シンプル低価格型";
      result.desc = "まずは価格を抑えて、月額課金もかけずに1台試してみたい使い方です。";
      result.candidates = [PRODUCTS.greenhouse, PRODUCTS.switchbot];
    }

    return result;
  }

  /* ---- 画面描画 ---- */
  var state;

  function reset() {
    state = {
      index: 0,
      score: { wifi_free: 0, hybrid: 0, app: 0, record: 0, budget: 0 },
      flags: {}
    };
    renderQuestion();
  }

  function renderQuestion() {
    var item = QUESTIONS[state.index];
    var html = "";
    html += '<p class="quiz-progress">質問 ' + (state.index + 1) + " / " + QUESTIONS.length + "</p>";
    html += '<p class="quiz-q">' + item.q + "</p>";
    html += '<div class="quiz-options" role="group">';
    item.options.forEach(function (opt, i) {
      html += '<button type="button" class="quiz-option" data-i="' + i + '">' + opt.label + "</button>";
    });
    html += "</div>";
    if (state.index > 0) {
      html += '<div class="quiz-controls"><button type="button" class="quiz-restart">最初からやり直す</button></div>';
    }
    root.innerHTML = html;

    root.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        pick(item.options[Number(btn.dataset.i)]);
      });
    });
    bindRestart();
  }

  function pick(opt) {
    if (opt.score) {
      Object.keys(opt.score).forEach(function (k) {
        state.score[k] = (state.score[k] || 0) + opt.score[k];
      });
    }
    if (opt.flag) {
      Object.keys(opt.flag).forEach(function (k) {
        state.flags[k] = opt.flag[k];
      });
    }
    state.index += 1;
    if (state.index < QUESTIONS.length) {
      renderQuestion();
    } else {
      renderResult();
    }
  }

  function renderResult() {
    var r = judge(state.score, state.flags);
    var html = "";
    html += '<p class="quiz-progress">診断結果</p>';
    html += '<p class="quiz-result-type">わが家に合いそうなのは「' + r.type + '」です</p>';
    html += "<p>" + r.desc + "</p>";
    html += "<p><strong>このタイプで比較したい候補：</strong></p>";
    html += '<div class="quiz-candidates">';
    r.candidates.forEach(function (p) {
      html +=
        '<a class="quiz-candidate" href="' + p.href + '">' +
        "<strong>" + p.name + "</strong>" +
        "<span>" + p.price + "</span></a>";
    });
    html += "</div>";
    if (r.extraNote) html += '<p class="quiz-result-note">補足：' + r.extraNote + "</p>";
    html +=
      '<p class="quiz-result-note">※ この診断は、住宅環境・使い方に合いやすい「タイプ」の目安を示すものです。' +
      "商品の順位や優劣を決めるものではありません。候補はいずれもメーカー公式仕様に基づく整理です。価格は調査時点の目安です。最新価格は各販売ページでご確認ください。</p>";
    html += '<div class="quiz-controls"><button type="button" class="quiz-restart">もう一度診断する</button></div>';
    root.innerHTML = html;
    bindRestart();
  }

  function bindRestart() {
    var b = root.querySelector(".quiz-restart");
    if (b) b.addEventListener("click", reset);
  }

  reset();
})();

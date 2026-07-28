/* =========================================================
   搾乳機タイプ診断（約30秒・5問）
   - まず「タイプ」を提案し、その後に商品候補を表示する
   - 順位付け・1位の決定は行わない
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("quiz-app");
  if (!root) return;

  /* ---- 質問定義 ----
     score: manual / electric / handsfree / double への加点
     flag : budget(low|mid|high), outing(true)
  */
  var QUESTIONS = [
    {
      q: "搾乳する頻度は、どのくらいになりそうですか？",
      options: [
        { label: "週に数回以下（たまに）", score: { manual: 2 } },
        { label: "ほぼ毎日", score: { electric: 1 } },
        { label: "1日に何度も", score: { electric: 2, double: 1 } }
      ]
    },
    {
      q: "搾乳している間、両手を空けたいですか？",
      options: [
        { label: "空けたい（家事や上の子のお世話をしたい）", score: { handsfree: 3 } },
        { label: "座ってゆっくり搾乳できることが多い", score: {} }
      ]
    },
    {
      q: "主にどこで使う予定ですか？",
      options: [
        { label: "自宅のみ", score: {} },
        { label: "職場や外出先でも使いたい", score: { handsfree: 1 }, flag: { outing: true } }
      ]
    },
    {
      q: "1回の搾乳にかけられる時間は？",
      options: [
        { label: "時間には比較的余裕がある", score: {} },
        { label: "とにかく短くしたい", score: { double: 2, electric: 1 } }
      ]
    },
    {
      q: "予算のイメージは？",
      options: [
        { label: "5千円以内におさえたい", flag: { budget: "low" } },
        { label: "1万5千円くらいまで", flag: { budget: "mid" } },
        { label: "使い方に合えば金額は問わない", flag: { budget: "high" } }
      ]
    }
  ];

  /* ---- 商品データ（比較ページ内のアンカーへリンク） ---- */
  var PRODUCTS = {
    e402:     { name: "ベビースマイル 手動さく乳器 E-402", price: "税込3,480円", href: "#p-e402" },
    harmony:  { name: "メデラ ハーモニー手動さく乳器", price: "税込4,400円", href: "#p-harmony" },
    pigeonM:  { name: "ピジョン さく乳器 手動（manual）", price: "税込5,500円", href: "#p-pigeon-manual" },
    e403:     { name: "ベビースマイル 電動さく乳器 E-403", price: "税込7,780円", href: "#p-e403" },
    solo:     { name: "メデラ ソロ電動さく乳器", price: "税込12,100円", href: "#p-solo" },
    handyfit: { name: "ピジョン さく乳器 電動 handy fit+（2026年モデル）", price: "税込13,200円", href: "#p-handyfit" },
    proR:     { name: "ピジョン さく乳器 電動 pro personal R", price: "税込20,350円（両胸同時は別売キット）", href: "#p-propersonal" },
    e401:     { name: "ベビースマイル ハンズフリー電動さく乳器 E-401", price: "税込6,580円（2個使いで両胸同時も可）", href: "#p-e401" },
    soloHF:   { name: "メデラ ソロ ハンズフリー電動さく乳器", price: "税込18,700円", href: "#p-solo-hf" },
    fsMini:   { name: "メデラ フリースタイルミニ・ハンズフリー電動さく乳器（両胸）", price: "税込26,950円", href: "#p-freestyle-mini" }
  };

  /* ---- 判定ロジック ---- */
  function judge(score, flags) {
    var budget = flags.budget || "mid";
    var result = { type: "", desc: "", candidates: [], extraNote: "" };

    var isDouble = score.double >= 2;

    if (score.handsfree >= 3) {
      if (isDouble) {
        result.type = "両胸同時 × ハンズフリータイプ";
        result.desc = "「両手を空けたい」と「搾乳時間を短くしたい」の両方を重視する使い方です。両胸同時対応のカップ型が比較の中心になります。";
        result.candidates = [PRODUCTS.fsMini, PRODUCTS.e401];
        result.extraNote = "E-401は1台では片胸用ですが、2個使いで両胸同時に対応できます（2個でも約1.3万円）。";
      } else {
        result.type = "ハンズフリー電動タイプ";
        result.desc = "搾乳中に両手を使えることを重視する使い方です。ブラの中に装着するカップ型が比較の中心になります。";
        if (budget === "low") {
          result.candidates = [PRODUCTS.e401];
          result.extraNote = "ハンズフリーで5千円以内の現行品は確認できていませんが、E-401（6,580円）が最も近い価格帯です。";
        } else if (budget === "mid") {
          result.candidates = [PRODUCTS.e401, PRODUCTS.soloHF];
        } else {
          result.candidates = [PRODUCTS.soloHF, PRODUCTS.fsMini, PRODUCTS.e401];
        }
      }
    } else if (score.electric > score.manual) {
      if (isDouble) {
        result.type = "両胸同時も視野に入る 電動タイプ";
        result.desc = "毎日の搾乳を安定したリズムで、時間も短くしたい使い方です。両胸同時に拡張できる電動機が候補になります。";
        result.candidates = [PRODUCTS.proR, PRODUCTS.fsMini];
        result.extraNote = "pro personal Rは別売の「さく乳ボトルキット」で両胸同時に対応します。";
      } else {
        result.type = "スタンダード電動タイプ";
        result.desc = "定期的に搾乳する予定があり、手の疲れなく安定したリズムで搾乳したい使い方です。";
        if (budget === "low") {
          result.candidates = [PRODUCTS.e403, PRODUCTS.e402];
          result.extraNote = "5千円以内の電動の現行品は確認できていません。予算を最優先する場合は手動（E-402など）も選択肢になります。";
        } else if (budget === "mid") {
          result.candidates = [PRODUCTS.e403, PRODUCTS.solo, PRODUCTS.handyfit];
        } else {
          result.candidates = [PRODUCTS.handyfit, PRODUCTS.proR, PRODUCTS.solo];
        }
      }
    } else {
      result.type = "手動タイプ";
      result.desc = "使用頻度が高くない・電源を気にせず使いたい・まず1台試したい、という使い方に合いやすいタイプです。";
      if (budget === "low") {
        result.candidates = [PRODUCTS.e402, PRODUCTS.harmony];
      } else {
        result.candidates = [PRODUCTS.e402, PRODUCTS.harmony, PRODUCTS.pigeonM];
      }
      if (flags.outing) {
        result.extraNote = "外出先でも使う場合、手動は電源不要で持ち運びしやすい点が公式仕様上のメリットです。";
      }
    }
    return result;
  }

  /* ---- 画面描画 ---- */
  var state;

  function reset() {
    state = {
      index: 0,
      score: { manual: 0, electric: 0, handsfree: 0, double: 0 },
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
        state.score[k] += opt.score[k];
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
    html += '<p class="quiz-result-type">あなたの使い方は「' + r.type + '」が近そうです</p>';
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
      '<p class="quiz-result-note">※ この診断は、使い方に合いやすい「タイプ」の目安を示すものです。' +
      "商品の順位や優劣を決めるものではありません。候補はいずれもメーカー公式仕様に基づく整理です。</p>";
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

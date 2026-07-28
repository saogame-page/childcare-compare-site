/* =========================================================
   離乳食ブレンダー・ハンドブレンダー タイプ診断（約30秒・5問）
   - まず「タイプ」を提案し、その後に商品候補を表示する
   - 順位付け・1位の決定は行わない
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("quiz-app");
  if (!root) return;

  /* ---- 質問定義 ----
     score: babyfocus / general / lowqty / simple / multi への加点
     flag : budget(low|mid|high), cordless(true)
  */
  var QUESTIONS = [
    {
      q: "このブレンダーを主に何に使いたいですか？",
      options: [
        { label: "離乳食作りがメイン", score: { babyfocus: 2 } },
        { label: "離乳食にも普段の料理にも使いたい", score: { general: 2 } },
        { label: "まだ決めていない・とりあえず1台欲しい", score: { simple: 1 } }
      ]
    },
    {
      q: "1回に作る量は、どのくらいが多そうですか？",
      options: [
        { label: "大さじ数杯程度の少量が多い", score: { lowqty: 3 } },
        { label: "まとめて数食分作ることが多い", score: { general: 1 } }
      ]
    },
    {
      q: "コンセントの位置や配線を気にしたくないですか？",
      options: [
        { label: "気にしたくない・キッチン以外でも使いたい", flag: { cordless: true } },
        { label: "特に気にしない", score: {} }
      ]
    },
    {
      q: "チョッパー（みじん切り）機能は必要ですか？",
      options: [
        { label: "必要", score: { multi: 2 } },
        { label: "つぶす・混ぜるだけで十分", score: { simple: 2 } }
      ]
    },
    {
      q: "予算のイメージは？",
      options: [
        { label: "1万円以内におさえたい", flag: { budget: "low" } },
        { label: "1万5千円くらいまで", flag: { budget: "mid" } },
        { label: "離乳食専用の機能が充実していれば予算は問わない", flag: { budget: "high" } }
      ]
    }
  ];

  /* ---- 商品データ（比較ページ内のアンカーへリンク） ---- */
  var PRODUCTS = {
    ihb:     { name: "アイリスオーヤマ ハンドブレンダー IHB-M301", price: "価格目安 8,980円", href: "#p-ihb-m301" },
    vhb:     { name: "ビタントニオ ハンドブレンダー VHB-30", price: "価格目安 8,690円", href: "#p-vhb-30" },
    rhb3:    { name: "レコルト ハンディブレンダー フルセット RHB-3", price: "価格目安 7,700円", href: "#p-rhb-3" },
    mq5:     { name: "ブラウン マルチクイック5 ハンドブレンダー MQ50001M", price: "価格目安 13,800円", href: "#p-mq50001m" },
    tfal:    { name: "ティファール ハンドブレンダー ベビーマルチ HB65H8JP", price: "価格目安 15,180円", href: "#p-hb65h8jp" },
    bruno:   { name: "BRUNO マルチスティックブレンダー2+Baby BOE142", price: "価格目安 9,350円", href: "#p-boe142" },
    panasonic: { name: "パナソニック ハンドブレンダー MX-S302", price: "オープン価格", href: "#p-mxs302" },
    rhb2:    { name: "レコルト コードレスハンディブレンダー RHB-2", price: "価格目安 8,800円（連続使用に制約あり）", href: "#p-rhb-2" }
  };

  /* ---- 判定ロジック ---- */
  function judge(score, flags) {
    var budget = flags.budget || "mid";
    var result = { type: "", desc: "", candidates: [], extraNote: "" };

    // コードレス希望が明確な場合は、少量調理の傾向が強くなくても優先的に案内
    if (flags.cordless && (score.lowqty >= 3 || score.babyfocus >= 2 || score.simple >= 1)) {
      result.type = "少量調理重視タイプ（コードレス）";
      result.desc = "コンセントの位置を気にせず、少量ずつこまめに調理したい使い方です。コードレスのモデルが候補になりますが、公式仕様上「連続使用〇分」という制約がある商品が多いため、まとめて大量に作りたい場合は別タイプもあわせてご検討ください。";
      result.candidates = [PRODUCTS.rhb2];
      result.extraNote = "レコルトRHB-2は「連続2分・合計2分で30分休止」が公式に明記されています。まとめて大量に調理したい場合はコード式タイプの方が制約が少ない可能性があります。";
      return result;
    }

    var top = "babyfocus";
    var maxScore = -1;
    ["babyfocus", "general", "lowqty", "simple", "multi"].forEach(function (k) {
      var v = score[k] || 0;
      if (v > maxScore) { maxScore = v; top = k; }
    });

    if (top === "lowqty") {
      result.type = "少量調理重視タイプ";
      result.desc = "離乳食初期のような、少量をムラなく仕上げたい使い方です。「少量調理に最適」と公式に明記されているモデルが比較の中心になります。";
      if (budget === "low") {
        result.candidates = [PRODUCTS.vhb, PRODUCTS.rhb3];
      } else if (budget === "mid") {
        result.candidates = [PRODUCTS.mq5, PRODUCTS.vhb];
      } else {
        result.candidates = [PRODUCTS.tfal, PRODUCTS.mq5];
      }
    } else if (top === "babyfocus") {
      result.type = "離乳食中心タイプ";
      result.desc = "離乳食作りをメインに使いたい使い方です。離乳食用ブレンダーや専用カップ、レシピブックが付属するモデルが比較の中心になります。";
      if (budget === "low") {
        result.candidates = [PRODUCTS.bruno];
        result.extraNote = "離乳食専用に近いタイプで1万円以内におさまるのはBOE142（9,350円）です。";
      } else {
        result.candidates = [PRODUCTS.tfal, PRODUCTS.bruno];
      }
    } else if (top === "general") {
      result.type = "普段の料理にも使いたいタイプ";
      result.desc = "離乳食作りが終わったあとも長く使いたい使い方です。鍋やボウルへの直接使用や、チョッパー等の汎用アタッチメントを持つモデルが比較の中心になります。";
      if (budget === "low") {
        result.candidates = [PRODUCTS.ihb, PRODUCTS.rhb3];
      } else {
        result.candidates = [PRODUCTS.panasonic, PRODUCTS.mq5, PRODUCTS.ihb];
      }
    } else if (top === "multi") {
      result.type = "多機能セットタイプ";
      result.desc = "チョッパーや泡立て器など、複数の機能を1台で済ませたい使い方です。アタッチメントの豊富さが比較の中心になります。";
      if (budget === "low") {
        result.candidates = [PRODUCTS.ihb, PRODUCTS.vhb];
      } else {
        result.candidates = [PRODUCTS.panasonic, PRODUCTS.mq5, PRODUCTS.vhb];
      }
    } else {
      result.type = "シンプル価格重視タイプ";
      result.desc = "まずは価格を抑えて1台試してみたい使い方です。多機能セットの中でも価格を抑えやすいモデルが比較の中心になります。";
      result.candidates = [PRODUCTS.rhb3, PRODUCTS.ihb, PRODUCTS.vhb];
    }

    return result;
  }

  /* ---- 画面描画 ---- */
  var state;

  function reset() {
    state = {
      index: 0,
      score: { babyfocus: 0, general: 0, lowqty: 0, simple: 0, multi: 0 },
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
      '<p class="quiz-result-note">※ この診断は、使い方に合いやすい「タイプ」の目安を示すものです。' +
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

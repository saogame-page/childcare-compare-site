/* =========================================================
   子ども乗せ電動自転車 タイプ診断（約30秒・5問）
   - まず「タイプ」を提案し、その後に車種候補を表示する
   - 順位付け・1位の決定は行わない
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("quiz-app");
  if (!root) return;

  /* ---- 質問定義 ----
     score: front / rear / range / light / budget への加点
     flag : budget(low|mid|high)
  */
  var QUESTIONS = [
    {
      q: "お子さんをどちらに乗せることが多くなりそうですか？",
      options: [
        { label: "前乗せ中心にしたい", score: { front: 2 } },
        { label: "後ろ乗せ中心にしたい", score: { rear: 2 } },
        { label: "まだ決めていない・将来2人同乗も考えている", score: { rear: 1 } }
      ]
    },
    {
      q: "自転車の運転に慣れていますか？身長は高めですか？",
      options: [
        { label: "あまり自転車に乗り慣れていない・小柄な方だと思う", score: { front: 2, light: 1 } },
        { label: "普段からよく自転車に乗る・身長は高めだと思う", score: { rear: 1 } }
      ]
    },
    {
      q: "送り迎えの距離や坂道はどのくらいですか？",
      options: [
        { label: "長距離・坂道が多い", score: { range: 3 } },
        { label: "短距離・平坦な道が中心", score: { budget: 1 } }
      ]
    },
    {
      q: "車体の取り回し・軽さを重視しますか？",
      options: [
        { label: "重視する（駐輪場所が狭い、段差がある等）", score: { light: 2 } },
        { label: "特に気にしない", score: {} }
      ]
    },
    {
      q: "予算はどのくらいまで許容できますか？",
      options: [
        { label: "できるだけ抑えたい", score: { budget: 2 }, flag: { budget: "low" } },
        { label: "機能が充実していれば予算は問わない", score: { range: 1 }, flag: { budget: "high" } },
        { label: "特にこだわりはない", flag: { budget: "mid" } }
      ]
    }
  ];

  /* ---- 車種データ（比較ページ内のアンカーへリンク） ---- */
  var BIKES = {
    annysdx:  { name: "パナソニック ギュット・アニーズ・DX", price: "価格目安 180,000円", href: "#p-annysdx" },
    croomrdx: { name: "パナソニック ギュット・クルームR・DX", price: "価格目安 189,000円", href: "#p-croomrdx" },
    pasbabby: { name: "ヤマハ PAS babby", price: "価格目安 189,000円", href: "#p-pasbabby" },
    polare:   { name: "ブリヂストン bikke POLAR e", price: "価格目安 191,800円", href: "#p-polare" },
    paskiss:  { name: "ヤマハ PAS kiss", price: "価格目安 191,000円", href: "#p-paskiss" },
    mobdd:    { name: "ブリヂストン bikke MOB dd", price: "価格目安 196,800円", href: "#p-mobdd" }
  };

  /* ---- 判定ロジック ---- */
  function judge(score, flags) {
    var budget = flags.budget || "mid";
    var result = { type: "", desc: "", candidates: [], extraNote: "" };

    var order = ["front", "rear", "range", "light", "budget"];
    var top = "rear";
    var maxScore = -1;
    order.forEach(function (k) {
      var v = score[k] || 0;
      if (v > maxScore) { maxScore = v; top = k; }
    });

    if (top === "front") {
      result.type = "前乗せ重視タイプ";
      result.desc = "自転車に不慣れな方や小柄な方が、まずは前乗せから始めたい使い方です。前後20インチの小径タイヤなど、低重心設計を公式に訴求している車種が中心になります。";
      result.candidates = [BIKES.polare, BIKES.paskiss];
      result.extraNote = "前乗せ標準タイプは後ろ乗せへの対応可否が公式に確認できていない車種があります。2人同乗を予定している場合は、購入前に販売店へ確認することをおすすめします。";
    } else if (top === "rear") {
      result.type = "後ろ乗せ王道タイプ";
      result.desc = "後ろ乗せを軸に、1人目の送り迎えから将来の2人同乗まで長く使いたい使い方です。後ろ乗せ標準・前乗せは追加オプションという構成の車種が中心になります。";
      if (budget === "low") {
        result.candidates = [BIKES.annysdx, BIKES.croomrdx];
      } else {
        result.candidates = [BIKES.pasbabby, BIKES.annysdx];
      }
    } else if (top === "range") {
      result.type = "走行距離・パワー重視タイプ";
      result.desc = "坂道や長距離の送り迎えで、一充電あたりの走行距離や走行の安定感を重視したい使い方です。";
      result.candidates = [BIKES.mobdd];
      result.extraNote = "bikke MOB ddはエコモード時に一充電あたり約180kmという走行距離が公式に示されています（走行条件により変動します）。";
    } else if (top === "light") {
      result.type = "取り回し・軽さ重視タイプ";
      result.desc = "駐輪場所が狭い、段差があるなど、車体の取り回しや軽さを重視したい使い方です。";
      result.candidates = [BIKES.polare, BIKES.croomrdx];
    } else {
      result.type = "価格重視タイプ";
      result.desc = "まずは価格を抑えて、標準的な構成で1台選びたい使い方です。";
      result.candidates = [BIKES.annysdx, BIKES.croomrdx];
    }

    return result;
  }

  /* ---- 画面描画 ---- */
  var state;

  function reset() {
    state = {
      index: 0,
      score: { front: 0, rear: 0, range: 0, light: 0, budget: 0 },
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
      '<p class="quiz-result-note">※ この診断は、送り迎え・体格に合いやすい「タイプ」の目安を示すものです。' +
      "車種の順位や優劣を決めるものではありません。候補はいずれもメーカー公式仕様に基づく整理です。価格は調査時点の目安です。最新価格は各販売ページでご確認ください。</p>";
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

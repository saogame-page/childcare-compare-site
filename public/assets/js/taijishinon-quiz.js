/* =========================================================
   家庭用胎児心音計 タイプ診断（約30秒・4問）
   - まず「タイプ」を提案し、その後に商品候補を表示する
   - 順位付け・1位の決定は行わない
   - 医学的な判断・診断の代わりにはならない旨を必ず結果に明記する
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("quiz-app");
  if (!root) return;

  /* ---- 質問定義 ----
     flag : budget(low|mid|high), listen(speaker|earphone|any), app(want|any), shape(integrated|separate|any)
  */
  var QUESTIONS = [
    {
      q: "予算のイメージは？",
      options: [
        { label: "1万円以内", flag: { budget: "low" } },
        { label: "1万〜1万5千円くらい", flag: { budget: "mid" } },
        { label: "1万5千円以上でもよい", flag: { budget: "high" } }
      ]
    },
    {
      q: "家族みんなで一緒に聞きたいですか？",
      options: [
        { label: "みんなで聞きたい（スピーカー重視）", flag: { listen: "speaker" } },
        { label: "一人で静かに聞きたい（イヤホン重視）", flag: { listen: "earphone" } },
        { label: "どちらでもよい", flag: { listen: "any" } }
      ]
    },
    {
      q: "スマホアプリで記録を残したいですか？",
      options: [
        { label: "残したい", flag: { app: "want" } },
        { label: "特にこだわらない", flag: { app: "any" } }
      ]
    },
    {
      q: "本体の形は、どちらがよいですか？",
      options: [
        { label: "本体とプローブが一体のコンパクトなタイプ", flag: { shape: "integrated" } },
        { label: "本体とプローブが分かれ、プローブ部を洗いやすいタイプ", flag: { shape: "separate" } },
        { label: "どちらでもよい", flag: { shape: "any" } }
      ]
    }
  ];

  /* ---- 商品データ（比較ページ内のアンカーへリンク） ---- */
  var PRODUCTS = {
    mini:   { name: "エンジェルサウンズ JPD-100S mini", price: "価格目安 8,800円", href: "#p-jpd100smini" },
    s6:     { name: "エンジェルサウンズ JPD-100S6", price: "価格目安 13,200円", href: "#p-jpd100s6" },
    fd10:   { name: "エンジェルサウンズ SH-FD10", price: "価格目安 10,780円", href: "#p-shfd10" },
    fd20:   { name: "エンジェルサウンズ SH-FD20（アプリ対応版）", price: "価格目安 14,850円", href: "#p-shfd20" },
    pd100a: { name: "ポケットドップラー PD-100A", price: "価格目安 19,800円", href: "#p-pd100a" },
    fd01:   { name: "スマイルサウンド FD-01", price: "価格目安 10,500円", href: "#p-fd01" }
  };

  /* ---- 判定ロジック ---- */
  function judge(flags) {
    var budget = flags.budget || "mid";
    var listen = flags.listen || "any";
    var app = flags.app || "any";
    var shape = flags.shape || "any";
    var result = { type: "", desc: "", candidates: [], extraNote: "" };

    if (app === "want") {
      result.type = "スマホアプリで記録を残したいタイプ";
      result.desc = "心拍数などをスマートフォンアプリで記録・保存したい使い方です。今回の候補ではSH-FD20のみがアプリ対応と公式に案内されています。";
      result.candidates = [PRODUCTS.fd20];
      result.extraNote = "アプリの記録機能は心拍音・心拍数の記録を目的としたものであり、医学的な診断や判定を行う機能ではありません。";
    } else if (shape === "separate") {
      result.type = "本体とプローブが分離するタイプ";
      result.desc = "プローブ部分を洗いやすくしたい、分離型の使い方です。今回の候補ではスマイルサウンドFD-01のみが該当します。";
      result.candidates = [PRODUCTS.fd01];
    } else if (listen === "speaker") {
      result.type = "家族で一緒に聞きたいタイプ（スピーカー重視）";
      result.desc = "内蔵スピーカーで、家族と一緒に心拍音を聞きたい使い方です。";
      if (budget === "low") {
        result.candidates = [PRODUCTS.fd10, PRODUCTS.fd01];
      } else if (budget === "mid") {
        result.candidates = [PRODUCTS.fd10, PRODUCTS.s6];
      } else {
        result.candidates = [PRODUCTS.fd20, PRODUCTS.s6];
      }
    } else if (listen === "earphone") {
      result.type = "一人で静かに聞きたいタイプ（イヤホン重視）";
      result.desc = "イヤホンを使って、一人で静かに聞きたい使い方です。";
      if (budget === "low") {
        result.candidates = [PRODUCTS.mini];
      } else {
        result.candidates = [PRODUCTS.pd100a, PRODUCTS.fd01];
      }
    } else {
      result.type = "価格重視タイプ";
      result.desc = "まずは価格を抑えて、基本的な機能から試したい使い方です。";
      if (budget === "low") {
        result.candidates = [PRODUCTS.mini];
      } else if (budget === "mid") {
        result.candidates = [PRODUCTS.fd10, PRODUCTS.fd01];
      } else {
        result.candidates = [PRODUCTS.fd20, PRODUCTS.pd100a];
      }
    }

    return result;
  }

  /* ---- 画面描画 ---- */
  var state;

  function reset() {
    state = { index: 0, flags: {} };
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
    var r = judge(state.flags);
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
      "商品の順位や優劣を決めるものではありません。候補はいずれもメーカー・国内正規販売元の公式情報に基づく整理です。価格は調査時点の目安です。最新価格は各販売ページでご確認ください。</p>";
    html +=
      '<p class="quiz-result-note"><strong>本製品は妊婦健診や医師の診断の代わりになるものではありません。</strong>心音が確認できない場合や、出血・腹痛・胎動の変化など心配な症状がある場合は、この診断結果や製品の結果だけで判断せず、医療機関へご相談ください。</p>';
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

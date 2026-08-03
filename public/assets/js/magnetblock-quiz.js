/* =========================================================
   マグネットブロック タイプ診断（約30秒・5問）
   - まず「タイプ」を提案し、その後に商品候補を表示する
   - 順位付け・1位の決定は行わない
   - 対象年齢（マグ・フォーマーは3歳〜）を踏まえて候補を絞る
   ========================================================= */
(function () {
  "use strict";

  var root = document.getElementById("quiz-app");
  if (!root) return;

  /* ---- 質問定義 ----
     score: small / mid / large（ピース数の好み）、ballcoaster（ボールコースター志向）
     flag : age(young|old), shape(stick|plate|any), budget(low|mid|high)
  */
  var QUESTIONS = [
    {
      q: "主に使うお子さんの年齢は？",
      options: [
        { label: "1〜2歳ごろ", flag: { age: "young" } },
        { label: "3歳以上", flag: { age: "old" } },
        { label: "きょうだいで年齢の幅がある", flag: { age: "old" } }
      ]
    },
    {
      q: "ボールを転がす遊びをさせたいですか？",
      options: [
        { label: "させたい", score: { ballcoaster: 3 } },
        { label: "特にこだわらない", score: { ballcoaster: 0 } }
      ]
    },
    {
      q: "最初は何ピースくらいから試したいですか？",
      options: [
        { label: "10〜15ピース程度の小さいセットから", score: { small: 2 } },
        { label: "30ピース前後", score: { mid: 2 } },
        { label: "60ピース以上、最初からたくさん", score: { large: 2 } }
      ]
    },
    {
      q: "スティック状のパーツと、プレート状のパーツ、どちらに興味がありますか？",
      options: [
        { label: "スティック状のパーツ", flag: { shape: "stick" } },
        { label: "プレート状のパーツ", flag: { shape: "plate" } },
        { label: "どちらでもよい", flag: { shape: "any" } }
      ]
    },
    {
      q: "予算のイメージは？",
      options: [
        { label: "5,000円以内", flag: { budget: "low" } },
        { label: "5,000〜10,000円くらい", flag: { budget: "mid" } },
        { label: "10,000円以上でもよい", flag: { budget: "high" } }
      ]
    }
  ];

  /* ---- 商品データ（比較ページ内のアンカーへリンク） ---- */
  var PRODUCTS = {
    sticko:    { name: "スティック・オー ベーシック 30ピース", price: "価格目安 7,700円", href: "#p-sticko-basic30" },
    bc:        { name: "ピタゴラス 知育いっぱい！ボールコースター", price: "価格目安 4,400円", href: "#p-pythagoras-ballcoaster" },
    bcdx:      { name: "ピタゴラス 知育いっぱい！ボールコースターDX", price: "価格目安 19,800円", href: "#p-pythagoras-ballcoaster-dx" },
    hajimete:  { name: "マグ・フォーマー はじめてのかたちセット（10ピース）", price: "価格目安 3,300円", href: "#p-magformers-hajimete10" },
    basicplus: { name: "マグ・フォーマー ベーシックプラスセット（30ピース）", price: "価格目安 8,470円", href: "#p-magformers-basicplus30" },
    basic62:   { name: "マグ・フォーマー ベーシックセット（62ピース）", price: "価格目安 16,500円", href: "#p-magformers-basic62" }
  };

  /* ---- 判定ロジック ---- */
  function judge(score, flags) {
    var age = flags.age || "old";
    var shape = flags.shape || "any";
    var budget = flags.budget || "mid";
    var result = { type: "", desc: "", candidates: [], extraNote: "" };

    var pieceTop = "mid";
    var pieceMax = -1;
    ["small", "mid", "large"].forEach(function (k) {
      var v = score[k] || 0;
      if (v > pieceMax) { pieceMax = v; pieceTop = k; }
    });
    var wantsCoaster = (score.ballcoaster || 0) >= 3;

    // 対象年齢が1〜2歳ごろの場合、マグ・フォーマー（3歳〜）は対象年齢外のため候補から外す
    if (age === "young") {
      if (wantsCoaster) {
        result.type = "ボールコースター重視タイプ（1〜2歳向け）";
        result.desc = "1〜2歳ごろから、ボールを転がす遊びをさせたい使い方です。ピタゴラス「知育いっぱい！ボールコースター」シリーズが対象年齢（1歳6か月〜）に合う候補です。";
        result.candidates = (pieceTop === "large" || budget === "high") ? [PRODUCTS.bcdx, PRODUCTS.bc] : [PRODUCTS.bc, PRODUCTS.bcdx];
      } else if (shape === "stick") {
        result.type = "スティック＆ボール型タイプ（1〜2歳向け）";
        result.desc = "1〜2歳ごろから、プレート型とは異なるスティック状のパーツで遊ばせたい使い方です。スティック・オーが対象年齢（1歳6か月〜）に合う候補です。";
        result.candidates = [PRODUCTS.sticko];
      } else {
        result.type = "1〜2歳向けの入門タイプ";
        result.desc = "1〜2歳ごろから始めやすい候補です。マグ・フォーマーシリーズは対象年齢が3歳〜のため、今回は候補に含めていません。";
        result.candidates = [PRODUCTS.sticko, PRODUCTS.bc];
      }
      result.extraNote = "マグ・フォーマーシリーズは公式に対象年齢3歳〜と案内されているため、1〜2歳ごろのお子さんには今回ご案内していません。";
      return result;
    }

    // 3歳以上（または年齢幅があるきょうだい向け）
    if (wantsCoaster) {
      result.type = "ボールコースター重視タイプ";
      result.desc = "ボールを転がす遊びをさせたい使い方です。ピタゴラス「知育いっぱい！ボールコースター」シリーズが比較の中心になります。";
      if (pieceTop === "large" || budget === "high") {
        result.candidates = [PRODUCTS.bcdx, PRODUCTS.bc];
      } else {
        result.candidates = [PRODUCTS.bc, PRODUCTS.bcdx];
      }
    } else if (shape === "stick") {
      result.type = "スティック＆ボール型タイプ";
      result.desc = "プレート型とは異なる、スティック状のパーツで遊ばせたい使い方です。スティック・オーが候補になります。";
      result.candidates = [PRODUCTS.sticko];
    } else {
      result.type = "プレート型タイプ（ピース数で選ぶ）";
      if (pieceTop === "small") {
        result.desc = "はじめての1セットを、価格を抑えて試したい使い方です。ピース数の少ないセットが候補になります。";
        result.candidates = [PRODUCTS.hajimete];
      } else if (pieceTop === "large") {
        result.desc = "はじめからパーツ数を多く用意して、自由に作らせたい使い方です。ピース数の多いセットが候補になります。";
        result.candidates = [PRODUCTS.basic62, PRODUCTS.basicplus];
      } else {
        result.desc = "はじめてのセットよりやや多いピース数で試したい使い方です。30ピース前後のセットが候補になります。";
        result.candidates = [PRODUCTS.basicplus, PRODUCTS.hajimete];
      }
    }

    return result;
  }

  /* ---- 画面描画 ---- */
  var state;

  function reset() {
    state = {
      index: 0,
      score: { small: 0, mid: 0, large: 0, ballcoaster: 0 },
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
      "商品の順位や優劣を決めるものではありません。候補はいずれもメーカー公式情報に基づく整理です。価格は調査時点の目安です。最新価格は各販売ページでご確認ください。</p>";
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

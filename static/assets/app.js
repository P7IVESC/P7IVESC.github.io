/* ============================================================
   P7IVESC blog · app.js
   首页卡片化 / 文章页目录·灯箱·进度条·信息卡
   纯前端实现，不依赖构建流程与模板改动。
   ============================================================ */
(function () {
  "use strict";

  var hasPost = document.getElementById("postBody");

  /* ---- 外部主页入口：改这里就能加/换链接 ---- */
  var PROFILES = [
    {
      label: "EduSRC 个人主页",
      href: "https://src.sjtu.edu.cn/profile/42619/",
      note: "教育行业漏洞报告平台"
    }
  ];

  /* ---- 首页分类：key 必须与 GitHub Issue 标签名完全一致 ----
     anchor 对应 /categories.html 里各分区的 id（由 make_archive.py 生成） */
  var CATS = [
    { key: "渗透实战", en: "PENTEST", anchor: "pentest" },
    { key: "靶场复盘", en: "LABS", anchor: "labs" },
    { key: "学习笔记", en: "NOTES", anchor: "notes" }
  ];

  /* 全站归档数据（篇数、分类计数），由 make_archive.py 生成 */
  var ARCHIVE = null;

  function loadArchive(cb) {
    fetch("/assets/archive.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        ARCHIVE = d;
        if (cb) cb(d);
      })
      .catch(function () {
        if (cb) cb(null);
      });
  }

  function catAnchor(label) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].key === label) return CATS[i].anchor;
    return "";
  }

  var ICON_SHIELD =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';

  var ICON_EXT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="ext">' +
    '<path d="M7 17 17 7M9 7h8v8"/></svg>';

  /* 窄屏「目录」悬浮按钮的图标 */
  var ICON_TOC =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M4 6h16M4 12h11M4 18h13"/></svg>';

  /* 顶栏圆钮：把 Gmeek 自带的 RSS 图标换成 PROFILES[0] 的外部主页入口 */
  function initHeaderEntry() {
    if (!PROFILES.length) return;
    var a = document.getElementById("buttonRSS");
    if (!a) return;
    var p = PROFILES[0];
    var svg = a.querySelector("svg");
    var path = document.getElementById("pathRSS");
    if (path) {
      if (svg) svg.setAttribute("viewBox", "0 0 24 24");
      /* 用线描风格，跟旁边「搜索 / 主题」的线性图标保持一致 */
      path.removeAttribute("fill-rule");
      path.setAttribute("d", "M12 2.5 4 5.8v5.9c0 4.7 3.4 9.2 8 10.3 4.6-1.1 8-5.6 8-10.3V5.8L12 2.5z");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "1.8");
      path.setAttribute("stroke-linejoin", "round");
    }
    a.href = p.href;
    a.title = p.label;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
  }

  /* 文章页侧栏的链接卡 */
  function profileCard() {
    if (!PROFILES.length) return null;
    var card = document.createElement("div");
    card.className = "side-card";
    card.innerHTML =
      "<h4>链接</h4>" +
      PROFILES.map(function (p) {
        return (
          '<a class="side-link" href="' + esc(p.href) + '" target="_blank" rel="noopener noreferrer">' +
          ICON_SHIELD + "<span>" + esc(p.label) + "</span>" + ICON_EXT + "</a>"
        );
      }).join("");
    return card;
  }

  /* ============================================================
     首页：把 Gmeek 的条目列表改造成卡片墙
     ============================================================ */
  function initList() {
    var nav = document.querySelector("nav.SideNav");
    if (!nav) return;

    var links = [].slice.call(nav.querySelectorAll("a.SideNav-item"));
    if (!links.length) return;

    var items = links.map(function (a) {
      var titleEl = a.querySelector(".listTitle");
      var dateEl = a.querySelector(".LabelTime");
      var labels = [].slice.call(a.querySelectorAll(".LabelName a")).map(function (x) {
        return x.textContent.trim();
      });
      return {
        href: a.getAttribute("href"),
        title: titleEl ? titleEl.textContent.trim() : "",
        date: dateEl ? dateEl.textContent.trim() : "",
        labels: labels,
      };
    });

    /* ---- 头图区 ---- */
    var subEl = nav.previousElementSibling;
    var subtitle = "";
    if (subEl && subEl.tagName === "DIV" && !subEl.className) {
      subtitle = subEl.textContent.trim();
      subEl.parentNode.removeChild(subEl);
    }
    var avatarEl = document.querySelector("#header .avatar");
    var nameEl = document.querySelector("#header .blogTitle");
    var siteName = nameEl ? nameEl.textContent.trim() : document.title;

    var hero = document.createElement("section");
    hero.className = "hero";
    hero.innerHTML =
      (avatarEl ? '<img class="hero-avatar" src="' + avatarEl.src + '" alt="avatar">' : "") +
      "<div>" +
      '<h1 class="hero-name">' + esc(siteName) + "</h1>" +
      (subtitle ? '<p class="hero-desc">' + esc(subtitle) + "</p>" : "") +
      '<div class="hero-stats">' +
      "<span><b class=\"stat-posts\">—</b> 篇文章</span>" +
      '<span><b class="stat-words">—</b> 字</span>' +
      '<span><b class="stat-imgs">—</b> 图片</span>' +
      '<a class="stat-rss" href="/categories.html" title="按分类查看全部文章">分类索引</a>' +
      '<a class="stat-rss" href="/rss.xml" target="_blank" rel="noopener noreferrer"' +
      ' title="用阅读器订阅，新文章自动送达"><b>RSS</b> 订阅</a>' +
      "</div>" +
      "</div>";

    /* ---- 按分类分组渲染（顺序见 CATS，未知标签与未分类排最后） ---- */
    var groups = [];
    var gidx = {};
    items.forEach(function (it) {
      var k = it.labels[0] || "未分类";
      if (!(k in gidx)) {
        gidx[k] = groups.length;
        groups.push({ key: k, items: [] });
      }
      groups[gidx[k]].items.push(it);
    });
    groups.sort(function (a, b) {
      function order(k) {
        for (var i = 0; i < CATS.length; i++) if (CATS[i].key === k) return i;
        return CATS.length;
      }
      return order(a.key) - order(b.key);
    });

    nav.parentNode.insertBefore(hero, nav);

    groups.forEach(function (g) {
      var meta = null;
      for (var i = 0; i < CATS.length; i++) if (CATS[i].key === g.key) meta = CATS[i];

      var head = document.createElement("div");
      head.className = "section-head";
      head.innerHTML =
        "<h2>" + esc(g.key) + "</h2><em>" + esc(meta ? meta.en : "POSTS") + "</em>" +
        '<a class="sec-more" data-cat="' + esc(g.key) + '" href="/categories.html' +
        (meta && meta.anchor ? "#" + meta.anchor : "") + '"' +
        ' title="在分类索引里查看这一类的全部文章">全部 →</a>';

      var grid = document.createElement("div");
      grid.className = "card-grid";
      g.items.forEach(function (it) {
        grid.appendChild(cardOf(it));
      });

      nav.parentNode.insertBefore(head, nav);
      nav.parentNode.insertBefore(grid, nav);
    });
    nav.style.display = "none";

    hydrate(items, hero);

    /* 全站篇数 / 每类总数：数据来自 make_archive.py 生成的 archive.json */
    var postsEl = hero.querySelector(".stat-posts");
    loadArchive(function (d) {
      if (!d) {
        if (postsEl) postsEl.textContent = items.length;
        return;
      }
      if (postsEl) {
        postsEl.textContent = d.total;
        postsEl.parentNode.title = "全站共 " + d.total + " 篇，本页显示 " + items.length + " 篇";
      }
      var wEl = hero.querySelector(".stat-words");
      if (wEl && d.words) wEl.textContent = fmtWords(d.words);
      var iEl = hero.querySelector(".stat-imgs");
      if (iEl && d.imgs) iEl.textContent = d.imgs;
      [].forEach.call(document.querySelectorAll(".sec-more"), function (a) {
        var k = a.getAttribute("data-cat");
        var hit = null;
        (d.cats || []).forEach(function (c) {
          if (c.key === k) hit = c;
        });
        if (hit) a.textContent = "全部 " + hit.count + " 篇 →";
      });
    });
  }

  function cardOf(it) {
    var a = document.createElement("a");
    a.className = "card";
    a.href = it.href;
    a.innerHTML =
      '<div class="card-cover loading"></div>' +
      '<div class="card-body">' +
      '<h3 class="card-title">' + esc(it.title) + "</h3>" +
      '<p class="card-excerpt"></p>' +
      '<div class="card-meta">' +
      (it.date ? "<span>" + esc(it.date) + "</span>" : "") +
      (it.labels.length
        ? '<span class="dot"></span><span class="pill">' + esc(it.labels[0]) + "</span>"
        : "") +
      "</div></div>";
    it.node = a;
    return a;
  }

  /* ---- 逐篇补封面与摘要（带本地缓存；v2 增加字数字段） ---- */
  var CACHE_KEY = "gmeek_cards_v2";
  var CACHE_TTL = 30 * 24 * 3600 * 1000;
  var cache = (function () {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  })();

  function saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
  }

  function hydrate(items, hero) {
    var totalImgs = 0;
    var totalWords = 0;
    var pending = items.length;
    var touched = false;

    function done() {
      pending--;
      if (pending > 0) return;
      if (touched) saveCache();
      /* 有全站统计就用全站，没有才退回「本页」 */
      var all = ARCHIVE || {};
      var el = hero.querySelector(".stat-imgs");
      if (el && (all.imgs || totalImgs)) el.textContent = all.imgs || totalImgs;
      var w = hero.querySelector(".stat-words");
      if (w && (all.words || totalWords)) w.textContent = fmtWords(all.words || totalWords);
    }

    items.forEach(function (it) {
      var hit = cache[it.href];
      if (hit && Date.now() - (hit.t || 0) < CACHE_TTL) {
        apply(it, hit);
        totalImgs += hit.imgs || 0;
        totalWords += hit.words || 0;
        return done();
      }
      fetch(it.href)
        .then(function (r) {
          return r.text();
        })
        .then(function (html) {
          var info = parsePost(html);
          if (info) {
            cache[it.href] = {
              cover: info.cover,
              excerpt: info.excerpt,
              imgs: info.imgs,
              words: info.words,
              t: Date.now(),
            };
            touched = true;
            apply(it, info);
            totalImgs += info.imgs || 0;
            totalWords += info.words || 0;
          }
          done();
        })
        .catch(done);
    });
  }

  function parsePost(html) {
    var doc = new DOMParser().parseFromString(html, "text/html");
    var b = doc.getElementById("postBody");
    if (!b) return null;

    var imgs = b.querySelectorAll("img");
    var cover = "";
    for (var i = 0; i < imgs.length; i++) {
      var src = imgs[i].getAttribute("data-canonical-src") || imgs[i].getAttribute("src") || "";
      if (src && src.indexOf("camo.githubusercontent.com") === -1) {
        cover = src;
        break;
      }
    }
    var words = (b.textContent || "").replace(/\s/g, "").length;
    return { cover: cover, excerpt: excerptOf(b), imgs: imgs.length, words: words };
  }

  /* 总字数显示：过万折算成「x.x万」 */
  function fmtWords(n) {
    if (n >= 10000) return (Math.round(n / 1000) / 10) + "万";
    return String(n);
  }

  /* 摘要：取前几段像正文的文字拼起来（命令行、payload 这类跳过） */
  function excerptOf(root) {
    var ps = root.querySelectorAll("p");
    var out = [];
    var len = 0;
    for (var i = 0; i < ps.length && out.length < 3 && len < 55; i++) {
      var t = (ps[i].textContent || "").replace(/\s+/g, " ").trim();
      if (t.length < 8 || /^https?:/.test(t)) continue;
      if (cjkRatio(t) < 0.55) continue;
      out.push(t);
      len += t.length;
    }
    return clip(out.join(" "), 92);
  }

  function cjkRatio(t) {
    var str = t.replace(/\s/g, "");
    if (!str) return 0;
    var m = str.match(/[\u4e00-\u9fff]/g);
    return (m ? m.length : 0) / str.length;
  }

  function clip(t, n) {
    if (t.length <= n) return t;
    var cut = t.slice(0, n);
    var marks = ["。", "；", "，", "、", " ", "."];
    for (var i = 0; i < marks.length; i++) {
      var k = cut.lastIndexOf(marks[i]);
      if (k >= n * 0.6) return cut.slice(0, k + 1).trim() + "…";
    }
    return cut.trim() + "…";
  }

  function apply(it, info) {
    var card = it.node;
    var box = card.querySelector(".card-cover");
    if (info.cover) {
      var img = new Image();
      img.alt = it.title;
      img.loading = "lazy";
      img.onload = function () {
        box.classList.remove("loading");
      };
      img.src = info.cover;
      box.appendChild(img);
    } else {
      box.className = "card-cover no-img";
      box.textContent = (it.title || "·").slice(0, 1);
    }
    var ex = card.querySelector(".card-excerpt");
    if (ex && info.excerpt) ex.textContent = info.excerpt;
  }

  /* ============================================================
     文章页
     ============================================================ */
  function initPost() {
    var body = hasPost;

    /* ---- 阅读进度 ---- */
    var bar = document.createElement("div");
    bar.id = "progress";
    document.body.appendChild(bar);

    function onScroll() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- 图片编号 + 灯箱 ---- */
    var imgs = [].slice.call(body.querySelectorAll("img"));
    var lb = document.createElement("div");
    lb.id = "lightbox";
    lb.innerHTML =
      '<button id="lbClose" aria-label="关闭">×</button><img alt=""><div id="lbCount"></div>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector("img");
    var lbCount = document.getElementById("lbCount");
    var cur = 0;

    function show(i) {
      if (i < 0 || i >= imgs.length) return;
      cur = i;
      lbImg.src = imgs[i].getAttribute("data-canonical-src") || imgs[i].src;
      lbCount.textContent = i + 1 + " / " + imgs.length;
      lb.classList.add("on");
      document.body.style.overflow = "hidden";
    }
    function hide() {
      lb.classList.remove("on");
      document.body.style.overflow = "";
    }
    imgs.forEach(function (im, i) {
      im.addEventListener("click", function (e) {
        e.preventDefault();
        show(i);
      });
    });
    lb.addEventListener("click", function (e) {
      if (e.target !== lbImg) hide();
    });
    document.getElementById("lbClose").addEventListener("click", hide);
    lbImg.addEventListener("click", hide);
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("on")) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
    });

    /* ---- 右侧栏 ---- */
    var content = document.getElementById("content");
    if (!content) return;
    var side = document.createElement("aside");
    side.id = "side";
    content.appendChild(side);

    var heads = [].slice.call(body.querySelectorAll("h2, h3"));
    var tocList = null;

    /* 让高亮项留在目录自己的可视区里：只动目录的 scrollTop，页面不跟着跑 */
    function keepVisible(a) {
      if (!tocList || !tocList.clientHeight) return;
      var r = a.getBoundingClientRect();
      var b = tocList.getBoundingClientRect();
      var pad = 10;
      if (r.top < b.top + pad) tocList.scrollTop -= b.top + pad - r.top;
      else if (r.bottom > b.bottom - pad) tocList.scrollTop += r.bottom - b.bottom + pad;
    }

    /* 目录内容超过卡片高度时，加个渐隐提示"还能往下滚" */
    function syncTocHint() {
      if (!tocList) return;
      var max = tocList.scrollHeight - tocList.clientHeight;
      var can = max > 4;
      tocList.classList.toggle("can-scroll", can);
      tocList.classList.toggle("at-top", tocList.scrollTop < 4);
      tocList.classList.toggle("at-bottom", can && tocList.scrollTop > max - 4);
    }

    if (heads.length) {
      var tocCard = document.createElement("div");
      tocCard.className = "side-card toc";
      tocCard.innerHTML =
        '<h4><span>目录</span><span class="toc-count">' + heads.length + " 节</span></h4>" +
        '<ul id="toc"></ul>';
      side.appendChild(tocCard);

      tocList = tocCard.querySelector("#toc");
      heads.forEach(function (h, i) {
        if (!h.id) h.id = "h-" + i;
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = "#" + h.id;
        if (h.tagName === "H3") a.className = "lv3";
        a.textContent = h.textContent.trim();
        a.title = a.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
      });

      var links = [].slice.call(tocList.querySelectorAll("a"));
      var spy = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            var act = null;
            links.forEach(function (a) {
              var on = a.getAttribute("href") === "#" + en.target.id;
              a.classList.toggle("active", on);
              if (on) act = a;
            });
            if (act) keepVisible(act);
          });
        },
        { rootMargin: "-72px 0px -70% 0px" }
      );
      heads.forEach(function (h) {
        spy.observe(h);
      });

      syncTocHint();
      tocList.addEventListener("scroll", syncTocHint, { passive: true });
      window.addEventListener("resize", syncTocHint);
      window.addEventListener("load", syncTocHint);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(syncTocHint).catch(function () {});
      }
    }

    /* ---- 窄屏：目录收进右侧抽屉，用悬浮按钮呼出 ---- */
    if (tocList) {
      var fab = document.createElement("button");
      fab.id = "tocFab";
      fab.type = "button";
      fab.setAttribute("aria-label", "打开目录");
      fab.setAttribute("aria-expanded", "false");
      fab.innerHTML = ICON_TOC + "<span>目录</span>";
      document.body.appendChild(fab);

      var mask = document.createElement("div");
      mask.id = "tocMask";
      document.body.appendChild(mask);

      var closeBtn = document.createElement("button");
      closeBtn.id = "tocClose";
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "关闭目录");
      closeBtn.innerHTML = "&times;";
      side.insertBefore(closeBtn, side.firstChild);

      function narrow() {
        return window.matchMedia("(max-width: 900px)").matches;
      }
      function setDrawer(on) {
        var open = !!on && narrow();
        document.body.classList.toggle("toc-open", open);
        fab.setAttribute("aria-expanded", open ? "true" : "false");
        if (open) {
          var act = tocList.querySelector("a.active");
          /* 等抽屉滑出来再定位，否则量到的是位移中的位置 */
          setTimeout(function () {
            if (act) keepVisible(act);
          }, 320);
        }
      }
      fab.addEventListener("click", function () {
        setDrawer(!document.body.classList.contains("toc-open"));
      });
      mask.addEventListener("click", function () {
        setDrawer(false);
      });
      closeBtn.addEventListener("click", function () {
        setDrawer(false);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && document.body.classList.contains("toc-open")) setDrawer(false);
      });
      tocList.addEventListener("click", function (e) {
        var a = e.target && e.target.closest ? e.target.closest("a") : null;
        if (a && narrow()) setDrawer(false);
      });
      window.addEventListener("resize", function () {
        if (!narrow()) setDrawer(false);
      });
    }

    /* ---- 文章信息 ---- */
    var words = (body.textContent || "").replace(/\s/g, "").length;
    var mins = Math.max(1, Math.round(words / 380));

    var info = document.createElement("div");
    info.className = "side-card";
    info.innerHTML =
      "<h4>文章信息</h4>" +
      '<div class="side-row" data-k="date" hidden><span>发布</span><span></span></div>' +
      '<div class="side-row" data-k="label" hidden><span>分类</span><span></span></div>' +
      '<div class="side-row"><span>字数</span><span>' + words.toLocaleString() + "</span></div>" +
      '<div class="side-row"><span>图片</span><span>' + imgs.length + " 张</span></div>" +
      '<div class="side-row"><span>阅读</span><span>约 ' + mins + " 分钟</span></div>";
    side.appendChild(info);

    var linkCard = profileCard();
    if (linkCard) side.appendChild(linkCard);

    var top = document.createElement("div");
    top.className = "side-card";
    top.innerHTML =
      '<a href="#" id="toTop" style="display:block;text-align:center;text-decoration:none;color:var(--fg-soft)">↑ 回到顶部</a>';
    side.appendChild(top);
    document.getElementById("toTop").addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    /* ---- 日期与标签：来自 postList.json ---- */
    fetch("/postList.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        var here = decodeURI(location.pathname).replace(/^\//, "");
        var hit = null;
        Object.keys(data).forEach(function (k) {
          var u = data[k] && data[k].postUrl;
          if (u && decodeURI(u) === here) hit = data[k];
        });
        if (!hit) return;

        var bits = [];
        if (hit.createdDate) {
          bits.push('<span class="pm-date">' + esc(hit.createdDate) + "</span>");
        }
        (hit.labels || []).slice(0, 1).forEach(function (l) {
          if (bits.length) bits.push('<span class="sep"></span>');
          bits.push('<span class="pill">' + esc(l) + "</span>");
        });
        if (bits.length) {
          var meta = document.createElement("div");
          meta.className = "post-meta";
          meta.innerHTML = bits.join("");
          var h1 = document.querySelector("h1.postTitle");
          if (h1) h1.parentNode.insertBefore(meta, h1.nextSibling);
        }

        var rd = info.querySelector('[data-k="date"]');
        if (rd && hit.createdDate) {
          rd.hidden = false;
          rd.lastElementChild.textContent = hit.createdDate;
        }
        var rl = info.querySelector('[data-k="label"]');
        if (rl && (hit.labels || []).length) {
          var lb = hit.labels[0];
          var an = catAnchor(lb);
          rl.hidden = false;
          rl.lastElementChild.innerHTML =
            '<a class="pill" href="/categories.html' + (an ? "#" + an : "") +
            '" title="在分类索引里查看同类全部文章">' + esc(lb) + " →</a>";
        }
      })
      .catch(function () {});
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* 放在最后：确保上面的常量（缓存等）都已初始化 */
  if (hasPost) initPost();
  else initList();
  initHeaderEntry();
})();

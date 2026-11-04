/* =========================================================
   小林科技 · 交互脚本
   零依赖 / 原生 ES2019
   ========================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- toast ---------- */
  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var themeBtn = $('#themeToggle');
  function applyTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem('xl-theme', t); } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f6f5f1' : '#05060a');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------- 入场动画 ---------- */
  var introEl = $('#intro');
  function finishIntro() {
    if (document.documentElement.classList.contains('is-loaded')) return;
    document.documentElement.classList.add('is-loaded');
    document.documentElement.classList.remove('intro-lock');
    if (introEl) {
      introEl.classList.add('is-done');
      setTimeout(function () { introEl.style.display = 'none'; }, 1150);
    }
  }
  if (introEl && !reduceMotion) {
    document.documentElement.classList.add('intro-lock');
    var seenIntro = false;
    try { seenIntro = sessionStorage.getItem('xl-seen') === '1'; sessionStorage.setItem('xl-seen', '1'); } catch (e) {}
    if (seenIntro) document.documentElement.style.setProperty('--intro-delay', '.14s');
    var startIntro = function () { setTimeout(finishIntro, seenIntro ? 180 : 520); };
    if (document.readyState === 'complete') startIntro();
    else window.addEventListener('load', startIntro, { once: true });
    setTimeout(finishIntro, 2800);
  } else {
    document.documentElement.classList.add('is-loaded');
    if (introEl) introEl.style.display = 'none';
  }

  /* ---------- nav ---------- */
  var nav = $('#nav');
  var scrollBar = $('#scrollBar');
  var toTop = $('#toTop');
  var fab = $('#fab');
  var hero = $('#top');
  var lastY = 0;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 30);
    if (toTop) toTop.classList.toggle('show', y > 700);
    if (fab) {
      if (y > lastY + 8 && y > 280) fab.classList.add('is-hidden');
      else if (y < lastY - 8 || y < 120) fab.classList.remove('is-hidden');
    }
    lastY = y;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollBar) scrollBar.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });

  /* mobile menu */
  var menuBtn = $('#menuBtn');
  var mobileMenu = $('#mobileMenu');
  function setMenu(open) {
    if (!mobileMenu || !menuBtn) return;
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn) menuBtn.addEventListener('click', function () {
    setMenu(!mobileMenu.classList.contains('is-open'));
  });
  if (mobileMenu) {
    $$('a, button', mobileMenu).forEach(function (el) {
      el.addEventListener('click', function () { setMenu(false); });
    });
  }

  /* active nav link */
  var sections = $$('main section[id]');
  var navLinks = $$('.nav-links a');
  function markActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }
  if ('IntersectionObserver' in window && sections.length) {
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) markActive(en.target.id);
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { navObs.observe(s); });
  }

  /* ---------- reveal ---------- */
  var revealEls = $$('.reveal');
  function revealInView() {
    revealEls.forEach(function (el) {
      if (el.classList.contains('in')) return;
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96) el.classList.add('in');
    });
  }
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          revObs.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { revObs.observe(el); });
    requestAnimationFrame(revealInView);
    window.addEventListener('load', revealInView);
    // 滚动兜底：无头浏览器或低帧率设备上 IO 不一定回调
    var revTick = false;
    window.addEventListener('scroll', function () {
      if (revTick) return;
      revTick = true;
      requestAnimationFrame(function () { revTick = false; revealInView(); });
    }, { passive: true });
    setTimeout(revealInView, 2500);
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- hero spotlight ---------- */
  if (hero && finePointer && !reduceMotion) {
    var hx = 50, hy = 30, tx = 50, ty = 30, glowRaf = null;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 100;
      ty = ((e.clientY - r.top) / r.height) * 100;
      if (!glowRaf) glowRaf = requestAnimationFrame(tick);
    });
    function tick() {
      hx += (tx - hx) * 0.12; hy += (ty - hy) * 0.12;
      hero.style.setProperty('--px', hx + '%');
      hero.style.setProperty('--py', hy + '%');
      if (Math.abs(tx - hx) > 0.2 || Math.abs(ty - hy) > 0.2) glowRaf = requestAnimationFrame(tick);
      else glowRaf = null;
    }
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduceMotion) {
    $$('.magnetic').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (dx * 6).toFixed(1) + 'px,' + (dy * 4 - 2).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- service card glow + tilt ---------- */
  if (finePointer && !reduceMotion) {
    $$('.svc-card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
    var term = $('#heroTerminal');
    if (term) {
      term.addEventListener('pointermove', function (e) {
        var r = term.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        term.style.setProperty('--rx', (-dy * 4).toFixed(2) + 'deg');
        term.style.setProperty('--ry', (dx * 5).toFixed(2) + 'deg');
      });
      term.addEventListener('pointerleave', function () {
        term.style.setProperty('--rx', '0deg');
        term.style.setProperty('--ry', '0deg');
      });
    }
  }

  /* ---------- hero terminal typing ---------- */
  var tcBody = $('#tcBody');
  var heroLines = [
    [{ t: '$ xiaolin run 每日签到', c: 'c' }],
    [{ t: '  → 打开环境', c: 'd' }, { t: ' ................ ok', c: 'ok' }],
    [{ t: '  → 识别账号', c: 'd' }, { t: ' ............ 12 个', c: 'dim' }],
    [{ t: '  → 执行签到', c: 'd' }, { t: ' ............ 12/12 成功', c: 'ok' }],
    [{ t: '  → 耗时 38.6s', c: 'w' }, { t: '（人工约 2.4h）', c: 'dim' }],
    [{ t: '$ xiaolin run 订单报表', c: 'c' }],
    [{ t: '  → 读取表格', c: 'd' }, { t: ' ............ 1,284 行', c: 'dim' }],
    [{ t: '  → 清洗 + 去重', c: 'd' }, { t: ' ......... ok', c: 'ok' }],
    [{ t: '  → 生成 日报.xlsx', c: 'd' }, { t: ' ....... ok', c: 'ok' }]
  ];

  function renderHeroStatic() {
    if (!tcBody) return;
    tcBody.textContent = '';
    heroLines.forEach(function (segs) {
      var line = document.createElement('div');
      segs.forEach(function (s) {
        var sp = document.createElement('span');
        if (s.c) sp.className = s.c;
        sp.textContent = s.t;
        line.appendChild(sp);
      });
      tcBody.appendChild(line);
    });
  }

  async function typeHero() {
    if (!tcBody) return;
    if (reduceMotion) { renderHeroStatic(); return; }
    tcBody.textContent = '';
    for (var i = 0; i < heroLines.length; i++) {
      var line = document.createElement('div');
      tcBody.appendChild(line);
      var segs = heroLines[i];
      for (var j = 0; j < segs.length; j++) {
        var span = document.createElement('span');
        if (segs[j].c) span.className = segs[j].c;
        line.appendChild(span);
        var text = segs[j].t;
        for (var k = 0; k < text.length; k++) {
          span.textContent += text.charAt(k);
          await sleep(text.charAt(k) === ' ' ? 8 : 17);
        }
      }
      await sleep(i === 5 ? 520 : 260);
    }
  }
  if (tcBody) {
    var started = false;
    var startTyping = function () {
      if (started) return;
      started = true;
      typeHero();
    };
    if ('IntersectionObserver' in window) {
      var termObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { startTyping(); termObs.disconnect(); } });
      }, { threshold: 0.25 });
      termObs.observe(tcBody);
      setTimeout(startTyping, 1800);
    } else {
      startTyping();
    }
  }

  /* =========================================================
     需求编译器
     ========================================================= */
  var state = { platform: 'pc', goal: 'auto', scale: 's' };
  var LABEL = {
    platform: { pc: '电脑端', phone: '手机端', web: '网页', app: 'App' },
    goal: { auto: '自动化', data: '数据处理', admin: '后台系统', site: '展示页面' },
    scale: { s: '单点小事', m: '多个模块', l: '多人协作' }
  };
  var CYCLE = {
    auto: { s: '1–3 天', m: '5–10 天', l: '2–4 周' },
    data: { s: '2–4 天', m: '1–2 周', l: '3–5 周' },
    admin: { s: '约 1 周', m: '2–3 周', l: '4–6 周' },
    site: { s: '2–4 天', m: '1–2 周', l: '2–3 周' }
  };
  var BASE = {
    auto: {
      modules: [
        '流程梳理：把现在的操作拆成步骤，标出判断和异常',
        '主流程脚本：模拟平时的点击、录入、下载',
        '失败重试 + 截图 / 日志，出错能定位到哪一步',
        '结果通知：微信、邮件或直接落盘'
      ],
      deliverables: ['可执行程序或脚本 + 配置文件', '部署与使用说明（含录屏）', '源码与依赖清单'],
      needs: ['一个能用的账号或样例数据', '你平时操作的录屏 / 口述', '希望什么时候自动跑']
    },
    data: {
      modules: [
        '数据源接入：Excel / CSV / 接口 / 数据库',
        '清洗规则：去重、补全、格式统一、异常值标记',
        '汇总与报表：按你要的口径出结果',
        '导入导出：结果能直接发群、进系统'
      ],
      deliverables: ['清洗脚本或网页小工具', '规则说明 + 样例结果', '源码'],
      needs: ['一份脱敏样例数据', '期望结果长什么样', '数据多久更新一次']
    },
    admin: {
      modules: [
        '登录与角色权限：谁能看、谁能改',
        '核心数据表设计 + 增删改查',
        '列表筛选、批量操作、导出 Excel',
        '操作日志：谁在什么时候改了什么'
      ],
      deliverables: ['可部署的网站（前端 + 后端 + 数据库）', '管理员账号与权限配置', '部署文档'],
      needs: ['有哪几种角色、各自能做什么', '每天谁在用、在什么设备上用', '要管哪些数据']
    },
    site: {
      modules: [
        '页面结构与文案梳理：先说清楚你是谁、解决什么',
        '响应式布局：手机、平板、电脑都不塌',
        '动效与交互：好看，但不拖慢打开速度',
        '表单 / 联系方式 / 统计：访客能找得到你'
      ],
      deliverables: ['上线的网址', '源码与素材', '后台账号（如需要改内容）'],
      needs: ['品牌资料 / logo（没有也能做）', '最想突出的三件事', '两三个你喜欢的参考网站']
    }
  };
  var EXTRA = {
    m: {
      auto: ['多账号 / 多设备调度', '配置面板：改参数不用改代码'],
      data: ['定时任务，每天自动跑', '结果看板'],
      admin: ['数据看板与常用报表', '文件上传 / 批量导入'],
      site: ['多页面与内容后台', '基础 SEO 与分享卡片']
    },
    l: {
      auto: ['任务队列与并发控制', '运行看板与告警', '权限与操作记录'],
      data: ['多人协作与权限', '历史版本与回溯'],
      admin: ['多角色 / 多门店', '对账与经营报表', '对外接口'],
      site: ['数据看板', '多语言 / 多品牌', 'A/B 与投放落地']
    }
  };
  var PLATFORM_MOD = {
    pc: '适配 Windows，双击即用，可设开机自启',
    phone: '安卓真机运行（需要一台常开的手机或模拟器）',
    web: '浏览器打开即用，手机端同样适配',
    app: '打包成可安装的 App，含上架所需材料'
  };

  function buildPlan() {
    var base = BASE[state.goal];
    var extra = (EXTRA[state.scale] || {})[state.goal] || [];
    var modules = base.modules.concat(extra);
    if (state.scale !== 's') modules.push(PLATFORM_MOD[state.platform]);
    var SMALL = { auto: '自动化小工具', data: '数据处理脚本', admin: '轻量后台', site: '单页展示' };
    var BIG = { auto: '自动化系统', data: '数据处理流程', admin: '后台管理系统', site: '展示页面' };
    var goalTitle = state.scale === 's' ? SMALL[state.goal] : BIG[state.goal];
    if (state.scale === 'l') goalTitle = goalTitle.replace('系统', '平台');
    var title = LABEL.platform[state.platform] + ' · ' + goalTitle;
    var descMap = {
      auto: '把固定流程交给程序：输入在哪、怎么处理、结果怎么通知你，一条链路先跑通。',
      data: '把散在各处的数据收拢、洗干净、按你的口径汇总，省掉每天手动复制粘贴。',
      admin: '把业务搬进一个能登录、能查、能改、能导出的后台，谁做了什么都有记录。',
      site: '一个能把事情讲清楚、手机上也好看的页面，访客看完知道怎么找你。'
    };
    return {
      title: title,
      desc: descMap[state.goal],
      modules: modules,
      deliverables: base.deliverables,
      cycle: CYCLE[state.goal][state.scale],
      needs: base.needs,
      scaleText: LABEL.scale[state.scale]
    };
  }

  var cpBody = $('#cpBody');
  var cpState = $('#cpState');
  var copyBtn = $('#copyPlan');
  var compileBtn = $('#compileBtn');
  var currentPlan = null;
  var compileTimer = null;

  function planHTML(p) {
    var mods = p.modules.map(function (m) { return '<li>' + m + '</li>'; }).join('');
    var dels = p.deliverables.join('、');
    var needs = p.needs.join('；');
    return '<div class="plan">' +
      '<div class="plan-top">' +
        '<span class="plan-tag">方案草稿 · 不含报价</span>' +
        '<h3>' + p.title + '</h3>' +
        '<p class="plan-desc">' + p.desc + '</p>' +
      '</div>' +
      '<div class="plan-sec"><h4>建议模块</h4><ul>' + mods + '</ul></div>' +
      '<div class="plan-meta">' +
        '<div><dt>大概周期</dt><dd>' + p.cycle + '</dd></div>' +
        '<div><dt>规模</dt><dd>' + p.scaleText + '</dd></div>' +
        '<div><dt>交付</dt><dd>源码 + 文档</dd></div>' +
      '</div>' +
      '<div class="plan-sec"><h4>你会拿到</h4><ul>' +
        p.deliverables.map(function (d) { return '<li>' + d + '</li>'; }).join('') +
      '</ul></div>' +
      '<div class="plan-sec"><h4>需要你准备</h4><ul>' +
        p.needs.map(function (n) { return '<li>' + n + '</li>'; }).join('') +
      '</ul></div>' +
      '<p class="plan-note">周期按“需求不再变”估算。真实功能清单和价格，聊完再定；预算有限可以先做最小版本。</p>' +
    '</div>';
  }

  function compile(animate) {
    var p = buildPlan();
    currentPlan = p;
    if (copyBtn) copyBtn.disabled = false;
    if (!cpBody) return;

    function paint() {
      cpBody.innerHTML = planHTML(p);
      if (cpState) {
        cpState.textContent = 'READY';
        cpState.classList.remove('is-busy');
      }
      if (compileBtn) compileBtn.classList.remove('is-loading');
    }

    clearTimeout(compileTimer);
    if (!animate || reduceMotion) { paint(); return; }
    if (cpState) { cpState.textContent = 'COMPILING'; cpState.classList.add('is-busy'); }
    if (compileBtn) compileBtn.classList.add('is-loading');
    compileTimer = setTimeout(paint, 520);
  }

  $$('.pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      var field = pill.dataset.field;
      var value = pill.dataset.value;
      state[field] = value;
      $$('.pill[data-field="' + field + '"]').forEach(function (p) {
        var on = p === pill;
        p.classList.toggle('is-on', on);
        p.setAttribute('aria-checked', String(on));
      });
      compile(true);
    });
  });

  function applyPreset(preset) {
    var parts = preset.split(',');
    if (parts.length !== 3) return;
    state.platform = parts[0];
    state.goal = parts[1];
    state.scale = parts[2];
    $$('.pill').forEach(function (p) {
      var on = state[p.dataset.field] === p.dataset.value;
      p.classList.toggle('is-on', on);
      p.setAttribute('aria-checked', String(on));
    });
    compile(true);
  }
  $$('.preset').forEach(function (b) {
    b.addEventListener('click', function () { applyPreset(b.dataset.preset); });
  });
  if (compileBtn) compileBtn.addEventListener('click', function () { compile(true); });
  if (cpBody) compile(false);

  function planText(p) {
    return '【小林科技 · 方案草稿】\n' +
      '方向：' + p.title + '\n' +
      '规模：' + p.scaleText + '　大概周期：' + p.cycle + '\n\n' +
      '建议模块：\n' + p.modules.map(function (m, i) { return (i + 1) + '. ' + m; }).join('\n') + '\n\n' +
      '交付：' + p.deliverables.join('、') + '\n' +
      '需要准备：' + p.needs.join('；') + '\n\n' +
      '（草稿不作为报价，具体聊完再定）';
  }

  function copyText(text, okMsg) {
    var done = function () { toast(okMsg || '已复制'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e) { toast('复制失败，请手动选择'); }
    document.body.removeChild(ta);
  }
  if (copyBtn) copyBtn.addEventListener('click', function () {
    if (currentPlan) copyText(planText(currentPlan), '方案已复制，发给小林就行');
  });

  /* =========================================================
     模拟终端
     ========================================================= */
  var screen = $('#consScreen');
  var form = $('#consForm');
  var input = $('#consCmd');
  var history = [];
  var hIndex = -1;
  var busy = false;
  var queue = [];

  var V = {
    help: [
      ['可用命令：', 'ok'],
      ['  demo 签到      手机多账号签到', 'out'],
      ['  demo 报表      表格清洗 + 汇总', 'out'],
      ['  demo 重命名    批量文件重命名', 'out'],
      ['  price          关于报价', 'out'],
      ['  contact        联系方式', 'out'],
      ['  clear          清屏', 'out'],
      ['', 'gap'],
      ['提示：输入框支持 ↑ ↓ 翻历史记录。', 'dim']
    ],
    'demo 签到': [
      ['[1/4] 检查设备连接 ............... ok', 'ok'],
      ['[2/4] 读取账号列表 ............... 12 个', 'out'],
      ['[3/4] 逐个执行签到 ............... 12/12', 'ok'],
      ['[4/4] 汇总结果并推送通知 ......... ok', 'ok'],
      ['', 'gap'],
      ['完成，用时 38.6s。人工做一遍大约 2.4 小时。', 'warn'],
      ['明天同一时间会自动再跑一次。', 'dim']
    ],
    'demo 报表': [
      ['[1/4] 扫描目录，找到 37 个表格 .... ok', 'ok'],
      ['[2/4] 合并 + 去重 .................. 1,284 行', 'out'],
      ['[3/4] 按客户 + 日期汇总 ........... ok', 'ok'],
      ['[4/4] 输出 日报.xlsx .............. ok', 'ok'],
      ['', 'gap'],
      ['完成。以后每天 08:00 自动跑，结果发到微信。', 'warn'],
      ['异常数据单独列在「待核对」页签里，不会悄悄丢。', 'dim']
    ],
    'demo 重命名': [
      ['[1/3] 读取 216 个文件 ............. ok', 'ok'],
      ['[2/3] 按「日期_客户_编号」改名 .... ok', 'ok'],
      ['[3/3] 生成对照表 rename.csv ....... ok', 'ok'],
      ['', 'gap'],
      ['完成。原来的名字都留在对照表里，随时能改回去。', 'warn']
    ],
    price: [
      ['报价这件事，一句话说不清：', 'out'],
      ['  · 不按小时计费，不拖时间', 'out'],
      ['  · 先聊功能，能砍的先砍，再给固定总价', 'out'],
      ['  · 预算少就先做最小可用版，跑通再加', 'out'],
      ['', 'gap'],
      ['具体数字，微信上聊完给你。', 'warn']
    ],
    contact: [
      ['微信：零遇（点右下角「微信」扫码）', 'ok'],
      ['抖音：薄想 · 30786753040', 'ok'],
      ['', 'gap'],
      ['加好友备注「小林科技」，通过更快。', 'dim']
    ]
  };

  function pushLine(text, cls) {
    if (!screen) return;
    var d = document.createElement('div');
    d.className = 'ln ' + (cls ? 'ln-' + cls : 'ln-out');
    d.textContent = text || '\u00a0';
    screen.appendChild(d);
    screen.scrollTop = screen.scrollHeight;
  }
  function pushCommand(cmd) {
    if (!screen) return;
    var d = document.createElement('div');
    d.className = 'ln ln-cmd';
    d.textContent = cmd;
    screen.appendChild(d);
    screen.scrollTop = screen.scrollHeight;
  }

  async function runCommand(raw) {
    var cmd = (raw || '').trim();
    if (!cmd) return;
    pushCommand(cmd);
    history.push(cmd);
    hIndex = history.length;
    var key = cmd.toLowerCase().replace(/\s+/g, ' ');
    if (key === 'clear' || key === 'cls') {
      screen.textContent = '';
      return;
    }
    var out = V[key];
    if (key === 'help' || key === '?') out = V.help;
    if (!out) {
      pushLine('未知命令「' + cmd + '」。输入 help 看看能做什么。', 'err');
      return;
    }
    busy = true;
    for (var i = 0; i < out.length; i++) {
      pushLine(out[i][0], out[i][1]);
      await sleep(reduceMotion ? 0 : (out[i][1] === 'gap' ? 40 : 90));
    }
    busy = false;
    if (queue.length) { var next = queue.shift(); runCommand(next); }
  }

  function bootConsole() {
    if (!screen) return;
    pushLine('小林科技 · 自动化工坊 [Version 1.0]', 'ok');
    pushLine('输入 help 查看命令，或点下面的场景试试。', 'dim');
    pushLine('', 'gap');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!input) return;
      var v = input.value;
      input.value = '';
      if (busy) { queue.push(v); return; }
      runCommand(v);
    });
  }
  if (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!history.length) return;
        hIndex = Math.max(0, hIndex - 1);
        input.value = history[hIndex] || '';
        setTimeout(function () { input.setSelectionRange(input.value.length, input.value.length); }, 0);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!history.length) return;
        hIndex = Math.min(history.length, hIndex + 1);
        input.value = history[hIndex] || '';
      }
    });
  }
  $$('.cons-chips button').forEach(function (b) {
    b.addEventListener('click', function () {
      var cmd = b.dataset.cmd;
      if (busy) { queue.push(cmd); return; }
      runCommand(cmd);
      if (input) input.focus({ preventScroll: true });
    });
  });
  if (screen) {
    var consStarted = false;
    var startCons = function () {
      if (consStarted) return;
      consStarted = true;
      bootConsole();
      setTimeout(function () { if (!busy) runCommand('demo 签到'); }, reduceMotion ? 0 : 900);
    };
    if ('IntersectionObserver' in window) {
      var consObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { startCons(); consObs.disconnect(); } });
      }, { threshold: 0.2 });
      consObs.observe(screen);
    } else {
      startCons();
    }
  }

  /* =========================================================
     案例筛选
     ========================================================= */
  var filters = $$('.filter');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      filters.forEach(function (x) {
        x.classList.toggle('is-on', x === f);
        x.setAttribute('aria-selected', String(x === f));
      });
      var cat = f.dataset.filter;
      $$('.work-card').forEach(function (card) {
        var show = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('is-hidden', !show);
        if (show) {
          card.classList.remove('in');
          void card.offsetWidth;
          card.classList.add('in');
        }
      });
    });
  });

  /* =========================================================
     FAQ：一次只开一个
     ========================================================= */
  var faqs = $$('.faq-item');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqs.forEach(function (o) { if (o !== item) o.open = false; });
      }
    });
  });

  /* =========================================================
     二维码弹窗
     ========================================================= */
  var modal = $('#qrModal');
  var lastFocus = null;
  function setPane(name) {
    if (!modal) return;
    $$('.mtab', modal).forEach(function (t) {
      var on = t.dataset.pane === name;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
    });
    $$('[data-pane-body]', modal).forEach(function (p) {
      p.classList.toggle('is-on', p.dataset.paneBody === name);
    });
  }
  function openQR(name) {
    if (!modal) return;
    lastFocus = document.activeElement;
    setPane(name || 'wechat');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var card = $('.modal-card', modal);
    if (card) setTimeout(function () { card.focus(); }, 40);
  }
  function closeQR() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $$('[data-qr]').forEach(function (b) {
    b.addEventListener('click', function () { openQR(b.dataset.qr); });
  });
  if (modal) {
    $$('[data-close]', modal).forEach(function (b) { b.addEventListener('click', closeQR); });
    $$('.mtab', modal).forEach(function (t) {
      t.addEventListener('click', function () { setPane(t.dataset.pane); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('is-open')) closeQR();
      if (mobileMenu && mobileMenu.classList.contains('is-open')) setMenu(false);
    }
    if (e.key === 'Tab' && modal && modal.classList.contains('is-open')) {
      var focusables = $$('button, [href], input, select, textarea', modal).filter(function (el) {
        return !el.disabled && el.offsetParent !== null;
      });
      if (!focusables.length) return;
      var first = focusables[0], last = focusables[focusables.length - 1];
      var active = document.activeElement;
      if (focusables.indexOf(active) === -1) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- copy douyin id ---------- */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      copyText(b.dataset.copy, '抖音号已复制：' + b.dataset.copy);
    });
  });

  /* ---------- misc ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // 滚动兜底：终端与模拟器在接近视口时启动，避免快速滚动错过 IntersectionObserver
  window.addEventListener('scroll', function () {
    if (tcBody && typeof startTyping === 'function' && !started) {
      var tr = tcBody.getBoundingClientRect();
      if (tr.top < window.innerHeight * 1.15) startTyping();
    }
    if (screen && typeof startCons === 'function' && !consStarted) {
      var sr = screen.getBoundingClientRect();
      if (sr.top < window.innerHeight * 1.15) startCons();
    }
  }, { passive: true });

  window.__xlReady = true;
})();

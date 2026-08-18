/**
 * Frameby 대시보드 공용 네비게이션 (v2 — 좌측 부서별 아코디언 사이드바)
 * ------------------------------------------------------------
 * 사용법: 각 대시보드 HTML 어디든(<head> 안이든 </body> 시작 직후든) 한 줄만 추가
 *   <script src="https://frameby-marketing.github.io/Dashboard_Hub/nav.js"></script>
 *
 * v2 변경점 (기존 상단 가로 네비게이션 대체)
 *  - 상단 가로 바 → 좌측 세로 사이드바
 *  - 부서(Marketing / Finance & Admin / Operation) 단위 아코디언:
 *    부서를 클릭하면 하위 항목이 펼쳐지고, 다른 부서를 클릭하면 이전에
 *    펼쳐져 있던 부서는 자동으로 접힙니다. (같은 부서를 다시 누르면 접힘)
 *  - 사이드바 우측 상단 버튼으로 접기/펼치기 가능. 상태는 localStorage에
 *    저장되어 모든 대시보드(같은 origin)에서 동일하게 유지됩니다.
 *  - body에 자동으로 margin-left를 줘서 사이드바 폭만큼 본문을 밀어냅니다.
 *    (각 대시보드 HTML 구조를 직접 몰라도 동작하도록 만든 범용 방식입니다.
 *     100vw 기준으로 폭을 잡는 요소가 있는 페이지는 오른쪽에 사이드바 폭만큼
 *     여백이 남거나 가로 스크롤이 생길 수 있으니, 배포 후 각 페이지에서
 *     한 번씩 확인해 주세요.)
 *
 * Operation 페이지 연동 (index-operation.html 등 탭 기반 페이지)
 *   window.__fbOperationSetTab = function (tabId) { ... }
 *   를 정의해두면, Operation 부서 하위 항목을 "Operation 페이지 위에서" 클릭했을 때
 *   전체 새로고침 없이 그 함수가 호출되고 location.hash만 바뀝니다.
 *   함수가 없거나 지금 보고 있는 페이지가 Operation이 아니면, 평범한 링크
 *   이동(baseUrl + '#tabId')으로 동작합니다.
 * ------------------------------------------------------------
 */
(function () {
  const KEY = "fb-google-token";
  window.FBAuth = {
    save(accessToken, expiresInSeconds) {
      const ttl = (expiresInSeconds ? expiresInSeconds * 1000 : 3600 * 1000) - 60000; // 60초 여유
      const record = { access_token: accessToken, expires_at: Date.now() + Math.max(ttl, 0) };
      try { localStorage.setItem(KEY, JSON.stringify(record)); } catch (e) {}
    },
    get() {
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        const record = JSON.parse(raw);
        if (!record || !record.access_token || !record.expires_at) return null;
        if (Date.now() >= record.expires_at) { this.clear(); return null; }
        return record.access_token;
      } catch (e) { return null; }
    },
    clear() {
      try { localStorage.removeItem(KEY); } catch (e) {}
    },
  };
})();

(function () {
  const HOME_URL = "https://frameby-marketing.github.io/Dashboard_Hub/";
  const COLLAPSE_KEY = "fb-sidebar-collapsed";
  const SIDEBAR_ID = "fb-sidebar";
  const WIDTH_OPEN = 248;
  const WIDTH_COLLAPSED = 60;

  // ── 부서별 구조 ──────────────────────────────────────────
  // Marketing / Finance & Admin 항목은 각각 별도 GitHub Pages 사이트로 이동합니다.
  // Operation 항목은 index-operation.html 한 페이지 안의 탭이라 tab 값만 갖습니다.
  const DEPARTMENTS = [
    {
      id: "marketing", name: "Marketing", icon: "📊",
      items: [
        { id: "main", icon: "💰", name: "전체 플랫폼 매출", url: "https://frameby-marketing.github.io/MAIN-/" },
        { id: "product", icon: "📦", name: "제품별 성과", url: "https://frameby-marketing.github.io/Product/" },
        { id: "ads", icon: "📢", name: "광고", url: "https://frameby-marketing.github.io/ADS/" },
      ],
    },
    {
      id: "finance", name: "Finance & Admin", icon: "🧾",
      items: [
        { id: "profit", icon: "📈", name: "영업이익", url: "https://frameby-marketing.github.io/MARKETING-DASHBOARD/" },
        { id: "financeDetail", icon: "💵", name: "재무", url: "https://frameby-marketing.github.io/Finance/" },
      ],
    },
    {
      id: "operation", name: "Operation", icon: "🧭",
      baseUrl: "https://frameby-marketing.github.io/Operation/",
      items: [
        { id: "overview", name: "종합현황", tab: "overview" },
        { id: "shipping", name: "택배 / 출고", tab: "shipping" },
        { id: "production", name: "제작 현황", tab: "production" },
        { id: "payment", name: "결제 관리", tab: "payment" },
        { id: "inbound", name: "입고 예정", tab: "inbound" },
        { id: "inboundManage", name: "입고 관리", tab: "inboundManage" },
        { id: "inventory", name: "재고 관리", tab: "inventory" },
        { id: "coupang", name: "쿠팡 판매", tab: "coupang" },
        { id: "reorder", name: "발주관리", tab: "reorder" },
      ],
    },
  ];

  function firstPathSegment(pathname) {
    return (pathname.split("/").filter(Boolean)[0] || "").toLowerCase();
  }
  function repoSegmentOf(url) {
    try { return firstPathSegment(new URL(url).pathname); } catch (e) { return ""; }
  }

  const currentSeg = firstPathSegment(location.pathname);

  // 현재 페이지가 속한 부서/항목을 URL(또는 Operation이면 location.hash)로 판별
  function detectActive() {
    for (const dept of DEPARTMENTS) {
      if (dept.baseUrl && repoSegmentOf(dept.baseUrl) === currentSeg) {
        const hashTab = (location.hash || "").replace("#", "");
        const item = dept.items.find(it => it.tab === hashTab) || dept.items[0];
        return { deptId: dept.id, itemId: item ? item.id : null };
      }
      for (const item of dept.items) {
        if (item.url && repoSegmentOf(item.url) === currentSeg) {
          return { deptId: dept.id, itemId: item.id };
        }
      }
    }
    return { deptId: null, itemId: null };
  }

  let active = detectActive();
  let openDeptId = active.deptId;

  if (document.body) boot(); else document.addEventListener("DOMContentLoaded", boot);

  function boot() {
    if (document.getElementById(SIDEBAR_ID)) return; // 중복 삽입 방지
    injectStyle();
    render();
    applyBodyOffset();
    // 대시보드 자체 스크립트가 로그인 후 document.body 내용을 통째로
    // 다시 그리는 경우를 대비해, 사이드바가 사라지면 자동으로 복구한다
    const observer = new MutationObserver(() => {
      if (!document.getElementById(SIDEBAR_ID)) { render(); applyBodyOffset(); }
    });
    observer.observe(document.body, { childList: true });
    window.addEventListener("load", () => {
      if (!document.getElementById(SIDEBAR_ID)) { render(); applyBodyOffset(); }
    });
    window.addEventListener("hashchange", () => {
      active = detectActive();
      if (active.deptId) openExclusively(active.deptId);
      updateActiveHighlight();
    });
  }

  function isCollapsed() {
    try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch (e) { return false; }
  }
  function setCollapsed(val) {
    try { localStorage.setItem(COLLAPSE_KEY, val ? "1" : "0"); } catch (e) {}
  }

  function injectStyle() {
    const style = document.createElement("style");
    style.textContent = `
      #${SIDEBAR_ID}{position:fixed;top:0;left:0;bottom:0;z-index:99999;
        display:flex;flex-direction:column;width:${WIDTH_OPEN}px;
        background:#12151c;border-right:1px solid #2a2f3d;
        font-family:-apple-system,BlinkMacSystemFont,"Pretendard","Apple SD Gothic Neo",sans-serif;
        transition:width .18s ease;overflow:hidden;box-sizing:border-box;}
      #${SIDEBAR_ID} *{box-sizing:border-box;}
      #${SIDEBAR_ID}.collapsed{width:${WIDTH_COLLAPSED}px;}
      .fb-sb-top{display:flex;align-items:center;justify-content:space-between;gap:8px;
        padding:16px 14px;border-bottom:1px solid #2a2f3d;flex-shrink:0;}
      .fb-sb-home{display:flex;align-items:center;gap:8px;color:#eef0f5;font-size:14px;font-weight:700;
        text-decoration:none;white-space:nowrap;overflow:hidden;}
      #${SIDEBAR_ID}.collapsed .fb-sb-home span.label{display:none;}
      .fb-sb-toggle{flex-shrink:0;width:28px;height:28px;border-radius:8px;border:1px solid #2a2f3d;
        background:#1a1f2c;color:#c7cede;cursor:pointer;display:flex;align-items:center;justify-content:center;
        font-size:13px;}
      .fb-sb-toggle:hover{background:#232838;color:#eef0f5;}
      .fb-sb-body{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 8px;}
      .fb-sb-body::-webkit-scrollbar{width:6px;}
      .fb-sb-body::-webkit-scrollbar-thumb{background:#2a2f3d;border-radius:3px;}
      .fb-dept{margin-bottom:4px;}
      .fb-dept-head{display:flex;align-items:center;gap:10px;width:100%;padding:11px 10px;border:none;
        background:transparent;color:#c7cede;font-size:13px;font-weight:700;letter-spacing:.01em;
        border-radius:10px;cursor:pointer;text-align:left;white-space:nowrap;overflow:hidden;
        font-family:inherit;}
      .fb-dept-head:hover{background:#1a1f2c;color:#eef0f5;}
      .fb-dept-head .fb-dept-icon{flex-shrink:0;font-size:15px;width:20px;text-align:center;}
      .fb-dept-head .fb-dept-name{flex:1;overflow:hidden;text-overflow:ellipsis;}
      .fb-dept-head .fb-dept-caret{flex-shrink:0;font-size:11px;color:#6d7690;transition:transform .18s;}
      .fb-dept.open .fb-dept-head .fb-dept-caret{transform:rotate(90deg);}
      .fb-dept.open .fb-dept-head{background:rgba(91,140,255,.10);color:#eef0f5;}
      #${SIDEBAR_ID}.collapsed .fb-dept-name,
      #${SIDEBAR_ID}.collapsed .fb-dept-caret{display:none;}
      #${SIDEBAR_ID}.collapsed .fb-dept-head{justify-content:center;padding:11px 0;}
      .fb-dept-items{display:grid;grid-template-rows:0fr;transition:grid-template-rows .18s ease;}
      .fb-dept.open .fb-dept-items{grid-template-rows:1fr;}
      .fb-dept-items-inner{overflow:hidden;padding:2px 0 6px;}
      #${SIDEBAR_ID}.collapsed .fb-dept-items{display:none;}
      .fb-item{display:flex;align-items:center;gap:9px;padding:9px 10px 9px 32px;border-radius:9px;
        color:#9aa3b8;font-size:13px;text-decoration:none;white-space:nowrap;overflow:hidden;
        text-overflow:ellipsis;cursor:pointer;border:none;background:transparent;width:100%;
        text-align:left;font-family:inherit;}
      .fb-item:hover{background:#1a1f2c;color:#eef0f5;}
      .fb-item .fb-item-dot{flex-shrink:0;width:6px;height:6px;border-radius:50%;background:#4b5468;}
      .fb-item.active{background:rgba(91,140,255,.15);color:#8fb1ff;font-weight:600;}
      .fb-item.active .fb-item-dot{background:#8fb1ff;box-shadow:0 0 8px #5b8cff;}
      body.fb-has-sidebar{margin-left:${WIDTH_OPEN}px;transition:margin-left .18s ease;}
      body.fb-has-sidebar.fb-sidebar-collapsed{margin-left:${WIDTH_COLLAPSED}px;}
      @media (max-width: 860px){
        #${SIDEBAR_ID}{width:${WIDTH_COLLAPSED}px;}
        body.fb-has-sidebar{margin-left:${WIDTH_COLLAPSED}px;}
      }
    `;
    document.head.appendChild(style);
  }

  function applyBodyOffset() {
    document.body.classList.add("fb-has-sidebar");
    document.body.classList.toggle("fb-sidebar-collapsed", isCollapsed());
  }

  function itemHref(dept, item) {
    if (item.tab) {
      const deptSeg = repoSegmentOf(dept.baseUrl);
      if (deptSeg === currentSeg) return "#" + item.tab; // 같은 페이지 안에서는 해시만 이동
      return dept.baseUrl + "#" + item.tab;
    }
    return item.url;
  }

  function onItemClick(ev, dept, item) {
    if (!item.tab) return; // Marketing/Finance 항목은 기본 링크 이동 그대로 둔다
    const deptSeg = repoSegmentOf(dept.baseUrl);
    if (deptSeg !== currentSeg) return; // 다른 페이지에서 클릭 → 기본 링크(전체 이동) 그대로 둔다
    ev.preventDefault();
    if (typeof window.__fbOperationSetTab === "function") {
      window.__fbOperationSetTab(item.tab);
    }
    try { history.replaceState(null, "", "#" + item.tab); } catch (e) { location.hash = item.tab; }
    active = { deptId: dept.id, itemId: item.id };
    updateActiveHighlight();
  }

  function openExclusively(deptId) {
    openDeptId = deptId;
    document.querySelectorAll(`#${SIDEBAR_ID} .fb-dept`).forEach(el => {
      el.classList.toggle("open", el.dataset.dept === deptId);
    });
  }

  function render() {
    const sidebar = document.createElement("nav");
    sidebar.id = SIDEBAR_ID;
    if (isCollapsed()) sidebar.classList.add("collapsed");

    const top = document.createElement("div");
    top.className = "fb-sb-top";
    top.innerHTML = `<a class="fb-sb-home" href="${HOME_URL}">🏠 <span class="label">Frameby</span></a>
      <button class="fb-sb-toggle" type="button" title="사이드바 접기/펼치기">${isCollapsed() ? "»" : "«"}</button>`;
    const toggleBtn = top.querySelector(".fb-sb-toggle");
    toggleBtn.addEventListener("click", () => {
      const collapsed = !sidebar.classList.contains("collapsed");
      sidebar.classList.toggle("collapsed", collapsed);
      document.body.classList.toggle("fb-sidebar-collapsed", collapsed);
      setCollapsed(collapsed);
      toggleBtn.textContent = collapsed ? "»" : "«";
    });
    sidebar.appendChild(top);

    const body = document.createElement("div");
    body.className = "fb-sb-body";

    DEPARTMENTS.forEach(dept => {
      const wrap = document.createElement("div");
      wrap.className = "fb-dept" + (openDeptId === dept.id ? " open" : "");
      wrap.dataset.dept = dept.id;

      const head = document.createElement("button");
      head.type = "button";
      head.className = "fb-dept-head";
      head.innerHTML = `<span class="fb-dept-icon">${dept.icon}</span><span class="fb-dept-name">${dept.name}</span><span class="fb-dept-caret">▸</span>`;
      head.addEventListener("click", () => {
        if (sidebar.classList.contains("collapsed")) {
          sidebar.classList.remove("collapsed");
          document.body.classList.remove("fb-sidebar-collapsed");
          setCollapsed(false);
          toggleBtn.textContent = "«";
        }
        const willOpen = !wrap.classList.contains("open");
        openExclusively(willOpen ? dept.id : null);
      });
      wrap.appendChild(head);

      const itemsOuter = document.createElement("div");
      itemsOuter.className = "fb-dept-items";
      const itemsInner = document.createElement("div");
      itemsInner.className = "fb-dept-items-inner";
      dept.items.forEach(item => {
        const a = document.createElement("a");
        a.className = "fb-item";
        a.dataset.dept = dept.id;
        a.dataset.item = item.id;
        a.href = itemHref(dept, item);
        a.innerHTML = `${item.icon ? item.icon : '<span class="fb-item-dot"></span>'}<span>${item.name}</span>`;
        a.addEventListener("click", ev => onItemClick(ev, dept, item));
        itemsInner.appendChild(a);
      });
      itemsOuter.appendChild(itemsInner);
      wrap.appendChild(itemsOuter);
      body.appendChild(wrap);
    });

    sidebar.appendChild(body);
    document.body.insertBefore(sidebar, document.body.firstChild);
    updateActiveHighlight();
  }

  function updateActiveHighlight() {
    document.querySelectorAll(`#${SIDEBAR_ID} .fb-item`).forEach(el => {
      el.classList.toggle("active", el.dataset.dept === active.deptId && el.dataset.item === active.itemId);
    });
  }
})();

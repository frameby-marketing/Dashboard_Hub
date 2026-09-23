/**
 * FRAME BY 대시보드 공용 좌측 사이드바
 * - 대시보드 라이트/다크 모드와 자동 연동
 * - 테마 localStorage 저장
 * - 라이트모드: 검정 로고
 * - 다크모드: 흰색 로고
 */

(function () {

  const HOME_URL =
    "https://frameby-marketing.github.io/Dashboard_Hub/";

  const LOGO_BLACK =
    "https://frameby-marketing.github.io/Dashboard_Hub/logo-black.png";

  const LOGO_WHITE =
    "https://frameby-marketing.github.io/Dashboard_Hub/logo-white.png";

  const COLLAPSE_KEY = "fb-sidebar-collapsed";
  const THEME_KEY = "theme";
  const LEGACY_HOME_THEME_KEY = "fb-hub-theme";

  const SIDEBAR_ID = "fb-sidebar";

  const WIDTH_OPEN = 248;
  const WIDTH_COLLAPSED = 60;

  /* 페이지 자체 초기화가 저장된 테마를 덮어쓰지 못하도록 로딩 완료 전에는 저장을 잠급니다. */
  let THEME_BOOT_LOCKED = true;
  const INITIAL_SAVED_THEME = (() => {

    try {

      const saved = localStorage.getItem(THEME_KEY);

      if (saved === "light" || saved === "dark") {

        return saved;

      }


      const legacySaved = localStorage.getItem(LEGACY_HOME_THEME_KEY);

      if (legacySaved === "light" || legacySaved === "dark") {

        return legacySaved;

      }

    }

    catch (e) {}


    return "dark";

  })();


  /* =========================================================
     메뉴 구성
     ========================================================= */

  const DEPARTMENTS = [

    {
      id: "marketing",
      name: "Marketing",

      items: [

        {
          id: "main",
          name: "전체 플랫폼 매출",
          url: "https://frameby-marketing.github.io/MAIN-/"
        },

        {
          id: "product",
          name: "제품별 성과",
          url: "https://frameby-marketing.github.io/Product/"
        },

        {
          id: "ads",
          name: "광고",
          url: "https://frameby-marketing.github.io/ADS/"
        },

      ]
    },


    {
      id: "finance",
      name: "Finance & Admin",

      items: [

        {
          id: "profit",
          name: "영업이익",
          url: "https://frameby-marketing.github.io/MARKETING-DASHBOARD/"
        },

        {
          id: "financeDetail",
          name: "재무",
          url: "https://frameby-marketing.github.io/Finance/"
        }

      ]
    },


    {
      id: "operation",
      name: "Operation",

      baseUrl:
        "https://frameby-marketing.github.io/Operation/",

      items: [

        {
          id: "overview",
          name: "종합현황",
          tab: "overview"
        },

        {
          id: "shipping",
          name: "택배 / 출고",
          tab: "shipping"
        },

        {
          id: "production",
          name: "제작 현황",
          tab: "production"
        },

        {
          id: "payment",
          name: "결제 관리",
          tab: "payment"
        },

        {
          id: "inbound",
          name: "입고 예정",
          tab: "inbound"
        },

        {
          id: "inboundManage",
          name: "입고 관리",
          tab: "inboundManage"
        },

        {
          id: "inventory",
          name: "재고 관리",
          tab: "inventory"
        },

        {
          id: "coupang",
          name: "쿠팡 판매",
          tab: "coupang"
        },

        {
          id: "reorder",
          name: "발주관리",
          tab: "reorder"
        },

        {
          id: "b2b",
          name: "B2B",
          tab: "b2b"
        }

      ]
    },


    {
      id: "cx",
      name: "CX",
      baseUrl: "https://frameby-marketing.github.io/CS/",
      groups: [
        { id: "customer", name: "고객", items: [
          { id: "customerManagement", name: "고객 관리 통합", tab: "overview" },
          { id: "inquiry", name: "고객문의", tab: "inquiry" },
          { id: "review", name: "리뷰", tab: "review" },
          { id: "chat", name: "채팅상담", tab: "chat" },
          { id: "case", name: "케이스", tab: "case" },
          { id: "outbound", name: "아웃바운드", tab: "outbound" },
          { id: "seeding", name: "SNS 씨딩", tab: "seeding" },
          { id: "social", name: "SNS 게시", tab: "social" },
          { id: "improvement", name: "개선", tab: "improvement" },
          { id: "weekly", name: "주간보고", tab: "weekly" },
          { id: "influencer", name: "인플루언서", url: "https://frameby-marketing.github.io/influencer/" }
        ]},
        { id: "delivery", name: "배송", items: [
          { id: "daily", name: "일자별", tab: "daily" },
          { id: "incidents", name: "배송사고", tab: "incidents" }
        ]},
        { id: "dispatch", name: "출고원장", items: [
          { id: "orders", name: "주문 원장", tab: "orders" },
          { id: "coupangReceiving", name: "쿠팡 입고", tab: "coupangReceiving" }
        ]},
        { id: "account", name: "계정 정보", items: [
          { id: "loginInformation", name: "로그인 정보 관리", url: "https://frameby-marketing.github.io/login/" }
        ]}
      ]
    }

  ];


  /* =========================================================
     URL / 현재 메뉴 확인
     ========================================================= */

  function firstPathSegment(pathname) {

    return (
      pathname
        .split("/")
        .filter(Boolean)[0] || ""
    ).toLowerCase();

  }


  function repoSegmentOf(url) {

    try {

      return firstPathSegment(
        new URL(url).pathname
      );

    }

    catch (e) {

      return "";

    }

  }


  const currentSeg =
    firstPathSegment(location.pathname);


  function detectActive() {

    for (const dept of DEPARTMENTS) {


      /* 같은 대시보드 안의 해시 탭과 개별 페이지를 함께 판별합니다. */
      if (dept.baseUrl && repoSegmentOf(dept.baseUrl) === currentSeg) {
        const hashTab = (location.hash || "").replace("#", "");
        const items = dept.groups ? dept.groups.flatMap(group => group.items) : dept.items;
        const item = items.find(it => it.tab === hashTab) || items.find(it => it.tab === "overview") || items[0];
        return { deptId: dept.id, itemId: item ? item.id : null };
      }
      const items = dept.groups ? dept.groups.flatMap(group => group.items) : dept.items;
      for (const item of items) {
        if (item.url && repoSegmentOf(item.url) === currentSeg) {
          return { deptId: dept.id, itemId: item.id };
        }
      }
    }


    return {

      deptId: null,

      itemId: null

    };

  }


  let active =
    detectActive();


  let openDeptId =
    active.deptId;


  /* =========================================================
     테마
     ========================================================= */

  function getTheme() {

    const htmlTheme =
      document.documentElement
        .getAttribute("data-theme");


    if (
      htmlTheme === "light" ||
      htmlTheme === "dark"
    ) {

      return htmlTheme;

    }


    try {

      const saved =
        localStorage.getItem(THEME_KEY);


      if (
        saved === "light" ||
        saved === "dark"
      ) {

        return saved;

      }

    }

    catch (e) {}


    return "dark";

  }


  function restoreTheme() {

    try {

      let saved =
        localStorage.getItem(THEME_KEY);

      /* 예전 홈에서 사용하던 키가 남아 있으면 공통 키로 한 번만 이전합니다. */
      if (saved !== "light" && saved !== "dark") {

        const legacySaved =
          localStorage.getItem(LEGACY_HOME_THEME_KEY);

        if (
          legacySaved === "light" ||
          legacySaved === "dark"
        ) {

          saved = legacySaved;
          localStorage.setItem(THEME_KEY, saved);

        }

      }

      localStorage.removeItem(LEGACY_HOME_THEME_KEY);


      if (
        saved === "light" ||
        saved === "dark"
      ) {

        document.documentElement
          .setAttribute(
            "data-theme",
            saved
          );

      }

    }

    catch (e) {}

  }


  function saveTheme(theme) {

    if (
      theme !== "light" &&
      theme !== "dark"
    ) {

      return;

    }


    try {

      localStorage.setItem(
        THEME_KEY,
        theme
      );

    }

    catch (e) {}

  }


  function syncSidebarTheme() {

    const sidebar =
      document.getElementById(
        SIDEBAR_ID
      );


    if (!sidebar) return;


    const theme =
      getTheme();


    sidebar.dataset.theme =
      theme;


    if (!THEME_BOOT_LOCKED) {

      saveTheme(theme);

    }


    const logo =
      sidebar.querySelector(
        ".fb-brand-logo"
      );


    if (logo) {

      logo.src =
        theme === "light"
          ? LOGO_BLACK
          : LOGO_WHITE;

    }

  }


  /* =========================================================
     사이드바 접기 상태
     ========================================================= */

  function isCollapsed() {

    try {

      return (
        localStorage.getItem(
          COLLAPSE_KEY
        ) === "1"
      );

    }

    catch (e) {

      return false;

    }

  }


  function setCollapsed(value) {

    try {

      localStorage.setItem(
        COLLAPSE_KEY,
        value ? "1" : "0"
      );

    }

    catch (e) {}

  }


  /* =========================================================
     CSS
     ========================================================= */

  function injectStyle() {

    if (
      document.getElementById(
        "fb-sidebar-style"
      )
    ) {

      return;

    }


    const style =
      document.createElement("style");


    style.id =
      "fb-sidebar-style";


    style.textContent = `


      /* ===============================
         DARK MODE 기본
         =============================== */

      #${SIDEBAR_ID} {

        --sb-bg:#12151c;

        --sb-border:#2a2f3d;

        --sb-text:#eef0f5;

        --sb-sub:#c7cede;

        --sb-muted:#9aa3b8;

        --sb-control:#1a1f2c;

        --sb-hover:#232838;

        --sb-scroll:#2a2f3d;

        --sb-caret:#6d7690;

        --sb-dot:#4b5468;

        --sb-active-bg:
          rgba(91,140,255,.15);

        --sb-open-bg:
          rgba(91,140,255,.10);

        --sb-active:#8fb1ff;

        --sb-active-dot:#8fb1ff;


        position:fixed;

        top:0;

        left:0;

        bottom:0;

        z-index:99999;


        display:flex;

        flex-direction:column;


        width:${WIDTH_OPEN}px;


        background:
          var(--sb-bg);


        border-right:
          1px solid var(--sb-border);


        font-family:
          -apple-system,
          BlinkMacSystemFont,
          "Pretendard",
          "Apple SD Gothic Neo",
          sans-serif;


        transition:
          width .18s ease,
          background-color .15s ease,
          border-color .15s ease;


        overflow:hidden;

        box-sizing:border-box;

      }



      /* ===============================
         LIGHT MODE
         =============================== */

      html[data-theme="light"]
      #${SIDEBAR_ID},

      #${SIDEBAR_ID}
      [data-theme="light"] {

        --sb-bg:#ffffff;

        --sb-border:#e5e7eb;

        --sb-text:#1a1d23;

        --sb-sub:#3f4652;

        --sb-muted:#6b7280;

        --sb-control:#f5f6f8;

        --sb-hover:#eceef1;

        --sb-scroll:#d6d9df;

        --sb-caret:#8a919d;

        --sb-dot:#a4aab4;

        --sb-active-bg:
          rgba(42,120,214,.10);

        --sb-open-bg:
          rgba(42,120,214,.07);

        --sb-active:#2a78d6;

        --sb-active-dot:#2a78d6;

      }



      #${SIDEBAR_ID} * {

        box-sizing:border-box;

      }



      #${SIDEBAR_ID}.collapsed {

        width:${WIDTH_COLLAPSED}px;

      }



      /* ===============================
         상단 FRAME BY
         =============================== */

      .fb-sb-top {

        display:flex;

        align-items:center;

        justify-content:
          space-between;

        gap:8px;


        padding:
          14px 12px;


        border-bottom:
          1px solid
          var(--sb-border);


        flex-shrink:0;

      }



      .fb-sb-home {

        min-width:0;


        display:flex;

        align-items:center;

        gap:9px;


        color:
          var(--sb-text);


        font-size:14px;

        font-weight:800;

        letter-spacing:.04em;


        text-decoration:none;

        white-space:nowrap;

        overflow:hidden;

      }



      .fb-brand-logo {

        width:22px;

        height:22px;

        object-fit:contain;

        flex:none;

        display:block;

      }



      .fb-sb-home .label {

        overflow:hidden;

        text-overflow:ellipsis;

      }



      #${SIDEBAR_ID}.collapsed
      .fb-sb-home span.label {

        display:none;

      }



      /* ===============================
         접기 버튼
         =============================== */

      .fb-sb-toggle {

        flex-shrink:0;

        width:28px;

        height:28px;


        border-radius:8px;


        border:
          1px solid
          var(--sb-border);


        background:
          var(--sb-control);


        color:
          var(--sb-sub);


        cursor:pointer;


        display:flex;

        align-items:center;

        justify-content:center;


        font-size:13px;

      }



      .fb-sb-toggle:hover {

        background:
          var(--sb-hover);

        color:
          var(--sb-text);

      }



      /* ===============================
         메뉴 영역
         =============================== */

      .fb-sb-body {

        flex:1;

        overflow-y:auto;

        overflow-x:hidden;

        padding:
          10px 8px;

      }



      .fb-sb-body::-webkit-scrollbar {

        width:6px;

      }



      .fb-sb-body::-webkit-scrollbar-thumb {

        background:
          var(--sb-scroll);

        border-radius:3px;

      }



      .fb-dept {

        margin-bottom:4px;

      }



      /* ===============================
         Marketing / Finance / Operation
         =============================== */

      .fb-dept-head {

        display:flex;

        align-items:center;

        gap:10px;


        width:100%;


        padding:
          11px 10px;


        border:none;


        background:
          transparent;


        color:
          var(--sb-sub);


        font-size:13px;

        font-weight:700;

        letter-spacing:.01em;


        border-radius:10px;


        cursor:pointer;

        text-align:left;

        white-space:nowrap;

        overflow:hidden;


        font-family:inherit;

      }



      .fb-dept-head:hover {

        background:
          var(--sb-control);

        color:
          var(--sb-text);

      }



      .fb-dept-name {

        flex:1;

        overflow:hidden;

        text-overflow:ellipsis;

      }



      .fb-dept-caret {

        flex-shrink:0;

        font-size:11px;

        color:
          var(--sb-caret);

        transition:
          transform .18s;

      }



      .fb-dept.open
      .fb-dept-caret {

        transform:
          rotate(90deg);

      }



      .fb-dept.open
      .fb-dept-head {

        background:
          var(--sb-open-bg);

        color:
          var(--sb-text);

      }



      /* 접었을 때 M/F/O */

      .fb-dept-collapsed-mark {

        display:none;

        width:20px;

        text-align:center;

        font-size:12px;

        font-weight:800;

        color:
          var(--sb-sub);

      }



      #${SIDEBAR_ID}.collapsed
      .fb-dept-name,

      #${SIDEBAR_ID}.collapsed
      .fb-dept-caret {

        display:none;

      }



      #${SIDEBAR_ID}.collapsed
      .fb-dept-collapsed-mark {

        display:inline-block;

      }



      #${SIDEBAR_ID}.collapsed
      .fb-dept-head {

        justify-content:center;

        padding:
          11px 0;

      }



      /* ===============================
         하위 메뉴
         =============================== */

      .fb-dept-items {

        display:grid;

        grid-template-rows:0fr;

        transition:
          grid-template-rows
          .18s ease;

      }



      .fb-dept.open
      .fb-dept-items {

        grid-template-rows:1fr;

      }



      .fb-dept-items-inner {

        overflow:hidden;

        padding:
          2px 0 6px;

      }



      #${SIDEBAR_ID}.collapsed
      .fb-dept-items {

        display:none;

      }



      .fb-item {

        display:flex;

        align-items:center;

        gap:9px;


        padding:
          9px 10px 9px 32px;


        border-radius:9px;


        color:
          var(--sb-muted);


        font-size:13px;


        text-decoration:none;

        white-space:nowrap;

        overflow:hidden;

        text-overflow:ellipsis;


        cursor:pointer;


        border:none;

        background:
          transparent;


        width:100%;

        text-align:left;

        font-family:inherit;

      }



      .fb-item:hover {

        background:
          var(--sb-control);

        color:
          var(--sb-text);

      }



      /* 모든 세부 메뉴 앞 점 */

      .fb-item-dot {

        flex-shrink:0;

        width:6px;

        height:6px;

        border-radius:50%;

        background:
          var(--sb-dot);

      }



      .fb-item.active {

        background:
          var(--sb-active-bg);

        color:
          var(--sb-active);

        font-weight:600;

      }



      .fb-item.active
      .fb-item-dot {

        background:
          var(--sb-active-dot);

        box-shadow:
          0 0 8px
          var(--sb-active-dot);

      }



      #${SIDEBAR_ID} .fb-group-head {
        width:100%;border:0;background:transparent;color:var(--sb-sub);
        font-size:13px;font-weight:600;font-family:inherit;text-align:left;padding:10px 12px 10px 29px;
        cursor:pointer;border-radius:9px;
      }
      #${SIDEBAR_ID} .fb-group-head:hover,
      #${SIDEBAR_ID} .fb-menu-group.open > .fb-group-head {background:var(--sb-open-bg);color:var(--sb-active);}
      #${SIDEBAR_ID} .fb-group-head::after {content:"▸";float:right;color:var(--sb-caret);transition:transform .18s;}
      #${SIDEBAR_ID} .fb-menu-group.open > .fb-group-head::after {transform:rotate(90deg);}
      #${SIDEBAR_ID} .fb-group-items {display:none;}
      #${SIDEBAR_ID} .fb-menu-group.open > .fb-group-items {display:block;}
      #${SIDEBAR_ID} .fb-item-nested {padding-left:47px;font-size:12px;}

      /* ===============================
         본문 위치
         =============================== */

      body.fb-has-sidebar {

        margin-left:
          ${WIDTH_OPEN}px;

        transition:
          margin-left .18s ease;

      }



      body.fb-has-sidebar
      .fb-sidebar-collapsed {

        margin-left:
          ${WIDTH_COLLAPSED}px;

      }



      body.fb-has-sidebar.fb-sidebar-collapsed {

        margin-left:
          ${WIDTH_COLLAPSED}px;

      }



      /* ===============================
         모바일
         =============================== */

      @media(max-width:860px) {

        #${SIDEBAR_ID} {

          width:
            ${WIDTH_COLLAPSED}px;

        }


        body.fb-has-sidebar {

          margin-left:
            ${WIDTH_COLLAPSED}px;

        }

      }


    `;


    document.head
      .appendChild(style);

  }



  /* =========================================================
     본문 위치
     ========================================================= */

  function applyBodyOffset() {

    document.body
      .classList
      .add(
        "fb-has-sidebar"
      );


    document.body
      .classList
      .toggle(
        "fb-sidebar-collapsed",
        isCollapsed()
      );

  }



  /* =========================================================
     링크
     ========================================================= */

  function itemHref(
    dept,
    item
  ) {

    if (item.tab) {

      const deptSeg =
        repoSegmentOf(
          dept.baseUrl
        );


      if (
        deptSeg === currentSeg
      ) {

        return "#" + item.tab;

      }


      return (
        dept.baseUrl +
        "#" +
        item.tab
      );

    }


    return item.url;

  }



  function onItemClick(
    ev,
    dept,
    item
  ) {

    if (!item.tab) {

      return;

    }


    const deptSeg =
      repoSegmentOf(
        dept.baseUrl
      );


    if (
      deptSeg !== currentSeg
    ) {

      return;

    }


    ev.preventDefault();


    const setTab = dept.id === "cx" ? window.__fbCXSetTab : window.__fbOperationSetTab;
    if (typeof setTab === "function") setTab(item.tab);


    try {

      history.replaceState(
        null,
        "",
        "#" + item.tab
      );

    }

    catch (e) {

      location.hash =
        item.tab;

    }


    active = {

      deptId: dept.id,

      itemId: item.id

    };


    updateActiveHighlight();

  }



  /* =========================================================
     아코디언
     ========================================================= */

  function openExclusively(
    deptId
  ) {

    openDeptId =
      deptId;


    document
      .querySelectorAll(
        `#${SIDEBAR_ID} .fb-dept`
      )
      .forEach(el => {

        el.classList.toggle(
          "open",
          el.dataset.dept === deptId
        );

      });

  }



  /* =========================================================
     렌더링
     ========================================================= */

  function render() {

    const sidebar =
      document.createElement("nav");


    sidebar.id =
      SIDEBAR_ID;


    if (
      isCollapsed()
    ) {

      sidebar.classList
        .add("collapsed");

    }



    /* 상단 */

    const top =
      document.createElement("div");


    top.className =
      "fb-sb-top";


    const initialLogo =
      getTheme() === "light"
        ? LOGO_BLACK
        : LOGO_WHITE;


    top.innerHTML = `

      <a
        class="fb-sb-home"
        href="${HOME_URL}"
        aria-label="FRAME BY 홈"
      >

        <img
          class="fb-brand-logo"
          src="${initialLogo}"
          alt="FRAME BY"
        >

        <span class="label">
          FRAME BY
        </span>

      </a>


      <button
        class="fb-sb-toggle"
        type="button"
        title="사이드바 접기/펼치기"
      >

        ${
          isCollapsed()
            ? "»"
            : "«"
        }

      </button>

    `;



    const toggleBtn =
      top.querySelector(
        ".fb-sb-toggle"
      );


    toggleBtn
      .addEventListener(
        "click",
        () => {

          const collapsed =
            !sidebar.classList
              .contains(
                "collapsed"
              );


          sidebar.classList
            .toggle(
              "collapsed",
              collapsed
            );


          document.body
            .classList
            .toggle(
              "fb-sidebar-collapsed",
              collapsed
            );


          setCollapsed(
            collapsed
          );


          toggleBtn.textContent =
            collapsed
              ? "»"
              : "«";

        }
      );


    sidebar
      .appendChild(top);



    /* 메뉴 */

    const body =
      document.createElement("div");


    body.className =
      "fb-sb-body";



    DEPARTMENTS
      .forEach(
        dept => {


          const wrap =
            document.createElement(
              "div"
            );


          wrap.className =
            "fb-dept" +
            (
              openDeptId ===
              dept.id
                ? " open"
                : ""
            );


          wrap.dataset.dept =
            dept.id;



          /* 부서명 */

          const head =
            document.createElement(
              "button"
            );


          head.type =
            "button";


          head.className =
            "fb-dept-head";


          head.innerHTML = `

            <span
              class="fb-dept-collapsed-mark"
            >

              ${
                dept.name
                  .charAt(0)
                  .toUpperCase()
              }

            </span>


            <span
              class="fb-dept-name"
            >

              ${dept.name}

            </span>


            <span
              class="fb-dept-caret"
            >
              ▸
            </span>

          `;



          head.addEventListener(
            "click",
            () => {


              if (
                sidebar.classList
                  .contains(
                    "collapsed"
                  )
              ) {

                sidebar.classList
                  .remove(
                    "collapsed"
                  );


                document.body
                  .classList
                  .remove(
                    "fb-sidebar-collapsed"
                  );


                setCollapsed(
                  false
                );


                toggleBtn
                  .textContent =
                  "«";

              }


              const willOpen =
                !wrap.classList
                  .contains(
                    "open"
                  );


              openExclusively(
                willOpen
                  ? dept.id
                  : null
              );

            }
          );


          wrap
            .appendChild(head);



          /* 하위 메뉴 */

          const itemsOuter =
            document.createElement(
              "div"
            );


          itemsOuter.className =
            "fb-dept-items";


          const itemsInner =
            document.createElement(
              "div"
            );


          itemsInner.className =
            "fb-dept-items-inner";



          const addItem = (item, target, nested = false) => {
            const a = document.createElement("a");
            a.className = "fb-item" + (nested ? " fb-item-nested" : "");
            a.dataset.dept = dept.id;
            a.dataset.item = item.id;
            a.href = itemHref(dept, item);
            const dot = document.createElement("span");
            dot.className = "fb-item-dot";
            const label = document.createElement("span");
            label.textContent = item.name;
            a.append(dot, label);
            a.addEventListener("click", ev => onItemClick(ev, dept, item));
            target.appendChild(a);
          };
          if (dept.groups) {
            dept.groups.forEach(group => {
              const groupWrap = document.createElement("div");
              groupWrap.className = "fb-menu-group";
              groupWrap.dataset.group = group.id;
              const groupHead = document.createElement("button");
              groupHead.type = "button";
              groupHead.className = "fb-group-head";
              groupHead.textContent = group.name;
              groupHead.setAttribute("aria-expanded", "false");
              groupHead.addEventListener("click", () => {
                const opening = !groupWrap.classList.contains("open");
                itemsInner.querySelectorAll(".fb-menu-group").forEach(el => {
                  el.classList.remove("open");
                  el.querySelector(".fb-group-head")?.setAttribute("aria-expanded", "false");
                });
                groupWrap.classList.toggle("open", opening);
                groupHead.setAttribute("aria-expanded", String(opening));
              });
              const children = document.createElement("div");
              children.className = "fb-group-items";
              group.items.forEach(item => addItem(item, children, true));
              groupWrap.append(groupHead, children);
              itemsInner.appendChild(groupWrap);
            });
          } else {
            dept.items.forEach(item => addItem(item, itemsInner));
          }


          itemsOuter
            .appendChild(
              itemsInner
            );


          wrap
            .appendChild(
              itemsOuter
            );


          body
            .appendChild(
              wrap
            );

        }
      );


    sidebar
      .appendChild(body);


    document.body
      .insertBefore(
        sidebar,
        document.body.firstChild
      );


    syncSidebarTheme();

    updateActiveHighlight();

  }



  /* =========================================================
     현재 메뉴 강조
     ========================================================= */

  function updateActiveHighlight() {

    document.querySelectorAll(`#${SIDEBAR_ID} .fb-menu-group`).forEach(group => {
      if (group.querySelector(`.fb-item[data-item="${active.itemId}"]`)) {
        group.classList.add("open");
        group.querySelector(".fb-group-head")?.setAttribute("aria-expanded", "true");
      }
    });

    document
      .querySelectorAll(
        `#${SIDEBAR_ID} .fb-item`
      )
      .forEach(
        el => {

          el.classList.toggle(

            "active",

            el.dataset.dept ===
              active.deptId &&

            el.dataset.item ===
              active.itemId

          );

        }
      );

  }



  /* =========================================================
     실행
     ========================================================= */

  function boot() {

    if (
      document.getElementById(
        SIDEBAR_ID
      )
    ) {

      return;

    }


    restoreTheme();

    injectStyle();

    render();

    applyBodyOffset();

    syncSidebarTheme();



    /* data-theme 변경 감시 */

    const themeObserver =
      new MutationObserver(
        () => {

          syncSidebarTheme();

        }
      );


    themeObserver.observe(

      document.documentElement,

      {

        attributes:true,

        attributeFilter:[
          "data-theme"
        ]

      }

    );


    /*
     * 일부 대시보드는 로딩 과정에서 data-theme="dark"를 다시 넣습니다.
     * 모든 초기 스크립트가 끝난 뒤 저장된 공통 테마를 한 번 더 적용하고,
     * 그 이후의 변경만 사용자가 선택한 값으로 저장합니다.
     */
    const finishThemeBoot = () => {

      window.setTimeout(
        () => {

          document.documentElement.setAttribute(
            "data-theme",
            INITIAL_SAVED_THEME
          );
          saveTheme(INITIAL_SAVED_THEME);
          THEME_BOOT_LOCKED = false;
          syncSidebarTheme();

        },
        250
      );

    };


    if (document.readyState === "complete") {

      finishThemeBoot();

    } else {

      window.addEventListener(
        "load",
        finishThemeBoot,
        { once:true }
      );

    }



    /* 다른 탭에서 테마 변경 */

    window.addEventListener(
      "storage",
      e => {

        if (
          e.key === THEME_KEY &&
          (
            e.newValue === "light" ||
            e.newValue === "dark"
          )
        ) {

          document.documentElement
            .setAttribute(
              "data-theme",
              e.newValue
            );


          syncSidebarTheme();

        }

      }
    );



    /* 사이드바 삭제 시 복구 */

    const bodyObserver =
      new MutationObserver(
        () => {

          if (
            !document.getElementById(
              SIDEBAR_ID
            )
          ) {

            render();

            applyBodyOffset();

            syncSidebarTheme();

          }

        }
      );


    bodyObserver.observe(

      document.body,

      {
        childList:true
      }

    );



    /* Operation 해시 */

    window.addEventListener(
      "hashchange",
      () => {

        active =
          detectActive();


        if (
          active.deptId
        ) {

          openExclusively(
            active.deptId
          );

        }


        updateActiveHighlight();

      }
    );

  }



  if (
    document.body
  ) {

    boot();

  }

  else {

    document.addEventListener(
      "DOMContentLoaded",
      boot
    );

  }


})();

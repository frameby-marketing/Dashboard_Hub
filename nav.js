/**
 * Frameby 대시보드 공용 네비게이션
 * ------------------------------------------------------------
 * 사용법: 각 대시보드 HTML 어디든(<head> 안이든 </body> 직전이든) 한 줄만 추가
 *   <script src="https://frameby-marketing.github.io/Dashboard_Hub/nav.js"></script>
 *
 * 현재 페이지가 어느 대시보드인지는 주소(URL)를 보고 자동으로 판별합니다.
 * (data-current 속성은 더 이상 필요하지 않지만, 남아있어도 무시되지 않고
 *  URL로 판별이 안 될 때만 보조적으로 사용됩니다.)
 *
 * window.FBAuth — 대시보드 5개가 전부 같은 도메인
 * (frameby-marketing.github.io) 아래에 있다는 점을 이용해, 구글 로그인으로
 * 받은 access token을 localStorage에 잠깐 저장해두는 공용 캐시입니다.
 * 각 대시보드의 로그인 스크립트에서 아래처럼 사용하세요.
 *   - 로그인 성공 시:  FBAuth.save(accessToken, expiresInSeconds)
 *   - 페이지 시작 시:  FBAuth.get() → 유효한 토큰이 있으면 그대로 재사용
 *   - 로그아웃 시:     FBAuth.clear()
 * 토큰이 만료되었거나 없으면 get()은 null을 반환하므로, 그 경우엔
 * 지금처럼 로그인 화면을 그대로 보여주면 됩니다.
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

  const DASHBOARDS = [
    { id: "main",    icon: "💰", name: "전체 매출",   url: "https://frameby-marketing.github.io/MAIN-/" },
    { id: "product", icon: "📦", name: "제품별 성과", url: "https://frameby-marketing.github.io/Product/" },
    { id: "ads",     icon: "📢", name: "광고",       url: "https://frameby-marketing.github.io/ADS/" },
    { id: "profit",  icon: "📈", name: "영업이익",    url: "https://frameby-marketing.github.io/MARKETING-DASHBOARD/" },
    { id: "order",   icon: "🚚", name: "발주",       url: "https://frameby-marketing.github.io/ORDER-DASHBOARD/" },
  ];

  // currentScript는 동기 실행 중에만 유효하므로 지금 바로 캡처해둔다
  const scriptTag = document.currentScript;

  function firstPathSegment(pathname) {
    return (pathname.split("/").filter(Boolean)[0] || "").toLowerCase();
  }

  function detectCurrentId() {
    // 1순위: 현재 페이지 주소의 첫 경로(repo명)와 대시보드 목록 URL을 비교
    try {
      const seg = firstPathSegment(location.pathname);
      const found = DASHBOARDS.find(d => firstPathSegment(new URL(d.url).pathname) === seg);
      if (found) return found.id;
    } catch (e) {}

    // 2순위: data-current 속성이 목록에 있는 id와 정확히 일치할 때만 사용
    const attr = scriptTag ? scriptTag.getAttribute("data-current") : null;
    if (attr && DASHBOARDS.some(d => d.id === attr)) return attr;

    // 둘 다 실패하면 아무 것도 선택되지 않은 상태로 표시
    return null;
  }

  const currentId = detectCurrentId();

  // <head>에 스크립트를 넣은 경우 document.body가 아직 없을 수 있으므로
  // body가 준비된 뒤에 실제 삽입 로직을 실행한다
  if (document.body) {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }

  function boot() {
    if (document.getElementById("fb-nav")) return; // 중복 삽입 방지
    render();
    // 대시보드 자체 스크립트가 로그인 후 document.body 내용을 통째로
    // 다시 그리는 경우를 대비해, 네비게이션이 사라지면 자동으로 복구한다
    const observer = new MutationObserver(() => {
      if (!document.getElementById("fb-nav")) render();
    });
    observer.observe(document.body, { childList: true });
    window.addEventListener("load", () => {
      if (!document.getElementById("fb-nav")) render();
    });
  }

  function render() {
    const style = document.createElement("style");
    style.textContent = `
      #fb-nav{position:sticky;top:0;left:0;right:0;z-index:99999;
        display:flex;align-items:center;gap:8px;flex-wrap:wrap;
        background:#12151c;border-bottom:1px solid #2a2f3d;
        padding:10px 16px;font-family:-apple-system,BlinkMacSystemFont,"Pretendard","Apple SD Gothic Neo",sans-serif;}
      #fb-nav a{text-decoration:none;}
      .fb-home{display:flex;align-items:center;gap:6px;color:#eef0f5;font-size:13px;
        padding:6px 10px;border-radius:8px;border:1px solid #2a2f3d;white-space:nowrap;}
      .fb-home:hover{background:#1f2430;}
      .fb-pill{display:flex;align-items:center;gap:6px;color:#c7cede;font-size:13px;
        padding:6px 10px;border-radius:20px;border:1px solid transparent;white-space:nowrap;}
      .fb-pill:hover{background:#1f2430;color:#eef0f5;}
      .fb-pill.active{background:rgba(91,140,255,.15);color:#8fb1ff;border-color:#3a5ba8;font-weight:600;}
    `;
    document.head.appendChild(style);

    const nav = document.createElement("div");
    nav.id = "fb-nav";

    const homeLink = document.createElement("a");
    homeLink.className = "fb-home";
    homeLink.href = HOME_URL;
    homeLink.innerHTML = "🏠 홈";
    nav.appendChild(homeLink);

    DASHBOARDS.forEach(d => {
      const a = document.createElement("a");
      a.className = "fb-pill" + (d.id === currentId ? " active" : "");
      a.href = d.url;
      a.innerHTML = `${d.icon} ${d.name}`;
      nav.appendChild(a);
    });

    document.body.insertBefore(nav, document.body.firstChild);
  }
})();

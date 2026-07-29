/**
 * Frameby 대시보드 공용 네비게이션
 * ------------------------------------------------------------
 * 사용법: 각 대시보드 HTML 어디든(<head> 안이든 </body> 직전이든) 한 줄만 추가
 *   <script src="https://frameby-marketing.github.io/Dashboard_Hub/nav.js" data-current="main"></script>
 *   → <head>에 넣어도, body 최하단에 넣어도 동일하게 동작하도록 내부적으로
 *     document.body 준비 여부를 확인 후 삽입합니다.
 *
 * data-current 값: home | main | product | ads | profit | order
 *   (생략하면 현재 페이지 URL로 자동 판별을 시도합니다)
 *
 * summary.json (선택):
 *   각 대시보드 루트에 아래와 같은 형식의 정적 JSON 파일을 두면
 *   "다른 대시보드 현황" 패널에 핵심 지표가 표시됩니다.
 *   { "updatedAt": "2026-07-30T09:00:00+09:00",
 *     "metrics": [ { "label": "이번달 매출", "value": "1.2억" },
 *                  { "label": "전일 대비", "value": "+4.3%" } ] }
 *   파일이 없으면 "연동 전" 으로 표시되며 오류가 발생하지 않습니다.
 * ------------------------------------------------------------
 */
(function () {
  const HOME_URL = "https://frameby-marketing.github.io/Dashboard_Hub/";

  const DASHBOARDS = [
    { id: "main",    icon: "💰", name: "전체 매출",     url: "https://frameby-marketing.github.io/MAIN-/" },
    { id: "product", icon: "📦", name: "제품별 성과",   url: "https://frameby-marketing.github.io/Product/" },
    { id: "ads",     icon: "📢", name: "광고",         url: "https://frameby-marketing.github.io/ADS/" },
    { id: "profit",  icon: "📈", name: "영업이익",      url: "https://frameby-marketing.github.io/MARKETING-DASHBOARD/" },
    { id: "order",   icon: "🚚", name: "발주",         url: "https://frameby-marketing.github.io/ORDER-DASHBOARD/" },
  ];

  // currentScript는 동기 실행 중에만 유효하므로 지금 바로 캡처해둔다
  // (스크립트를 <head>에 넣어도, </body> 직전에 넣어도 모두 동작하도록 하기 위함)
  const scriptTag = document.currentScript;
  let currentId = scriptTag ? scriptTag.getAttribute("data-current") : null;

  if (!currentId) {
    const href = location.href;
    const found = DASHBOARDS.find(d => href.indexOf(new URL(d.url).pathname.split("/")[1]) !== -1);
    currentId = found ? found.id : null;
  }

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
    .fb-spacer{flex:1;}
    .fb-toggle{margin-left:auto;background:#1a1e29;border:1px solid #2a2f3d;color:#c7cede;
      font-size:12px;padding:6px 12px;border-radius:8px;cursor:pointer;white-space:nowrap;}
    .fb-toggle:hover{background:#222736;}
    #fb-panel{display:none;background:#0e1016;border-bottom:1px solid #2a2f3d;
      padding:14px 16px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;}
    #fb-panel.open{display:flex;flex-wrap:wrap;gap:12px;}
    .fb-card{flex:1;min-width:190px;background:#1a1e29;border:1px solid #2a2f3d;
      border-radius:10px;padding:12px 14px;color:#eef0f5;}
    .fb-card h4{margin:0 0 8px;font-size:12px;color:#9aa3b5;display:flex;justify-content:space-between;}
    .fb-card .fb-metric{font-size:13px;display:flex;justify-content:space-between;margin:4px 0;}
    .fb-card .fb-metric span:last-child{color:#8fb1ff;font-weight:600;}
    .fb-muted{color:#5b6273;font-size:12px;}
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

  const toggle = document.createElement("button");
  toggle.className = "fb-toggle";
  toggle.textContent = "다른 대시보드 현황 ▾";
  nav.appendChild(toggle);

  document.body.insertBefore(nav, document.body.firstChild);

  const panel = document.createElement("div");
  panel.id = "fb-panel";
  document.body.insertBefore(panel, nav.nextSibling);

  let loaded = false;
  toggle.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open") && !loaded) {
      loaded = true;
      loadSummaries();
    }
  });

  function loadSummaries() {
    DASHBOARDS
      .filter(d => d.id !== currentId)
      .forEach(d => {
        const card = document.createElement("div");
        card.className = "fb-card";
        card.innerHTML = `<h4>${d.icon} ${d.name}<span class="fb-muted">불러오는 중…</span></h4>`;
        panel.appendChild(card);

        fetch(d.url + "summary.json", { cache: "no-store" })
          .then(r => { if (!r.ok) throw new Error("no summary"); return r.json(); })
          .then(data => {
            const metrics = (data.metrics || [])
              .map(m => `<div class="fb-metric"><span>${m.label}</span><span>${m.value}</span></div>`)
              .join("");
            card.innerHTML = `<h4>${d.icon} ${d.name}<span class="fb-muted">${data.updatedAt ? new Date(data.updatedAt).toLocaleString("ko-KR") : ""}</span></h4>${metrics || '<div class="fb-muted">지표 없음</div>'}`;
          })
          .catch(() => {
            card.innerHTML = `<h4>${d.icon} ${d.name}</h4><div class="fb-muted">연동 전 (summary.json 없음)</div>`;
          });
      });
  }
  }
})();

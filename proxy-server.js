/**
 * 우편번호 조회 API 프록시 (개발용)
 *
 * openapi.epost.go.kr 은 CORS 헤더를 내려주지 않고 HTTPS 도 지원하지 않기 때문에
 * address-search.html 이 브라우저에서 직접 호출하면 차단된다.
 * 이 스크립트는 의존성 없이 Node 기본 모듈만으로 요청을 그대로 중계한다.
 *
 *   node proxy-server.js                 # http://localhost:8080/postal 로 기동
 *   PORT=3000 node proxy-server.js       # 포트 변경
 *   SERVICE_KEY=xxxx node proxy-server.js  # 인증키를 서버에 두고 사용 (권장)
 *
 * address-search.html 의 「API 연결 설정」 → 프록시 URL 에
 *   http://localhost:8080/postal
 * 을 입력하고 데모 모드를 해제하면 실제 조회가 동작한다.
 */
const http = require("http");
const { URL } = require("url");

const PORT = process.env.PORT || 8080;
const SERVICE_KEY = process.env.SERVICE_KEY || "";
const TARGET = "http://openapi.epost.go.kr/postal/retrieveNewAdressAreaCdSearchAllService"
             + "/retrieveNewAdressAreaCdSearchAllService/getNewAddressListAreaCdSearchAll";

http.createServer((req, res) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Accept, Content-Type"
  };

  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    return res.end();
  }

  const incoming = new URL(req.url, `http://${req.headers.host}`);
  if (!incoming.pathname.startsWith("/postal")) {
    res.writeHead(404, { ...cors, "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Not Found - /postal 경로를 사용하세요.");
  }

  // 요청 파라미터를 그대로 전달하되, 서버에 인증키가 있으면 그것을 우선한다.
  const target = new URL(TARGET);
  for (const [k, v] of incoming.searchParams) {
    target.searchParams.set(k, v);
  }
  if (SERVICE_KEY) {
    target.searchParams.set("ServiceKey", SERVICE_KEY);
  }

  http.get(target.toString(), upstream => {
    res.writeHead(upstream.statusCode, {
      ...cors,
      "Content-Type": upstream.headers["content-type"] || "application/xml; charset=utf-8"
    });
    upstream.pipe(res);
  }).on("error", err => {
    res.writeHead(502, { ...cors, "Content-Type": "text/plain; charset=utf-8" });
    res.end("Upstream error: " + err.message);
  });
}).listen(PORT, () => {
  console.log(`주소 검색 프록시 실행 중 → http://localhost:${PORT}/postal`);
  console.log(SERVICE_KEY ? "ServiceKey: 환경변수 사용" : "ServiceKey: 요청 파라미터 사용 (화면에서 입력)");
});

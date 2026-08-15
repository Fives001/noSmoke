# noSmoke

## 통합검색 5자리 우편번호 조회 화면

우정사업본부 「통합검색 도로명주소 및 지번주소 5자리 우편번호 조회 서비스」
(`getNewAddressListAreaCdSearchAll`) 사양서를 기준으로 만든 웹 검색 화면입니다.

| 파일 | 설명 |
| --- | --- |
| `address-search.html` | 주소 검색 화면 (라이브러리 의존성 없는 단일 HTML 파일) |
| `proxy-server.js` | 개발용 CORS 프록시 (Node 기본 모듈만 사용) |

### 화면 기능

- 검색어(`srchwrd`) · 페이지당 개수(`countPerPage`, 최대 50) 입력
- 결과 목록: 우편번호(5자리) / 도로명주소(`lnmAdres`) / 지번주소(`rnAdres`)
- 검색어 하이라이트, 페이지 이동(`currentPage`), 전체 건수·페이지 표시
- 행 「선택」 시 상세 표시 + 클립보드 복사
- 인증키·프록시 주소는 브라우저 localStorage에 저장
- 데모 모드: 인증키 없이 내장 샘플 데이터로 화면 동작 확인

### 사용 방법

**1) 데모 모드** — `address-search.html`을 브라우저로 열고 바로 검색합니다.

**2) 실제 API 조회** — 오픈API 서버(`openapi.epost.go.kr`)는 CORS 헤더를 내려주지 않아
브라우저에서 직접 호출할 수 없습니다. 함께 포함된 프록시를 사용하세요.

```bash
node proxy-server.js                    # http://localhost:8080/postal
SERVICE_KEY=발급받은키 node proxy-server.js  # 인증키를 서버에 두는 방식(권장)
```

화면의 **API 연결 설정**에서

- 프록시 URL: `http://localhost:8080/postal`
- 서비스 인증키: 공공데이터포털에서 발급받은 키 (프록시에 `SERVICE_KEY`를 지정했다면 생략 가능)
- 데모 모드: 체크 해제

### 응답 형식 관련 참고

사양서 본문의 예시 응답은 `<xsync>/<xsyncData>` 구조지만, 실제 운영 서버는
응답 메시지 명세 표와 동일한 구조로 내려줍니다.

```xml
<NewAddressListResponse>
  <cmmMsgHeader>
    <successYN>Y</successYN><returnCode>00</returnCode><errMsg/>
    <totalCount>23</totalCount><countPerPage>10</countPerPage>
    <totalPage>3</totalPage><currentPage>1</currentPage>
  </cmmMsgHeader>
  <newAddressListAreaCdSearchAll>
    <zipNo>12621</zipNo>
    <lnmAdres>경기도 여주시 세종로 17 (홍문동)</lnmAdres>
    <rnAdres>경기도 여주시 홍문동 111-15</rnAdres>
  </newAddressListAreaCdSearchAll>
  ...
</NewAddressListResponse>
```

화면은 **두 형식을 모두 파싱**하며, `errMsg` 또는 `successYN=N` 인 경우 오류 메시지를 표시합니다.

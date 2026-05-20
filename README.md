studio-udtt-frontend

Studio & Lab 우당탕탕 공식 웹사이트의 프론트엔드

지도 기반 프로젝트 현황 확인, 프로젝트 의뢰/참여 신청, 회사 소개, 관리자 페이지를 제공하는 웹 애플리케이션입니다.

🛠 Tech Stack
|분류|기술|선택 이유|
|-|-|
|Framework|React 19|컴포넌트 기반 UI 구성|
|Build Tool|Vite|빠른 개발 서버 및 번들링|
|Routing|React Router v7|페이지 간 이동 및 접근 제어|
|HTTP|Axios|백엔드 API 통신|
|Package Manager|pnpm|빠른 의존성 설치 및 디스크 효율|
|Map|Naver Maps API|지역 단위 프로젝트 현황 시각화|
|CI/CD|GitHub Actions|자동 빌드 및 배포 파이프라인|

📁 프로젝트 구조
```
src/
  ├── pages/
  │   ├── main/             # 메인 페이지 (지도, 탭 구조)
  │   ├── project/          # 의뢰하기 / 참여 모집
  │   ├── about/            # 회사 소개
  │   └── admin/            # 관리자 페이지
  ├── components/           # 공통 컴포넌트
  ├── api/                  # Axios 인스턴스 및 API 호출 함수
  └── assets/               # 이미지, 폰트 등 정적 파일
```

⚙️ 환경 설정
프로젝트 루트에 .env 파일을 생성하세요.
envVITE_API_BASE_URL=http://localhost:8080
VITE_NAVER_MAP_CLIENT_ID=your_naver_map_client_id

주의: .env 파일은 .gitignore에 포함되어 있으므로 직접 생성해야 합니다.

🔑 주요 화면

메인 페이지 — Naver Map 기반 프로젝트 현황 지도 (진행중 / 완료 구분 표시)
의뢰하기 — 비회원 프로젝트 의뢰 폼 (위치, 유형, 규모, 희망 시기 등 입력)
참여 모집 — 모집 중인 프로젝트 목록 및 참여 신청
회사 소개 — 누적 참여자 수, 관련 기사·홍보 자료 노출
관리자 페이지 — 의뢰/참여 신청 승인·반려, 문자 발송, 콘텐츠 관리, 통계


관리자 페이지(/admin)는 JWT 인증 후 접근 가능합니다.


🔗 관련 레포지토리
Backend

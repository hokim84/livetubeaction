# LiveTube

친구들끼리 공유하는 YouTube 일부공개(Unlisted) 영상을 YouTube 같은 레이아웃(썸네일 그리드 + 시청 페이지)으로 모아 보는 웹앱. 로컬 네트워크(LAN)에서 호스팅하는 것을 전제로 한다.

## 로그인 방식

비밀번호가 없다. 로그인 화면에서 **아이디 + 이름**만 입력하면:

- 처음 보는 아이디면 그 자리에서 계정이 만들어진다.
- 이미 있는 아이디면 그 계정으로 로그인된다 (이름이 다르면 갱신).
- **가장 먼저 만들어지는 계정이 자동으로 관리자가 된다.**
- 이후 특정 아이디를 관리자로 지정하고 싶으면 관리자 화면(`/admin/users`)에서 권한을 바꾸거나, `.env.local`의 `ADMIN_USERNAMES`에 미리 등록해 둘 수 있다.

## 개발

```bash
npm install
npm run dev
```

http://localhost:3000 접속. 첫 로그인 시 자동으로 관리자 계정이 만들어진다.

## 프로덕션 빌드 및 LAN 호스팅

```bash
npm run build
npm run start
```

Next.js는 기본적으로 `0.0.0.0`에 바인딩하므로 별도 옵션 없이 `npm run start`만으로 같은 네트워크의 다른 기기에서 접속할 수 있다. 친구들은 서버 PC의 LAN IP로 접속하면 된다:

```
http://<서버의 LAN IP>:3000
```

LAN IP 확인: `ipconfig`에서 `IPv4 주소` 확인.

**Windows 방화벽**: 처음 실행 시 "Windows Defender 방화벽" 허용 팝업이 뜨면 "개인 네트워크"에 허용 체크. 팝업을 놓쳤거나 다른 기기에서 접속이 안 되면 PowerShell(관리자 권한)에서:

```powershell
New-NetFirewallRule -DisplayName "LiveTube" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

## 환경 변수 (`.env.local`, 선택)

| 변수 | 설명 |
| --- | --- |
| `DATABASE_PATH` | SQLite 파일 경로. 기본값 `./data/livetube.db` |
| `ADMIN_USERNAMES` | 쉼표로 구분된 아이디 목록. 로그인 시 자동으로 관리자 권한이 부여된다 |

## 데이터

`data/livetube.db` (Node 내장 `node:sqlite`)에 사용자, 영상, 시청 기록을 저장한다. 이 폴더는 git에서 제외된다 — 백업하려면 서버를 끄고 파일을 복사하면 된다.

## 알아둘 것

- 공유하려는 YouTube 영상은 **일부공개(Unlisted)** 여야 한다. 비공개(Private) 영상은 초대된 Google 계정으로만 재생 가능해 임베드가 차단된다.
- 일부공개 영상이라도 업로더가 "퍼가기 허용"을 꺼두면 재생이 막힌다. 등록 후 재생이 안 되면 YouTube에서 해당 영상의 퍼가기 설정을 확인한다.
- HTTP 평문(LAN 전용)을 전제로 세션 쿠키를 `secure: false`로 설정했다. 인터넷에 공개할 계획이 있다면 리버스 프록시 + HTTPS로 앞단을 두고 이 값을 되돌려야 한다.

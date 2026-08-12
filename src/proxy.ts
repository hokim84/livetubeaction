import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth.shared";

/**
 * 1차 게이트일 뿐이다. 쿠키가 "있는지"만 보고, 유효한 세션인지·관리자인지는 판정하지 않는다.
 * 실제 권한 판정은 각 페이지/액션의 requireUser() / requireAdmin()이 담당한다.
 * (프록시 런타임에서는 node:sqlite에 접근할 수 없으므로 DB 조회를 여기서 하면 안 된다.)
 */
export default function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // 로그인 페이지, Next 내부 자산, 정적 파일은 통과시킨다.
    "/((?!login|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

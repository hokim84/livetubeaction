/**
 * proxy.ts와 서버 코드가 함께 쓰는 값만 둔다.
 * proxy는 node:sqlite에 접근할 수 없으므로 auth.ts("server-only")를 import 해서는 안 된다.
 */
export const SESSION_COOKIE = "livetube_session";

import UserRowActions from "@/components/admin/UserRowActions";
import { requireUser } from "@/lib/auth";
import { listUsers } from "@/lib/users";

export default async function AdminUsersPage() {
  const me = await requireUser();
  const users = listUsers();

  return (
    <div>
      <div className="mb-4 rounded-xl border border-border bg-surface p-4 text-sm text-fg/90">
        가입은 로그인 화면에서 아이디와 이름만으로 자동으로 이뤄집니다(관리자만 비밀번호 필요).
        여기서는 이미 만들어진 계정의 권한을 관리하고, 필요하면 접근을 막거나 관리자 비밀번호를
        초기화할 수 있습니다.
      </div>

      <ul className="divide-y divide-border rounded-2xl border border-border">
        {users.map((user) => (
          <li key={user.id} className="flex items-center gap-3 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-sm font-semibold text-fg">
              {user.display_name.slice(0, 1)}
            </span>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">
                {user.display_name}
                {user.role === "admin" && (
                  <span className="ml-2 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-normal text-brand">
                    관리자
                  </span>
                )}
                {!user.is_active && (
                  <span className="ml-2 rounded bg-surface-hover px-1.5 py-0.5 text-[10px] font-normal text-muted">
                    차단됨
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted">
                @{user.username} · 영상 {user.watched_count}개 시청
              </p>
            </div>

            <UserRowActions
              id={user.id}
              role={user.role}
              isActive={Boolean(user.is_active)}
              isSelf={user.id === me.id}
              hasPassword={Boolean(user.password_hash)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

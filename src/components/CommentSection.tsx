import type { User } from "@/lib/auth";
import { listComments } from "@/lib/comments";
import { formatRelativeTime } from "@/lib/format";

import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

export default function CommentSection({
  videoId,
  currentUser,
}: {
  videoId: string;
  currentUser: User;
}) {
  const comments = listComments(videoId);
  const now = new Date();

  return (
    <div className="mt-6">
      <h2 className="mb-3 text-sm font-medium text-fg">댓글 {comments.length}개</h2>

      <CommentForm videoId={videoId} />

      {comments.length === 0 ? (
        <p className="mt-4 text-sm text-muted">첫 댓글을 남겨보세요.</p>
      ) : (
        <div className="mt-2 divide-y divide-border">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              id={comment.id}
              displayName={comment.display_name}
              createdAtLabel={formatRelativeTime(comment.created_at, now)}
              body={comment.body}
              canDelete={
                comment.user_id === currentUser.id || currentUser.role === "admin"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

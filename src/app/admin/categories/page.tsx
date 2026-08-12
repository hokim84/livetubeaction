import CategoryDeleteButton from "@/components/admin/CategoryDeleteButton";
import CategoryForm from "@/components/admin/CategoryForm";
import { countVideosInCategory, listCategories } from "@/lib/categories";

export default function AdminCategoriesPage() {
  const categories = listCategories();

  return (
    <div className="max-w-md">
      <p className="mb-4 text-sm text-muted">
        홈 화면은 여기 있는 카테고리 순서대로 섹션을 나눠 보여줍니다.
      </p>

      <div className="mb-6">
        <CategoryForm />
      </div>

      <ul className="divide-y divide-border rounded-2xl border border-border">
        {categories.map((category) => {
          const count = countVideosInCategory(category.name);
          return (
            <li key={category.id} className="flex items-center gap-3 p-3">
              <span className="flex-1 truncate text-sm font-medium text-fg">
                {category.name}
              </span>
              <span className="text-xs text-muted">영상 {count}개</span>
              <CategoryDeleteButton id={category.id} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

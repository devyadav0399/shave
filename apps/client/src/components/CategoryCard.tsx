import type { Category } from '@/types/category';
import type { FC } from 'react';

interface CategoryCardProps {
  category: Category;
  variant?: 'list' | 'grid';
  onClick: (category: Category) => void;
}

const CategoryCard: FC<CategoryCardProps> = ({ category, variant = 'list', onClick }) => {
  if (variant === 'grid') {
    return (
      <div
        className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-white/60"
        onClick={() => onClick(category)}
      >
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500 shrink-0" />
        <div className="flex flex-col flex-1 p-4">
          <p className="font-semibold text-slate-800 dark:text-slate-100 flex-1 line-clamp-3 leading-snug">
            {category.name}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {new Date(category.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-white/60"
      onClick={() => onClick(category)}
    >
      <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
          {category.name}
        </p>
        <span className="text-xs text-slate-400 shrink-0">
          {new Date(category.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  )
}

export default CategoryCard;

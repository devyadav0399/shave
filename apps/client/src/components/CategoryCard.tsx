import type { Category } from '@/types/category';
import type { FC } from 'react';

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
}

const CategoryCard: FC<CategoryCardProps> = ({ category, onClick }) => {
  return (
    <div className='border-2 rounded-md my-2 p-2 hover:bg-gray-400 hover:cursor-pointer border-gray-300'  onClick={() => onClick(category)}>
      <div>
        <p className='font-bold truncate'>
          {category.name}
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;

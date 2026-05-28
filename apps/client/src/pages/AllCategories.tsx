import CategoryCard from "@/components/CategoryCard";
import CategoryModal from "@/components/CategoryModal";
import Spinner from "@/components/Spinner";
import useCategories from "@/hooks/useCategories";
import type { Category } from "@/types/category";
import { useState } from "react";

const AllCategories = () => {
  const { categories, isLoading, isError } = useCategories()

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const handleClick = (category: Category) => {
    setSelectedCategory(category)
  }

  if (isLoading) return <Spinner />

  return (
    <div>
      <h1 className="text-2xl mb-6">Categories</h1>
      {isError ? (<p className="text-center">Something went wrong...</p>) : (
        <div className="grid grid-cols-5 auto-rows-[150px] gap-2">
          {categories.map(category => <CategoryCard key={category.id} variant="grid" category={category} onClick={handleClick} />)}
        </div>
      )}
      {selectedCategory && <CategoryModal category={selectedCategory} onClose={() => setSelectedCategory(null)}/>}
    </div>
  );
};

export default AllCategories;

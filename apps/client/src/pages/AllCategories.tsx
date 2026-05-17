import CategoryCard from "@/components/CategoryCard";
import CategoryModal from "@/components/CategoryModal";
import Spinner from "@/components/Spinner";
import useCategories from "@/hooks/useCategories";
import type { Category } from "@/types/category";
import { useState } from "react";

const AllCategories = () => {
  const { categories, isLoading, isSaving, isError, create, refetch } = useCategories()

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const handleClick = (category: Category) => {
    setSelectedCategory(category)
  }

  if (isLoading) return <Spinner />

  return (
    <div className="max-w-[80%] mx-auto">
      <h1 className="text-3xl text-center my-5">Categories</h1>
      <div className="grid grid-rows-[repeat(3,150px)] grid-cols-5 gap-2">
        {categories.map(category => <CategoryCard key={category.id}  category={category} onClick={handleClick} />)}
      </div>
      {selectedCategory && <CategoryModal category={selectedCategory} onClose={() => setSelectedCategory(null)}/>}
    </div>
  );
};

export default AllCategories;

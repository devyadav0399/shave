import type { Category, CategoryMap } from "@/types/category"
import { useEffect, useMemo, useState } from "react";
import { categories as categoriesApi } from "@/api/categories";
import { toast } from "sonner";

export interface useCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  isSaving: boolean;
  isError: boolean;
  create: (name: string) => Promise<void>;
  refetch: () => Promise<void>;
  categoryMap: CategoryMap;
}

const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  const categoryMap = useMemo(() => {
    return categories.reduce((acc, category) => ({ ...acc, [category.id]: category.name }), {} as CategoryMap)
    } , [categories])

  const fetchAllCategories = async () => {
    try {
      setIsLoading(true)
      const result = await categoriesApi.getAll()
      setCategories(result)
    } catch (e) {
      setIsError(true)
      toast.error('Something went wrong while fetching the categories. Please try again.')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const create = async (name: string) => {
    try {
      setIsSaving(true)
      await categoriesApi.create(name)
      fetchAllCategories()
    } catch (e) {
      toast.error('Something went wrong while creating the category.')
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchAllCategories()
  }, [])

  return {
    categories,
    isLoading,
    isSaving,
    isError,
    create,
    refetch: fetchAllCategories,
    categoryMap
  }
}

export default useCategories;

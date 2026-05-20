import type { Category } from "@/types/category";
import type { Link } from "@/types/link";
import { useEffect, useState } from "react";
import { links as linksApi } from "@/api/links";
import Spinner from "./Spinner";
import LinkCard from "./LinkCard";

interface CategoryModalProps {
  category: Category;
  onClose: () => void;
}

export default function CategoryModal({ category, onClose }: CategoryModalProps) {
  const [freshLinks, setFreshLinks] = useState<Link[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)


  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoading(true)
        const result = await linksApi.getAll(category.id)
        setFreshLinks(result)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLinks()
  }, [])

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      {isLoading || !freshLinks ? <Spinner /> : (
        <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-slate-900 border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
          <div>
            {category.name}
          </div>
          <div>
            {category.createdAt}
          </div>
          <div>
            Links:
            {freshLinks.map(link => <LinkCard link={link} />)}
          </div>
        </div>
      )}
    </div>
  );
}

import type { Category } from "@/types/category";
import type { Link } from "@/types/link";
import { X } from "lucide-react";
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
        <div className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 shrink-0">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {category.name}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Created {new Date(category.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-4 flex-1 overflow-y-auto">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
              {freshLinks.length} {freshLinks.length === 1 ? 'link' : 'links'}
            </p>
            {freshLinks.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500">No links in this category yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {freshLinks.map(link => <LinkCard key={link.id} link={link} />)}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

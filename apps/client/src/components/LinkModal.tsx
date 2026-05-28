import type { Link } from "@/types/link";
import { Check, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { links as linksApi } from "@/api/links";
import Spinner from "./Spinner";
import type { CategoryMap } from "@/types/category";

interface LinkModalProps {
  link: Link;
  onClose: () => void;
  onUpdate: () => void;
  categoryMap: CategoryMap;
}

interface EditValues {
  title: string;
  summary: string;
  categoryId: string;
}

export default function LinkModal({ link, onClose, onUpdate, categoryMap }: LinkModalProps) {
  const [freshLink, setFreshLink] = useState<Link | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editValues, setEditValues] = useState<EditValues>({ title: '', summary: '', categoryId: '' })

  const handleToggleConsumed = async () => {
    try {
      const result = await linksApi.update(link.id, { isConsumed: !freshLink?.isConsumed })
      onUpdate()
      setFreshLink(result)
    } catch (e) {
      console.error(e)
    }
  }

  const handleEnterEdit = () => {
    if (!freshLink) return
    setEditValues({
      title: freshLink.title ?? '',
      summary: freshLink.summary ?? '',
      categoryId: freshLink.categoryId ?? '',
    })
    setIsEditing(true)
  }

  const handleDiscard = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!freshLink) return
    try {
      const result = await linksApi.update(link.id, {
        title: editValues.title || undefined,
        summary: editValues.summary || undefined,
        categoryId: editValues.categoryId || undefined,
      })
      setFreshLink(result)
      onUpdate()
      setIsEditing(false)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setIsLoading(true)
        const result = await linksApi.getById(link.id)
        setFreshLink(result)
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchLink()
  }, [])

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      {isLoading || !freshLink ? <Spinner /> : (
        <div className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              {isEditing ? (
                <input
                  type="text"
                  value={editValues.title}
                  onChange={(e) => setEditValues(v => ({ ...v, title: e.target.value }))}
                  placeholder="Title"
                  className="w-full text-lg font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {freshLink.title ?? freshLink.url}
                </h2>
              )}
              <a
                href={freshLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 truncate block mt-1.5"
                onClick={(e) => e.stopPropagation()}
              >
                {freshLink.url}
              </a>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-4 flex-1 overflow-y-auto">
            <div className="flex items-center gap-2 my-4">
              {freshLink.type && (
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                  {freshLink.type}
                </span>
              )}
              {isEditing ? (
                <select
                  value={editValues.categoryId}
                  onChange={(e) => setEditValues(v => ({ ...v, categoryId: e.target.value }))}
                  className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No category</option>
                  {Object.entries(categoryMap).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {freshLink.categoryId ? categoryMap[freshLink.categoryId] : 'No category'}
                </span>
              )}
              <span className="text-xs text-slate-400 ml-auto">
                {new Date(freshLink.createdAt).toLocaleDateString()}
              </span>
            </div>

            {isEditing ? (
              <textarea
                value={editValues.summary}
                onChange={(e) => setEditValues(v => ({ ...v, summary: e.target.value }))}
                placeholder="Summary"
                rows={5}
                className="w-full text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 resize-none leading-relaxed"
              />
            ) : freshLink.summary ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {freshLink.summary}
              </p>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              onClick={handleToggleConsumed}
              className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                freshLink.isConsumed
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-green-900/30 dark:hover:text-green-400'
              }`}
            >
              <Check size={14} strokeWidth={3} />
              {freshLink.isConsumed ? 'Read' : 'Mark as read'}
            </button>

            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscard}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <X size={14} />
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Check size={14} strokeWidth={3} />
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={handleEnterEdit}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <Pencil size={14} />
                Edit
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  );
}

import type { Link } from "@/types/link";
import { Check, CircleCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { links as linksApi } from "@/api/links";
import Spinner from "./Spinner";

interface LinkModalProps {
  link: Link;
  onClose: () => void;
  onUpdate: () => void;
}

export default function LinkModal({ link, onClose, onUpdate }: LinkModalProps) {
  const [freshLink, setFreshLink] = useState<Link | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleToggleConsumed = async () => {
    try {
      const result = await linksApi.update(link.id, { isConsumed: !freshLink?.isConsumed })
      onUpdate()
      setFreshLink(result)
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

  if (!freshLink || isLoading) return <Spinner />

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all dark:bg-slate-900 border border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
        <div>
          {freshLink.title ? freshLink.title : freshLink.url}
        </div>
        <div>
          {freshLink.url}
        </div>
        <div>
          {freshLink.type}
        </div>
        <div>
          {freshLink.categoryId}
        </div>
        <div>
          {freshLink.createdAt}
        </div>
        <div>
          {freshLink.summary}
        </div>
        <div>
          {freshLink.isConsumed ?
            (<Check color="green" strokeWidth={3} onClick={handleToggleConsumed}/>)
            :
            (<CircleCheck
              color="green"
              fill="green"
              size={24}
              strokeWidth={2}
              onClick={handleToggleConsumed}
            />)
          }
        </div>
        <div>
          <X size={18} onClick={onClose}/>
        </div>
      </div>
    </div>
  );
}

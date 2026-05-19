import { useEffect, useState } from "react";
import type { Link } from "@/types/link"
import { links as linksApi } from "@/api/links";
import { toast } from "sonner";

export interface UseLinksReturn {
  links: Link[];
  isLoading: boolean;
  isSaving: boolean;
  isError: boolean;
  create: (url: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const useLinks = (categoryId?: string) => {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    fetchAllLinks(categoryId)
  }, [categoryId])

  useEffect(() => {
    if (links.some(link => link.enrichmentStatus === 'pending' || link.enrichmentStatus === 'retry')) {
      const id = setInterval(() => {
        fetchAllLinks(categoryId)
      }, 3000)
      return () => clearInterval(id)
    }
  }, [links, categoryId])

  const fetchAllLinks = async(categoryId?: string) => {
    try {
      setIsLoading(true)
      const result = await linksApi.getAll(categoryId)
      setLinks(result)
    } catch (e) {
      setIsError(true)
      toast.error('Something went wrong while fetching the links. Please try again.')
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const create = async (url: string) => {
    try {
      setIsSaving(true)
      await linksApi.create(url)
      fetchAllLinks()
    } catch (e) {
      toast.error('Failed to save the link. Please try again.')
      console.error(e)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    links,
    isLoading,
    isSaving,
    isError,
    create,
    refetch: fetchAllLinks
  }
}

export default useLinks;

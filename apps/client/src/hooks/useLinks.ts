import { useEffect, useState } from "react";
import type { Link } from "@/types/link"
import { links as linksApi } from "@/api/links";

export interface UseLinksReturn {
  links: Link[];
  isLoading: boolean;
  isSaving: boolean;
  isError: boolean;
  create: (url: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const useLinks = () => {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)

  useEffect(() => {
    fetchAllLinks()
  }, [])

  useEffect(() => {
    if (links.some(link => link.enrichmentStatus === 'pending' || link.enrichmentStatus === 'retry')) {
      const id = setInterval(() => {
        fetchAllLinks()
      }, 3000)
      return () => clearInterval(id)
    }
  }, [links])

  const fetchAllLinks = async () => {
    try {
      setIsLoading(true)
      const result = await linksApi.getAll()
      setLinks(result)
    } catch (e) {
      setIsError(true)
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
      setIsError(true)
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

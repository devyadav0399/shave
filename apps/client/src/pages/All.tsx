import LinkCard from "@/components/LinkCard";
import LinkModal from "@/components/LinkModal";
import useCategories from "@/hooks/useCategories";
import useLinks from "@/hooks/useLinks";
import type { Link } from "@/types/link";
import { useState } from "react";

const All = () => {
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const { links, isError, refetch } = useLinks()
  const { categoryMap } = useCategories();

  const handleClick = (link: Link) => {
    setSelectedLink(link)
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-3xl my-10">All saved links</h1>
      <div className="flex flex-col max-w-[80%] mx-auto">
        {links.map((link) => <LinkCard key={link.id} link={link} onClick={handleClick} />)}
      </div>
      {selectedLink && <LinkModal link={selectedLink} onClose={() => setSelectedLink(null)} onUpdate={refetch} categoryMap={categoryMap}/>}
    </div>
  );
};

export default All;

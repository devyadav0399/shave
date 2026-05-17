import LinkCard from "@/components/LinkCard";
import LinkModal from "@/components/LinkModal";
import useCategories from "@/hooks/useCategories";
import useLinks from "@/hooks/useLinks";
import type { Link } from "@/types/link";
import { useState } from "react";
import { useParams } from "react-router";

const Category = () => {
  const { id } = useParams();
  const { links, refetch } = useLinks(id)
  const { categoryMap } = useCategories()
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)

  const handleClick = (link: Link) => {
    setSelectedLink(link)
  }


  return (
    <div className="flex flex-col max-w-[80%] mx-auto my-10">
      <h1 className="text-3xl text-center">{id ? categoryMap[id] : 'n/a'}</h1>
      {links.map((link) => <LinkCard key={link.id} link={link} onClick={handleClick} />)}
      {selectedLink && <LinkModal link={selectedLink} onClose={() => setSelectedLink(null)} onUpdate={refetch} categoryMap={categoryMap}/>}
    </div>
  );
};

export default Category;

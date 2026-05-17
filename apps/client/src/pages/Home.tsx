import LinkCard from "@/components/LinkCard";
import LinkModal from "@/components/LinkModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCategories from "@/hooks/useCategories";
import useLinks from "@/hooks/useLinks";
import type { Link } from "@/types/link";
import { Save } from 'lucide-react'
import { useEffect, useRef, useState } from "react";


const Home = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const { links, isSaving, isError, create, refetch } = useLinks()
  const { categoryMap } = useCategories()

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (inputRef.current?.value.trim()) {
      await create(inputRef.current?.value)
      inputRef.current.value = ''
    }
  }

  const handleClick = (link: Link) => {
    setSelectedLink(link)
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 w-full px-10">
      <div id="input-box" className="flex flex-row w-[80%] gap-3 my-5">
        <Input ref={inputRef} placeholder="Paste link here to shave it" className="bg-white"/>
        <Button variant="outline" size="icon" onClick={handleSave} disabled={isSaving}>
          <Save />
        </Button>
      </div>
      <h2>Recents</h2>
      <div id="recents" className="grid grid-rows-[repeat(2,150px)] grid-cols-4 gap-2 max-w-[80%]">
        {links.slice(0,8).map((link) => <LinkCard key={link.id} link={link} onClick={handleClick} />)}
      </div>
      {selectedLink && <LinkModal link={selectedLink} onClose={() => setSelectedLink(null)} onUpdate={refetch} categoryMap={categoryMap} />}
    </div>
  );
};

export default Home;

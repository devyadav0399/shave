import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useLinks from "@/hooks/useLinks";
import { Save } from 'lucide-react'
import { useEffect, useRef, useState } from "react";


const Home = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const { links, isSaving, isError, create } = useLinks()

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = async () => {
    if (inputRef.current?.value.trim()) {
      await create(inputRef.current?.value)
      inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 w-full">
      <div id="input-box" className="flex flex-row w-[80%] gap-3">
        <Input ref={inputRef} placeholder="Paste link here to shave it" className="bg-white"/>
        <Button variant="outline" size="icon" onClick={handleSave} disabled={isSaving}>
          <Save />
        </Button>
      </div>
      <div id="recents" className="mt-5">
        {links.map((link) => <div key={link.url}>{link.url}</div>)}
      </div>
    </div>
  );
};

export default Home;

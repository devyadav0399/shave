import type { FC } from 'react';
import type { Link } from '@/types/link';
import Spinner from './Spinner';

interface LinkCardProps {
  link: Link;
  onClick: (link: Link) => void;
}

const LinkCard: FC<LinkCardProps> = ({ link, onClick }) => {
  const resolveTitle = (link: Link) => {
    if (link.enrichmentStatus === 'pending' || link.enrichmentStatus === 'retry') return <Spinner />
    if ((link.enrichmentStatus === 'done' || link.enrichmentStatus === 'failed') && link.title) return link.title
   return link.url
  }
  return (
    <div className={`border-2 rounded-md my-2 p-2 hover:bg-gray-400 hover:cursor-pointer ${link.isConsumed ? 'border-green-500' : 'border-gray-300'}`}  onClick={() => onClick(link)}>
      <div className='max-w-30 min-h-15'>
        <p className='font-bold truncate'>
          {resolveTitle(link)}
        </p>
      </div>
    </div>
  );
};

export default LinkCard;

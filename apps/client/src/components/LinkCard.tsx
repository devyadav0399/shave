import type { FC } from 'react';
import type { Link } from '@/types/link';
import Spinner from './Spinner';

interface LinkCardProps {
  link: Link;
  variant?: 'list' | 'grid';
  onClick?: (link: Link) => void;
}

const LinkCard: FC<LinkCardProps> = ({ link, variant = 'list', onClick }) => {
  const isPending = link.enrichmentStatus === 'pending' || link.enrichmentStatus === 'retry'
  const title = isPending ? null : (link.title ?? link.url)
  const accentClass = link.isConsumed
    ? 'from-green-400 to-emerald-500'
    : 'from-indigo-500 to-violet-500'

  if (variant === 'grid') {
    return (
      <div
        className="h-full flex flex-col bg-white dark:bg-slate-800 rounded-xl cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-white/60"
        onClick={() => onClick?.(link)}
      >
        <div className={`h-1.5 bg-gradient-to-r shrink-0 ${accentClass}`} />
        <div className="flex flex-col flex-1 p-3">
          <div className="flex-1 min-h-0">
            {isPending
              ? <Spinner />
              : <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 line-clamp-4 leading-snug">{title}</p>
            }
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {link.type && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 capitalize font-medium">
                {link.type}
              </span>
            )}
            {link.isConsumed && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-medium">
                Read
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-xl cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden border border-white/60"
      onClick={() => onClick?.(link)}
    >
      <div className={`h-1 bg-gradient-to-r ${accentClass}`} />
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          {isPending
            ? <Spinner />
            : <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{title}</p>
          }
          <p className="text-xs text-slate-400 truncate mt-0.5">{link.url}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {link.type && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 capitalize font-medium">
              {link.type}
            </span>
          )}
          <span className="text-xs text-slate-400">
            {new Date(link.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default LinkCard;

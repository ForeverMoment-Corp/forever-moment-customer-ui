import { useEffect } from 'react';

const SITE = 'Forever Moment';
/** Same as the <title> in index.html; used for the home page and while a page's name is loading. */
export const DEFAULT_TITLE = "Forever Moment | India's #1 Celebration Platform";

/** API names are often lower-case ("birthday decor"); titles read better capitalised. */
const capitalise = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

/** "Birthday Decor · Forever Moment", or the default title when there is no page name. */
export const formatTitle = (title?: string | null) => {
  const t = title?.trim();
  return t ? `${capitalise(t)} · ${SITE}` : DEFAULT_TITLE;
};

/**
 * Sets the browser tab title for pages whose name comes from data (category, collection,
 * experience). Fixed pages get theirs from CustomerLayout's PAGE_TITLES instead.
 */
export function useDocumentTitle(title: string | null | undefined) {
  useEffect(() => {
    document.title = formatTitle(title);
  }, [title]);
}

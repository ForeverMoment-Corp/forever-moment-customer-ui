import type { JSX, ReactNode } from 'react';
import { isHtmlFragment } from './html';

/**
 * Rich text from the admin CMS.
 *
 * Description, terms and similar fields may arrive as plain text or as a fragment of HTML
 * (`<ul><li>…</li></ul>`, `<p>`, `<strong>`, …). Rendering the string directly shows the
 * tags; rendering it with `dangerouslySetInnerHTML` would run whatever the field contains.
 *
 * Instead the markup is parsed into an inert document and rebuilt as React elements from an
 * allowlist. Nothing is ever injected as HTML, so an unexpected tag or attribute can only be
 * dropped, never executed. `DOMParser` does not run scripts, so parsing itself is safe.
 */

/** Tags we render, mapped to the element actually produced. */
const ALLOWED: Record<string, keyof JSX.IntrinsicElements> = {
  P: 'p',
  BR: 'br',
  UL: 'ul',
  OL: 'ol',
  LI: 'li',
  STRONG: 'strong',
  B: 'strong',
  EM: 'em',
  I: 'em',
  U: 'u',
  A: 'a',
  H1: 'h3',
  H2: 'h3',
  H3: 'h3',
  H4: 'h4',
  H5: 'h4',
  H6: 'h4',
  SPAN: 'span',
  DIV: 'div',
  SMALL: 'small',
  BLOCKQUOTE: 'blockquote',
};

/** Elements whose contents are code or embedded documents, never readable text. */
const DROP_WITH_CONTENT = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'HEAD', 'TITLE']);

/** Only links that go somewhere safe survive; everything else renders as plain text. */
const safeHref = (value: string | null): string | undefined => {
  if (!value) return undefined;
  const href = value.trim();
  return /^(https?:|mailto:|tel:|\/)/i.test(href) ? href : undefined;
};

function renderNode(node: Node, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const el = node as Element;
  // Code and embeds: drop the element and its contents, so no script or CSS text leaks onto the page.
  if (DROP_WITH_CONTENT.has(el.tagName)) return null;
  const tag = ALLOWED[el.tagName];
  // Unknown tag: keep the text inside, drop the tag itself.
  if (!tag) return Array.from(el.childNodes).map((child, i) => renderNode(child, `${key}-${i}`));
  if (tag === 'br') return <br key={key} />;

  const children = Array.from(el.childNodes).map((child, i) => renderNode(child, `${key}-${i}`));

  if (tag === 'a') {
    const href = safeHref(el.getAttribute('href'));
    if (!href) return children;
    return (
      <a key={key} href={href} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
        {children}
      </a>
    );
  }

  const Tag = tag as 'p';
  return <Tag key={key}>{children}</Tag>;
}

interface Props {
  html: string | null | undefined;
  /** Wrapper class; the markup inside is styled by the `rich-text` rules in index.css. */
  className?: string;
}

/** Renders CMS text, whether it arrives as plain paragraphs or as HTML. */
export default function RichText({ html, className = '' }: Props) {
  const value = (html ?? '').trim();
  if (!value) return null;

  // Plain text keeps the paragraph-per-blank-line behaviour.
  if (!isHtmlFragment(value) || typeof DOMParser === 'undefined') {
    const paragraphs = value.split(/\n{2,}|\r\n\r\n/).map((p) => p.trim()).filter(Boolean);
    return (
      <div className={`rich-text ${className}`}>
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    );
  }

  const doc = new DOMParser().parseFromString(value, 'text/html');
  return (
    <div className={`rich-text ${className}`}>
      {Array.from(doc.body.childNodes).map((node, i) => renderNode(node, String(i)))}
    </div>
  );
}

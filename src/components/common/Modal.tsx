import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDashboardTheme } from '../../hooks/useDashboardTheme';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
}

// Renders via a portal directly under <body>. This is intentional: several
// dashboard tabs animate their root element with a transform-based
// animation (animate-fade-in), and CSS spec says any ancestor with a
// transform becomes the containing block for position:fixed descendants.
// A modal nested inside such a tree stops being fixed to the viewport and
// instead clips to that ancestor's box. Escaping to document.body avoids
// that class of bug regardless of what the trigger's ancestors do.
export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidthClassName = 'max-w-lg' }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // This portals straight to document.body (see below), which escapes the
  // dashboard shell's own `.dark` wrapper in the DOM tree — so dark mode
  // would silently stop working for every modal without re-reading the
  // preference here and re-applying the same scoping classes on the
  // portaled root itself. Modal is only ever used from dashboard tabs today
  // (never from the public site), so this is safe unconditionally.
  const { dark } = useDashboardTheme();

  // onClose is a fresh function identity on every parent render (e.g. every
  // keystroke in a form inside the modal). Reading it via a ref — instead of
  // depending on it directly — keeps the effect below from re-running on
  // every parent re-render, which would otherwise steal focus back to the
  // panel on each keystroke.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  // `dark` and `qp-dashboard` must land on two DISTINCT nested elements, not
  // the same one — index.css's overrides are all `.dark .qp-dashboard ...`
  // descendant-combinator selectors, which (like Tailwind's own `dark:`
  // variant) never match two classes sitting on one element. See
  // DashboardLayout's own wrapper for the same constraint.
  return createPortal(
    <div className={dark ? 'dark' : undefined}>
    <div
      className="qp-dashboard fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${maxWidthClassName} max-h-[calc(100vh-48px)] flex flex-col rounded-3xl bg-white border border-black/10 shadow-2xl outline-none overflow-hidden`}
      >
        <div className="shrink-0 flex justify-between items-center px-6 sm:px-8 pt-6 sm:pt-8 pb-3 border-b border-black/5">
          <h3 id={titleId} className="font-bold text-[#1d1d1f] text-lg font-heading">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#86868b] hover:text-[#1d1d1f] p-1 rounded-lg hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 sm:px-8 py-5">
          {children}
        </div>
      </div>
    </div>
    </div>,
    document.body
  );
};

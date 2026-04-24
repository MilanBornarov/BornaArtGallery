import { RefObject, useEffect, useRef } from 'react';

let activeLockCount = 0;
let lockedScrollY = 0;
let previousBodyStyle: Partial<CSSStyleDeclaration> | null = null;
let previousHtmlStyle: Partial<CSSStyleDeclaration> | null = null;

function lockDocumentScroll() {
  if (activeLockCount > 0) {
    activeLockCount += 1;
    return;
  }

  const body = document.body;
  const html = document.documentElement;

  lockedScrollY = window.scrollY;
  previousBodyStyle = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };
  previousHtmlStyle = {
    overflow: html.style.overflow,
    overscrollBehavior: html.style.overscrollBehavior,
  };

  body.classList.add('modal-open');
  html.classList.add('modal-open');
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${lockedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  html.style.overflow = 'hidden';
  html.style.overscrollBehavior = 'none';

  activeLockCount = 1;
}

function unlockDocumentScroll() {
  if (activeLockCount === 0) {
    return;
  }

  activeLockCount -= 1;

  if (activeLockCount > 0) {
    return;
  }

  const body = document.body;
  const html = document.documentElement;

  body.classList.remove('modal-open');
  html.classList.remove('modal-open');
  body.style.overflow = previousBodyStyle?.overflow ?? '';
  body.style.position = previousBodyStyle?.position ?? '';
  body.style.top = previousBodyStyle?.top ?? '';
  body.style.left = previousBodyStyle?.left ?? '';
  body.style.right = previousBodyStyle?.right ?? '';
  body.style.width = previousBodyStyle?.width ?? '';
  html.style.overflow = previousHtmlStyle?.overflow ?? '';
  html.style.overscrollBehavior = previousHtmlStyle?.overscrollBehavior ?? '';

  window.scrollTo(0, lockedScrollY);
}

function targetIsInsideAnyRef(
  target: EventTarget | null,
  refs: Array<RefObject<HTMLElement | null>>,
) {
  if (!(target instanceof Node)) {
    return false;
  }

  return refs.some((ref) => ref.current?.contains(target));
}

export function useBodyScrollLock(
  active: boolean,
  touchBoundaryRefs: Array<RefObject<HTMLElement | null>> = [],
) {
  const refsRef = useRef(touchBoundaryRefs);

  useEffect(() => {
    refsRef.current = touchBoundaryRefs;
  }, [touchBoundaryRefs]);

  useEffect(() => {
    if (!active) {
      return;
    }

    lockDocumentScroll();

    const handleTouchMove = (event: TouchEvent) => {
      if (targetIsInsideAnyRef(event.target, refsRef.current)) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      unlockDocumentScroll();
    };
  }, [active]);
}

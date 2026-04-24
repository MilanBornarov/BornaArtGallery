import { useCallback, useEffect, useRef } from 'react';

const MODAL_HISTORY_KEY = '__artgalleryModal';

type ModalHistoryEntry = {
  id: string;
  key: string;
  url: string;
};

function readModalHistoryEntry(state: unknown): ModalHistoryEntry | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const candidate = (state as Record<string, unknown>)[MODAL_HISTORY_KEY];
  if (!candidate || typeof candidate !== 'object') {
    return null;
  }

  const { id, key, url } = candidate as Record<string, unknown>;
  if (typeof id !== 'string' || typeof key !== 'string' || typeof url !== 'string') {
    return null;
  }

  return { id, key, url };
}

function getCurrentUrl() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function useModalHistoryClose(onClose: () => void, modalKey: string) {
  const onCloseRef = useRef(onClose);
  const modalStateIdRef = useRef<string | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const currentUrl = getCurrentUrl();
    const existingEntry = readModalHistoryEntry(window.history.state);

    if (existingEntry && existingEntry.key === modalKey && existingEntry.url === currentUrl) {
      modalStateIdRef.current = existingEntry.id;
    } else {
      const nextId = `${modalKey}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
      const currentState =
        typeof window.history.state === 'object' && window.history.state !== null
          ? (window.history.state as Record<string, unknown>)
          : {};

      window.history.pushState(
        {
          ...currentState,
          [MODAL_HISTORY_KEY]: {
            id: nextId,
            key: modalKey,
            url: currentUrl,
          },
        },
        '',
        currentUrl,
      );

      modalStateIdRef.current = nextId;
    }

    const handlePopState = (event: PopStateEvent) => {
      const nextEntry = readModalHistoryEntry(event.state);
      if (nextEntry?.id === modalStateIdRef.current) {
        return;
      }

      onCloseRef.current();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [modalKey]);

  return useCallback(() => {
    const currentEntry = readModalHistoryEntry(window.history.state);

    if (currentEntry?.id === modalStateIdRef.current) {
      window.history.back();
      return;
    }

    onCloseRef.current();
  }, []);
}

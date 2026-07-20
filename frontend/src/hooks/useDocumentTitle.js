import { useEffect } from 'react';

export const useDocumentTitle = (title, prevailOnUnmount = false) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      if (!prevailOnUnmount) {
        document.title = originalTitle;
      }
    };
  }, [title, prevailOnUnmount]);
};

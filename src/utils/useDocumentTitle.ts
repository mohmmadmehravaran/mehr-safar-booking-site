import { useEffect } from 'react';

const SITE_NAME = 'مهر سفر';

/**
 * Sets the document <title> for the current page and restores nothing on unmount
 * (the next page sets its own title). Pass the page-specific part only.
 */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - رزرو هتل و اقامتگاه`;
  }, [title]);
}

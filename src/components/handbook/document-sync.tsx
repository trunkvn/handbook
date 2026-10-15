"use client";

import { useEffect } from "react";
import { applyDocumentSettings } from "@/lib/handbook-store";

/**
 * Re-applies the saved theme/language/practice mode to <html> after mount. The inline script in the
 * layout covers normal pages; this covers pages the browser renders from scratch (such as the 404 page),
 * where that script never runs. On normal pages the values are identical, so nothing changes.
 */
export function DocumentSync() {
  useEffect(() => {
    applyDocumentSettings();
  }, []);
  return null;
}

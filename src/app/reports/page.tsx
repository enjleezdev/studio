// This file is intentionally NOT a Next.js page to resolve a route conflict.
// The active page for the /reports route is /src/app/(main)/reports/page.tsx.
// This file can likely be safely deleted if not needed for other purposes.

export const placeholder = "This module does not export a page component.";

// The presence of a named export without a default export
// and without being a 'page.tsx' or 'route.ts' in a segment
// should prevent Next.js from treating this as a page for /reports.

// This file was causing a route conflict with /src/app/(main)/reports/page.tsx
// and has been modified to no longer act as a page.
// The active page for the /reports route is intended to be
// located at /src/app/(main)/reports/page.tsx.
// This file (/src/app/reports/page.tsx) can likely be safely deleted if not needed for other purposes.

export {}; // Ensures this file is treated as a module and does not export a default page component.

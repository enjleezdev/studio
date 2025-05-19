// This file is effectively the entry point for the (main) group's page.tsx due to Next.js routing.
// It will render the content defined in src/app/(main)/page.tsx within the src/app/(main)/layout.tsx
// The actual redirect logic is in src/app/(main)/page.tsx.

// If you need a distinct page at the absolute root (outside the main layout), 
// you would modify this file and potentially not use a (main) group page.tsx as the default.
// For this app, we want the redirect to happen within the main layout context.

// By convention, the page.tsx in the (main) group will be matched for the "/" path.
// This root page.tsx can be simple, or removed if (main)/page.tsx covers the root path fully.
// For clarity, we keep it minimal as its rendering is superseded by the grouped page.

export default function Home() {
  // Content here would be shown if /app/(main)/page.tsx didn't exist or didn't match '/'.
  // Since /app/(main)/page.tsx handles the redirect, this component might not be visibly rendered
  // before the redirect takes effect.
  return null; 
}

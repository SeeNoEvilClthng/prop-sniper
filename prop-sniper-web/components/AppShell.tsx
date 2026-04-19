import React from "react";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
};

export default function AppShell({
  children,
  title,
  subtitle,
  className = "",
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
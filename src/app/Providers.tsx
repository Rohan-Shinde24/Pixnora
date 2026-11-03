// src/app/Providers.tsx
"use client";

import React, { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import BrandHeader from "@/components/BrandHeader";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <Toaster
        toastOptions={{
          style: {
            background: "var(--bg-card)",
            color: "var(--fg)",
            border: "1px solid var(--border)",
          },
          success: { iconTheme: { primary: "var(--fg)", secondary: "var(--bg)" } },
          error: { iconTheme: { primary: "var(--fg)", secondary: "var(--bg)" } },
        }}
      />
      <BrandHeader />
      {children}
    </ThemeProvider>
  );
}

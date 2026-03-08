"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={10}
      containerStyle={{ top: 20 }}
      toastOptions={{
        duration: 3500,
        style: {
          background: "#fff",
          color: "#111827",
          borderRadius: "12px",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)",
          padding: "14px 18px",
          fontSize: "14px",
          fontWeight: "500",
          lineHeight: "1.4",
          maxWidth: "420px",
        },
        success: {
          iconTheme: {
            primary: "#059669",
            secondary: "#fff",
          },
          style: {
            borderLeft: "4px solid #059669",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fff",
          },
          style: {
            borderLeft: "4px solid #dc2626",
          },
        },
      }}
    />
  );
}

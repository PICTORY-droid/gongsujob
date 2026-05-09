"use client";

import { useEffect, useState } from "react";
import AuthForm from "@/components/AuthForm";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryMode = params.get("mode");

    setMode(queryMode === "signup" ? "signup" : "login");
  }, []);

  return <AuthForm mode={mode} />;
}

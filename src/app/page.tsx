"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/marketer/dashboard");
  }, [router]);

  return null; // or a loading spinner if desired
}

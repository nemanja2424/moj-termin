"use client";
import { useRouter } from "next/navigation";
import useAuth from "./useAuth";

export default function useRedirekt() {
  const router = useRouter();
  const isAuthenticated = useAuth();

  return (putanja) => {
    if (isAuthenticated === null) return; // čekamo proveru
    if (putanja === '/panel' && !isAuthenticated) {
      router.push('/login');
    } else {
      router.push(putanja);
    }
  };
}

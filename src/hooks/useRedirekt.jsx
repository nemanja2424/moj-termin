"use client";
import { useRouter } from "next/navigation";
import useAuth from "./useAuth";

export default function useRedirekt() {
  const router = useRouter();
  const isAuthenticated = useAuth();

  return (putanja) => {
    const authToken = localStorage.getItem('authToken');
    if (putanja === '/panel' && !authToken) {
      router.push('/login');
    } else {
      router.push(putanja);
      console.log('/panel')
    }
  };
}

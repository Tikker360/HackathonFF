import LoginForm from "@/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | BuyLow",
};

export default function Login() {
  return <LoginForm />;
}

import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-full bg-off-white">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

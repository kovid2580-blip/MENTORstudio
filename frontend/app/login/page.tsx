"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { apiRequest } from "@/lib/api";
import type { Role } from "@/lib/types";

type AuthMode = "login" | "register";

type AuthResponse = {
  token: string;
  userId: string;
  fullName: string;
  email: string;
  role: Role;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [role, setRole] = useState<Role>("STUDENT");

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    try {
      const auth =
        mode === "login"
          ? await apiRequest<AuthResponse>("/api/auth/login", {
              method: "POST",
              body: JSON.stringify({
                email,
                password
              })
            })
          : await apiRequest<AuthResponse>("/api/auth/register", {
              method: "POST",
              body: JSON.stringify({
                fullName,
                email,
                password,
                role
              })
            });

      window.localStorage.setItem("mentor-auth-token", auth.token);
      window.localStorage.setItem("mentor-user", JSON.stringify(auth));
      router.push("/session/demo-room");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-md px-6 py-16">
        <div className="rounded-[32px] border border-[color:var(--line)] bg-[color:var(--paper)] p-8 shadow-[var(--shadow)]">
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--accent-deep)]">
            Welcome back
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            {mode === "login" ? "Login" : "Create account"}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            Sign in to continue to your mentor session workspace.
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-md border border-[color:var(--line)] p-1">
            <button
              className={`h-10 rounded-md text-sm font-semibold ${
                mode === "login" ? "bg-[color:var(--ink)] text-white" : "text-[color:var(--muted)]"
              }`}
              type="button"
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              className={`h-10 rounded-md text-sm font-semibold ${
                mode === "register"
                  ? "bg-[color:var(--ink)] text-white"
                  : "text-[color:var(--muted)]"
              }`}
              type="button"
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <form className="mt-8 space-y-4" onSubmit={submitAuth}>
            {mode === "register" ? (
              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  className="w-full rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)]"
                  placeholder="Enter full name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                autoComplete="email"
                className="w-full rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)]"
                placeholder="Enter email"
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 outline-none transition placeholder:text-[color:var(--muted)] focus:border-[color:var(--ink)]"
                minLength={6}
                placeholder="Enter password"
                required
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {mode === "register" ? (
              <div>
                <label className="mb-2 block text-sm font-medium" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className="w-full rounded-md border border-[color:var(--line)] bg-[color:var(--paper)] px-4 py-3 outline-none transition focus:border-[color:var(--ink)]"
                  value={role}
                  onChange={(event) => setRole(event.target.value as Role)}
                >
                  <option value="STUDENT">Student</option>
                  <option value="MENTOR">Mentor</option>
                </select>
              </div>
            ) : null}

            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-md bg-[color:var(--ink)] px-4 py-3 font-medium text-white transition hover:bg-[color:var(--accent-deep)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

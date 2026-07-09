"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginState } from "@/lib/actions/admin";

export default function AdminLoginForm() {
  const [state, action] = useActionState<LoginState, FormData>(
    loginAdmin,
    undefined,
  );
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Contraseña de administración
        </span>
        <input
          name="password"
          type="password"
          required
          autoFocus
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-navy outline-none focus:border-teal focus:ring-2 focus:ring-teal/20"
        />
      </label>
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}
      <button className="w-full rounded-lg bg-navy px-6 py-3 font-semibold text-white transition hover:bg-navy-700">
        Ingresar
      </button>
    </form>
  );
}

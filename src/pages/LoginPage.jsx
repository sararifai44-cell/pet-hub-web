import React, { useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useLoginMutation } from "@/features/auth/authApiSlice";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [formError, setFormError] = useState("");

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, []);

  const validate = (values) => {
    const next = { email: "", password: "" };
    const email = values.email?.trim() || "";
    const password = values.password || "";

    if (!email) next.email = "Email is required.";
    else if (!emailRegex.test(email)) next.email = "Enter a valid email address.";

    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Must be at least 6 characters.";

    return next;
  };

  const hasErrors = (errs) => Boolean(errs.email || errs.password);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (formError) setFormError("");

    setForm((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "email" || name === "password") {
        const nextErrors = validate(updated);
        setErrors((prevErr) => ({ ...prevErr, [name]: nextErrors[name] }));
      }
      return updated;
    });
  };

  const onBlur = (e) => {
    const { name } = e.target;
    if (name !== "email" && name !== "password") return;

    setTouched((p) => ({ ...p, [name]: true }));
    const nextErrors = validate(form);
    setErrors((p) => ({ ...p, [name]: nextErrors[name] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({ email: true, password: true });
    if (hasErrors(nextErrors)) return;

    try {
      const data = await login({
        email: form.email.trim(),
        password: form.password,
        remember: form.remember,
      }).unwrap();

      const token =
        data?.token || data?.access_token || data?.data?.token || data?.data?.access_token;

      if (!token) {
        setFormError("Token not found.");
        return;
      }

      const pendingApp = location.state?.pendingAdoption;
      const fromPath = location.state?.from;

      if (pendingApp && fromPath) {
        toast.success("Welcome Back!", { description: "Finalizing your adoption request..." });
        navigate(fromPath, {
          replace: true,
          state: { shouldAutoSubmit: true, pendingAdoption: pendingApp },
        });
      } else if (fromPath) {
        toast.success("Welcome Back!", { description: "Logged in successfully ✅" });
        navigate(fromPath, { replace: true });
      } else {
        toast.success("Welcome Back!", { description: "Logged in successfully ✅" });
        navigate("/", { replace: true });
      }
    } catch (err) {
      const status = err?.status ?? err?.originalStatus;
      const serverMessage = err?.data?.message || err?.data?.error || err?.error || "";
      const fieldErrors = err?.data?.errors;

      const errorsText =
        fieldErrors && typeof fieldErrors === "object"
          ? Object.values(fieldErrors).flat().filter(Boolean).join("\n")
          : "";

      const invalidCreds = status === 422 || status === 401 || status === 403;
      const fallbackInvalid = "Invalid email or password.";

      if (errorsText) return setFormError(errorsText);
      if (serverMessage) return setFormError(serverMessage);
      if (invalidCreds) return setFormError(fallbackInvalid);

      setFormError("Something went wrong.");
    }
  };

  const showEmailError = touched.email && errors.email;
  const showPasswordError = touched.password && errors.password;

  const fieldClass = (isError) =>
    [
      "h-11 w-full rounded-xl px-4 text-sm text-[#152246] outline-none transition-all border shadow-sm",
      isError
        ? "border-red-200 bg-red-50/50 focus:ring-4 focus:ring-red-500/10"
        : "border-slate-100 bg-slate-50/50 focus:border-[#7286A5]/40 focus:bg-white focus:ring-4 focus:ring-[#7286A5]/5",
    ].join(" ");

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex items-center justify-center p-6">
      <div className="fixed inset-0 -z-10 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFBFB] via-[#F8FAFC] to-[#F3F7FF]" />
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237286A5'%3E%3Cpath d='M4.5 10c1.38 0 2.5-1.12 2.5-2.5S5.88 5 4.5 5 2 6.12 2 7.5 3.12 10 4.5 10zm3.5-3c1.38 0 2.5-1.12 2.5-2.5S9.38 2 8 2 5.5 3.12 5.5 4.5 6.62 7 8 7zm8 0c1.38 0 2.5-1.12 2.5-2.5S17.38 2 16 2s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm3.5 3c1.38 0 2.5-1.12 2.5-2.5S20.88 5 19.5 5 17 6.12 17 7.5s1.12 2.5 2.5 2.5zM12 9c-3.31 0-6 2.69-6 6 0 2.33 1.91 4.5 4.5 4.5.83 0 1.5.67 1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5.67-1.5 1.5-1.5c2.59 0 4.5-2.17 4.5-4.5 0-3.31-2.69-6-6-6z'/%3E%3C/svg%3E")`,
            backgroundSize: "70px 70px",
          }}
        />
        <div className="absolute top-0 right-0 h-[450px] w-[450px] bg-[#E07060]/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 h-[450px] w-[450px] bg-[#7286A5]/5 blur-[100px] rounded-full" />
      </div>

      <div className="group relative flex w-full max-w-4xl min-h-[520px] overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.15)] border border-white/50 transition-transform duration-700 hover:scale-[1.015]">
        <div className="w-full p-10 md:w-1/2 flex flex-col justify-center bg-white relative z-10 shadow-[20px_0_40px_rgba(0,0,0,0.02)]">
          <div className="max-w-[300px] mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black tracking-tight text-[#152246]">Welcome Back!</h1>
              <p className="mt-2 text-xs text-[#64748b] font-medium leading-relaxed">
                Continue your journey.
              </p>
            </div>

            {formError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 whitespace-pre-line">
                {formError}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              <div className="text-left">
                <label
                  className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={fieldClass(showEmailError)}
                  disabled={isLoading}
                />
                {showEmailError && (
                  <p className="mt-1.5 text-[10px] text-red-500 font-medium">*{errors.email}</p>
                )}
              </div>

              <div className="text-left">
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-[10px] font-bold text-[#E07060] hover:underline">
                    Forgot?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={fieldClass(showPasswordError)}
                  disabled={isLoading}
                />
                {showPasswordError && (
                  <p className="mt-1.5 text-[10px] text-red-500 font-medium">*{errors.password}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  checked={form.remember}
                  onChange={onChange}
                  className="h-4.5 w-4.5 rounded border-slate-200 text-[#E07060] focus:ring-[#E07060]/20 cursor-pointer"
                />
                <label htmlFor="remember" className="text-xs font-semibold text-[#64748b] cursor-pointer">
                  Stay signed in
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="h-12 w-full rounded-xl bg-[#152246] text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1e2f5e] active:scale-[0.98]"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-8 text-center text-xs font-medium text-[#64748b]">
              New here?{" "}
              <Link to="/register" className="font-bold text-[#E07060] hover:underline decoration-2 underline-offset-4">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="relative hidden md:flex w-1/2 flex-col items-center justify-center bg-[#7286A5] p-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.12),transparent)]" />
          <div className="relative z-10 w-full max-w-[220px] transform transition-all duration-700 group-hover:scale-105 group-hover:-rotate-1">
            <div className="p-3.5 bg-white/10 backdrop-blur-xl rounded-[2.2rem] border border-white/20 shadow-2xl">
              <img src="/Screenshot 2025-12-20 231145.png" alt="Pet Hub" className="w-full h-auto rounded-[1.6rem]" />
            </div>
            <div className="mt-8 text-center text-white">
              <h2 className="text-xl font-black tracking-tight">Find Your Best Friend</h2>
              <p className="text-[10px] text-white/70 mt-2.5 uppercase tracking-[0.2em] font-bold leading-relaxed">
                Compassionate Care For Every Pet
              </p>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 h-56 w-56 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { useRegisterMutation } from "@/features/auth/authApiSlice";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    agree: false,
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: "",
  });

  const [formError, setFormError] = useState("");

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, []);

  const validate = (values) => {
    const next = { name: "", email: "", password: "", confirmPassword: "", agree: "" };

    const name = values.name?.trim() || "";
    const email = values.email?.trim() || "";
    const password = values.password || "";
    const confirmPassword = values.confirmPassword || "";

    if (!name) next.name = "Name is required.";
    if (!email) next.email = "Email is required.";
    else if (!emailRegex.test(email)) next.email = "Invalid email.";

    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Min 6 characters.";

    if (confirmPassword !== password) next.confirmPassword = "Passwords mismatch.";
    if (!values.agree) next.agree = "Terms must be accepted.";

    return next;
  };

  const hasErrors = (errs) => Object.values(errs).some((v) => v !== "");

  const applyServerFieldErrors = (fieldErrors) => {
    if (!fieldErrors || typeof fieldErrors !== "object") return;

    const firstMsg = (arr) => (Array.isArray(arr) ? arr.filter(Boolean)[0] : "");

    const nextErrors = { ...errors };
    const nextTouched = { ...touched };

    if (fieldErrors.name) {
      nextErrors.name = firstMsg(fieldErrors.name) || nextErrors.name;
      nextTouched.name = true;
    }
    if (fieldErrors.email) {
      nextErrors.email = firstMsg(fieldErrors.email) || nextErrors.email;
      nextTouched.email = true;
    }
    if (fieldErrors.password) {
      nextErrors.password = firstMsg(fieldErrors.password) || nextErrors.password;
      nextTouched.password = true;
    }
    if (fieldErrors.password_confirmation) {
      nextErrors.confirmPassword =
        firstMsg(fieldErrors.password_confirmation) || nextErrors.confirmPassword;
      nextTouched.confirmPassword = true;
    }

    setErrors(nextErrors);
    setTouched(nextTouched);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (formError) setFormError("");

    setForm((prev) => {
      const updated = { ...prev, [name]: type === "checkbox" ? checked : value };
      const nextErrors = validate(updated);

      setErrors((prevErr) => {
        if (name === "password" || name === "confirmPassword") {
          return {
            ...prevErr,
            password: nextErrors.password,
            confirmPassword: nextErrors.confirmPassword,
          };
        }
        return { ...prevErr, [name]: nextErrors[name] || "" };
      });

      return updated;
    });
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));

    const nextErrors = validate(form);
    setErrors((prevErr) => {
      if (name === "password" || name === "confirmPassword") {
        return {
          ...prevErr,
          password: nextErrors.password,
          confirmPassword: nextErrors.confirmPassword,
        };
      }
      return { ...prevErr, [name]: nextErrors[name] || "" };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      agree: true,
    });

    if (hasErrors(nextErrors)) return;

    try {
      const data = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.confirmPassword,
      }).unwrap();

      const token = data?.token || data?.access_token || data?.data?.token;
      if (token) Cookies.set("token", token);

      toast.success("Welcome!", { description: "Account created ✅" });
      navigate("/login");
    } catch (err) {
      const status = err?.status ?? err?.originalStatus;
      const serverMessage = err?.data?.message || err?.data?.error || err?.error || "";
      const fieldErrors = err?.data?.errors;

      const errorsText =
        fieldErrors && typeof fieldErrors === "object"
          ? Object.values(fieldErrors).flat().filter(Boolean).join("\n")
          : "";

      if (fieldErrors) applyServerFieldErrors(fieldErrors);

      const emailTakenMsg =
        fieldErrors?.email && Array.isArray(fieldErrors.email)
          ? fieldErrors.email.filter(Boolean)[0]
          : "";

      const isEmailTaken = Boolean(emailTakenMsg) || status === 409;

      if (isEmailTaken) {
        const msg = emailTakenMsg || serverMessage || "This email is already registered.";
        toast.warning("Warning", { description: msg });
        setFormError(msg);
        return;
      }

      if (errorsText) return setFormError(errorsText);
      if (serverMessage) return setFormError(serverMessage);

      if (status === 422) return setFormError("Please check your inputs.");

      setFormError("Something went wrong.");
    }
  };

  const fieldClass = (key) =>
    [
      "h-10 w-full rounded-xl px-4 text-sm text-[#152246] outline-none transition-all border shadow-sm",
      touched[key] && errors[key]
        ? "border-red-200 bg-red-50/50 focus:ring-4 focus:ring-red-500/10"
        : "border-slate-100 bg-slate-50/50 focus:border-[#7286A5]/40 focus:bg-white focus:ring-4 focus:ring-[#7286A5]/5",
    ].join(" ");

  return (
    <div className="relative min-h-dvh w-full overflow-hidden flex items-center justify-center p-6">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFFBFB] via-[#F8FAFC] to-[#F3F7FF]" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%237286A5'%3E%3Cpath d='M4.5 10c1.38 0 2.5-1.12 2.5-2.5S5.88 5 4.5 5 2 6.12 2 7.5 3.12 10 4.5 10zm3.5-3c1.38 0 2.5-1.12 2.5-2.5S9.38 2 8 2 5.5 3.12 5.5 4.5 6.62 7 8 7zm8 0c1.38 0 2.5-1.12 2.5-2.5S17.38 2 16 2s-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm3.5 3c1.38 0 2.5-1.12 2.5-2.5S20.88 5 19.5 5 17 6.12 17 7.5s1.12 2.5 2.5 2.5zM12 9c-3.31 0-6 2.69-6 6 0 2.33 1.91 4.5 4.5 4.5.83 0 1.5.67 1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5.67-1.5 1.5-1.5c2.59 0 4.5-2.17 4.5-4.5 0-3.31-2.69-6-6-6z'/%3E%3C/svg%3E")`,
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      <div className="group relative flex w-full max-w-4xl min-h-[520px] overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] border border-white/50 transition-transform duration-700 hover:scale-[1.015]">
        {/* LEFT */}
        <div className="w-full p-10 md:w-1/2 flex flex-col justify-center bg-white relative z-10 shadow-[20px_0_40px_rgba(0,0,0,0.015)]">
          <div className="max-w-[300px] mx-auto w-full">
            <h1 className="text-2xl font-black tracking-tight text-[#152246]">Join Pet Hub</h1>
            <p className="mt-2 text-xs text-[#64748b] font-medium leading-relaxed">
              Start your journey with us today.
            </p>

            {formError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-semibold text-red-600 whitespace-pre-line">
                {formError}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                  Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="Name"
                  value={form.name}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={fieldClass("name")}
                  disabled={isLoading}
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-[10px] text-red-500 font-medium">*{errors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={fieldClass("email")}
                  disabled={isLoading}
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-[10px] text-red-500 font-medium">*{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="••••"
                    value={form.password}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={fieldClass("password")}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">
                    Confirm
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    placeholder="••••"
                    value={form.confirmPassword}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={fieldClass("confirmPassword")}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {(touched.password && errors.password) ||
              (touched.confirmPassword && errors.confirmPassword) ? (
                <p className="text-[10px] text-red-500 font-medium">
                  *{errors.password || errors.confirmPassword}
                </p>
              ) : null}

              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  name="agree"
                  id="agree"
                  checked={form.agree}
                  onChange={onChange}
                  onBlur={onBlur}
                  className="mt-0.5 h-4 w-4 rounded border-slate-200 text-[#E07060] focus:ring-[#E07060]/20 cursor-pointer"
                />
                <label
                  htmlFor="agree"
                  className="text-[10px] font-semibold text-[#64748b] leading-tight cursor-pointer"
                >
                  I agree to the <span className="text-[#152246] underline decoration-slate-300">Terms</span>{" "}
                  and <span className="text-[#152246] underline decoration-slate-300">Privacy</span>
                </label>
              </div>

              {touched.agree && errors.agree ? (
                <p className="text-[10px] text-red-500 font-medium">*{errors.agree}</p>
              ) : null}

              <button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full rounded-xl bg-[#152246] text-sm font-bold text-white shadow-lg transition-all hover:bg-[#1e2f5e] active:scale-[0.98]"
              >
                {isLoading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <p className="mt-7 text-center text-xs font-medium text-[#64748b]">
              Have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-[#E07060] hover:underline decoration-2 underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative hidden md:flex w-1/2 flex-col items-center justify-center bg-[#7286A5] p-10 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.12),transparent)]" />
          <div className="relative z-10 w-full max-w-[210px] transform transition-all duration-700 group-hover:scale-105 group-hover:-rotate-1">
            <div className="p-3.5 bg-white/10 backdrop-blur-xl rounded-[2.2rem] border border-white/20 shadow-2xl">
              <img
                src="/Screenshot 2025-12-20 231145.png"
                alt="Pet Hub"
                className="w-full h-auto rounded-[1.6rem]"
              />
            </div>
            <div className="mt-8 text-center text-white">
              <h2 className="text-xl font-black tracking-tight">Start Your Journey</h2>
              <p className="text-[10px] text-white/70 mt-2.5 uppercase tracking-[0.2em] font-bold leading-relaxed">
                Every Pet Deserves A Home
              </p>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 h-56 w-56 bg-white/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

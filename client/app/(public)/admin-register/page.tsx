"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getUserRole, isAuthenticated } from "@/lib/auth";
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminRegisterPage() {
    const router = useRouter();

    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        adminCode: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Toggle admin code field via env
    const requireAdminCode = useMemo(
        () => String(process.env.NEXT_PUBLIC_REQUIRE_ADMIN_CODE || "").toLowerCase() === "true",
        []
    );

    useEffect(() => setMounted(true), []);

    // If already authed, route by role
    useEffect(() => {
        if (!mounted) return;
        if (isAuthenticated()) {
            const role = getUserRole();
            if (role === "admin") router.replace("/admin");
            else router.replace("/");
        }
    }, [mounted, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Please enter email and password.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (requireAdminCode && !form.adminCode) {
            setError("Please enter the admin invite code.");
            return;
        }

        setLoading(true);
        try {
            const payload: Record<string, string> = {
                email: form.email.trim(),
                password: form.password,
                role: "admin",
            };
            if (requireAdminCode) payload.adminCode = form.adminCode.trim();

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed");

            const token: string = data.token;
            localStorage.setItem("token", token);

            const payloadJwt = JSON.parse(atob(token.split(".")[1]));
            const role = payloadJwt.role;

            if (role === "admin") router.push("/admin");
            else router.push("/");
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="text-center mb-8">
                    <Image src="/images/logo/logo.png" alt="Logo" className="mx-auto mb-10" width={180} height={180} />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <Shield className="h-6 w-6 text-emerald-700" />
                        Admin setup
                    </h1>
                    <p className="text-gray-600">Create an administrator account</p>
                </div>

                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive" className="animate-in slide-in-from-top duration-300">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Admin Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="admin@example.com"
                                        className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Optional Admin Code */}
                            {requireAdminCode && (
                                <div className="space-y-2">
                                    <Label htmlFor="adminCode" className="text-sm font-medium text-gray-700">Admin Invite Code</Label>
                                    <Input
                                        id="adminCode"
                                        name="adminCode"
                                        type="text"
                                        placeholder="Enter the admin invite code"
                                        className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                        value={form.adminCode}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            )}

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Re-enter your password"
                                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                        value={form.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        disabled={loading}
                                        aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating admin…
                                    </>
                                ) : (
                                    "Create Admin"
                                )}
                            </Button>

                            {/* No cross-links here (intentionally) */}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

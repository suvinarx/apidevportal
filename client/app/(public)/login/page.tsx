"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUserRole, isAuthenticated } from "@/lib/auth"
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [form, setForm] = useState({ email: "", password: "" })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Handle client-side mounting
    useEffect(() => {
        setMounted(true)
    }, [])

    // 🔐 Redirect logged-in users
    useEffect(() => {
        if (mounted && isAuthenticated()) {
            const role = getUserRole()
            if (role === "admin") router.replace("/admin")
            else router.replace("/")
        }
    }, [mounted, router])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value })
        // Clear error when user starts typing
        if (error) setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.message || "Login failed")

            const token = data.token
            localStorage.setItem("token", token)

            const payload = JSON.parse(atob(token.split(".")[1]))
            const role = payload.role

            if (role === "admin") {
                router.push("/admin")
            } else {
                router.push("/")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Brand Section */}
                <div className="text-center mb-8">
                    <Image src="/images/logo/logo.png" alt="Logo" className="mx-auto mb-10" width={180} height={180} />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome</h1>
                    <p className="text-gray-600">Sign in to your API Developer Portal account</p>
                </div>

                {/* Login Card */}
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-6">
                        {/* <CardTitle className="text-xl font-semibold text-center text-gray-900">Sign In</CardTitle>
                        <CardDescription className="text-center text-gray-600">
                            Enter your credentials to access your account
                        </CardDescription> */}
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Alert */}
                            {error && (
                                <Alert variant="destructive" className="animate-in slide-in-from-top duration-300">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={loading}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                            <p className="text-center text-sm text-gray-600">
                                New to API Developer Portal?{" "}
                                <Link href="/register" className="font-medium text-emerald-700 hover:text-emerald-800 underline-offset-4 hover:underline">
                                    Create an account
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

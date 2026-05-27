"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Lock, Mail, User, Phone, Briefcase, Award, ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react"
import { isSupabaseAvailable, supabase } from "@/lib/supabase"
import { fallbackSignUp, fallbackSignIn, getCurrentUser } from "@/lib/employee-db"

export default function EmployeeAuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [supabaseActive, setSupabaseActive] = useState(false)

  // Form states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [role, setRole] = useState("")

  // Status Screen state
  const [statusScreen, setStatusScreen] = useState<"none" | "pending" | "rejected">("none")
  const [pendingUser, setPendingUser] = useState<any>(null)

  useEffect(() => {
    setSupabaseActive(isSupabaseAvailable())
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    // 1. Check fallback cookies session
    const res = await getCurrentUser()
    if (res.success && res.profile) {
      handleUserRedirect(res.profile)
      return
    }

    // 2. Check standard Supabase session
    if (isSupabaseAvailable() && supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        // Fetch profile
        const { data } = await supabase
          .from("employee_profiles")
          .select("*")
          .eq("auth_user_id", session.user.id)
          .single()
        if (data) {
          handleUserRedirect(data)
        }
      }
    }
  }

  const handleUserRedirect = (profile: any) => {
    if (profile.disabled) {
      toast.error("Your account has been disabled. Please contact the administrator.")
      return
    }

    if (profile.approval_status === "approved") {
      toast.success(`Welcome back, ${profile.full_name}`)
      router.push("/employee/dashboard")
    } else if (profile.approval_status === "rejected") {
      setStatusScreen("rejected")
    } else {
      setPendingUser(profile)
      setStatusScreen("pending")
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isLogin) {
      // --- SIGN IN FLOW ---
      if (!email || !password) {
        toast.error("Please fill in all fields")
        setLoading(false)
        return
      }

      if (supabaseActive && supabase) {
        // 1. Supabase Sign In
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) throw error

          if (data?.user) {
            // Fetch profile
            const { data: profile, error: profileErr } = await supabase
              .from("employee_profiles")
              .select("*")
              .eq("auth_user_id", data.user.id)
              .single()

            if (profileErr) throw profileErr
            handleUserRedirect(profile)
          }
        } catch (err: any) {
          toast.error(err.message || "Failed to authenticate with Supabase.")
          console.error(err)
        } finally {
          setLoading(false)
        }
      } else {
        // 2. Fallback DB Sign In
        const res = await fallbackSignIn(email)
        setLoading(false)

        if (res.success && res.profile) {
          handleUserRedirect(res.profile)
        } else {
          toast.error(res.error || "Authentication failed.")
        }
      }
    } else {
      // --- SIGN UP FLOW ---
      if (!email || !password || !fullName || !employeeId || !role) {
        toast.error("Please fill in all required fields (*)")
        setLoading(false)
        return
      }

      if (supabaseActive && supabase) {
        // 1. Supabase Sign Up
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                phone,
                employee_id: employeeId,
                role,
              },
            },
          })

          if (error) throw error

          if (data?.user) {
            toast.success("Account created successfully! Status is pending admin approval.")
            // Try fetching newly created profile from public schema
            setTimeout(async () => {
              const { data: profile } = await supabase!
                .from("employee_profiles")
                .select("*")
                .eq("auth_user_id", data.user!.id)
                .single()
              if (profile) {
                handleUserRedirect(profile)
              } else {
                setPendingUser({ full_name: fullName, employee_id: employeeId })
                setStatusScreen("pending")
              }
            }, 1000)
          }
        } catch (err: any) {
          toast.error(err.message || "Sign up failed.")
          console.error(err)
        } finally {
          setLoading(false)
        }
      } else {
        // 2. Fallback DB Sign Up
        const res = await fallbackSignUp({
          fullName,
          email,
          phone,
          employeeId,
          role,
        })
        setLoading(false)

        if (res.success && res.profile) {
          toast.success("Registration successful! Access is pending admin approval.")
          setPendingUser(res.profile)
          setStatusScreen("pending")
        } else {
          toast.error(res.error || "Sign up failed.")
        }
      }
    }
  }

  // Pending Status Screen
  if (statusScreen === "pending") {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/50 backdrop-blur-xl border border-brand-border rounded-3xl p-8 shadow-2xl text-center"
        >
          <div className="bg-brand-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8 text-brand-green animate-pulse" />
          </div>
          <h2 className="text-3xl font-display font-medium tracking-tighter uppercase mb-4">
            Registration <span className="text-brand-green italic">Pending</span>
          </h2>
          <p className="text-brand-text/70 mb-6 text-sm">
            Thank you, <strong className="text-brand-text">{pendingUser?.full_name || "Employee"}</strong>. Your account (ID: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{pendingUser?.employee_id || "EMP"}</code>) has been successfully created.
          </p>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs text-left mb-8 flex gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold mb-1">Awaiting Administrator Approval</p>
              <p className="text-amber-700/90 leading-relaxed">
                Before you can access the employee dashboard, a system administrator must verify your credentials and approve your profile. You will receive access once approved.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setStatusScreen("none")
              setIsLogin(true)
            }}
            variant="outline"
            className="w-full h-12 rounded-2xl border-brand-border hover:bg-brand-background hover:text-brand-green transition-all"
          >
            Back to Sign In
          </Button>
        </motion.div>
      </div>
    )
  }

  // Rejected Status Screen
  if (statusScreen === "rejected") {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-6 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white/50 backdrop-blur-xl border border-red-200 rounded-3xl p-8 shadow-2xl text-center"
        >
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-3xl font-display font-medium tracking-tighter uppercase mb-4 text-red-600">
            Request <span className="italic">Declined</span>
          </h2>
          <p className="text-brand-text/70 mb-8 text-sm">
            Unfortunately, your request for employee portal registration has been rejected by the administrator. If you believe this is an error, please reach out to HR.
          </p>
          <Button
            onClick={() => {
              setStatusScreen("none")
              setIsLogin(true)
            }}
            className="w-full h-12 rounded-2xl bg-brand-text text-white hover:bg-brand-green transition-all"
          >
            Back to Login
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background flex flex-col md:flex-row relative overflow-hidden">
      {/* Background shapes */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Decorative / Info Column */}
      <div className="w-full md:w-1/2 bg-brand-text text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden shrink-0 pt-28 md:pt-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-10" />
        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-6">
            <Award className="h-3 w-3 text-brand-green" />
            Employee Portal
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight leading-none mb-6">
            Design. <span className="text-brand-green italic">Collaborate.</span> <br />Build the Future.
          </h1>
          <p className="text-white/60 text-sm leading-relaxed mb-8">
            Access your personalized workspace to log attendance, review monthly payslips, and coordinate with Rushikesh Sutar & Associates.
          </p>
          <div className="grid grid-cols-2 gap-4 text-xs text-white/50">
            <div className="border-l-2 border-brand-green pl-3">
              <span className="font-semibold text-white block">Secure Access</span> Supabase RLS Protected
            </div>
            <div className="border-l-2 border-brand-green pl-3">
              <span className="font-semibold text-white block">Payslip Portal</span> Auto-Calculated Records
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-12 text-[10px] uppercase tracking-widest text-white/30">
          Rushikesh Sutar & Associates &copy; 2026
        </div>
      </div>

      {/* Form Column */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 pt-12 md:pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          {/* Debug / Fallback alert indicator */}
          {!supabaseActive && (
            <div className="bg-amber-50/70 backdrop-blur-sm border border-amber-200 text-amber-800 rounded-2xl p-4 text-[11px] mb-6 flex gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-semibold">Local Fallback Mode Active</span>. Client credentials not set in `.env`. The app is seamlessly using cookie-based database auth fallback so you can fully test!
              </div>
            </div>
          )}

          <div className="text-center md:text-left mb-8">
            <h2 className="text-3xl font-display font-medium tracking-tighter uppercase mb-2">
              {isLogin ? "Employee" : "Create"}{" "}
              <span className="text-brand-green italic">{isLogin ? "Portal" : "Profile"}</span>
            </h2>
            <p className="text-brand-text/60 text-xs">
              {isLogin
                ? "Enter your credentials to access your dashboard"
                : "Fill out the fields to request employee system access"}
            </p>
          </div>

          <Card className="bg-white/40 backdrop-blur-xl border border-brand-border shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleAuth} className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-1">
                        <Label htmlFor="fullName" className="text-xs font-semibold text-brand-text/70">
                          Full Name *
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text/40" />
                          <Input
                            id="fullName"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-11 h-12 rounded-2xl bg-white/70 border-brand-border"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="employeeId" className="text-xs font-semibold text-brand-text/70">
                            Employee ID *
                          </Label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text/40" />
                            <Input
                              id="employeeId"
                              placeholder="RSA-101"
                              value={employeeId}
                              onChange={(e) => setEmployeeId(e.target.value)}
                              className="pl-11 h-12 rounded-2xl bg-white/70 border-brand-border"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="role" className="text-xs font-semibold text-brand-text/70">
                            Position / Role *
                          </Label>
                          <div className="relative">
                            <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text/40" />
                            <Input
                              id="role"
                              placeholder="Architect"
                              value={role}
                              onChange={(e) => setRole(e.target.value)}
                              className="pl-11 h-12 rounded-2xl bg-white/70 border-brand-border"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="phone" className="text-xs font-semibold text-brand-text/70">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text/40" />
                          <Input
                            id="phone"
                            placeholder="+91 9999999999"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="pl-11 h-12 rounded-2xl bg-white/70 border-brand-border"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-semibold text-brand-text/70">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text/40" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="employee@rsandassociates.co.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 rounded-2xl bg-white/70 border-brand-border"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs font-semibold text-brand-text/70">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-text/40" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 rounded-2xl bg-white/70 border-brand-border"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-brand-text text-white hover:bg-brand-green transition-all flex items-center justify-center gap-2 group/btn mt-6"
                >
                  {loading ? "Authenticating..." : isLogin ? "Sign In" : "Request Access"}
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs mt-6 text-brand-text/50">
            {isLogin ? "Don't have portal access?" : "Already requested access?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-green font-semibold hover:underline bg-transparent border-none cursor-none"
            >
              {isLogin ? "Sign Up here" : "Sign In here"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

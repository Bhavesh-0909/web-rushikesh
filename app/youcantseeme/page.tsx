"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Shield, Lock, ArrowRight, XCircle } from "lucide-react"
import AdminControls from "@/components/admin-controls"
import { toast } from "sonner"

export default function AdminEntryPoint() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [isMounting, setIsMounting] = useState(true)

  useEffect(() => {
    setIsMounting(false)
    const authStatus = sessionStorage.getItem("admin_auth")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (password === "rushikesh") {
      setIsAuthenticated(true)
      sessionStorage.setItem("admin_auth", "true")
      toast.success("Welcome back, Rushikesh")
    } else {
      setError(true)
      setTimeout(() => setError(false), 2000)
      toast.error("Invalid access code")
    }
  }

  if (isMounting) return null

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-background pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-display font-medium mb-2 uppercase tracking-tighter">
                Control <span className="text-brand-green italic">Panel</span>
              </h1>
              <p className="text-brand-text/60">Manage your digital presence and studio portfolio.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAuthenticated(false)
                sessionStorage.removeItem("admin_auth")
              }}
              className="rounded-full border-brand-border hover:bg-brand-background hover:text-brand-green transition-all"
            >
              Lock Panel
            </Button>
          </div>
          
          <div className="bg-white/50 backdrop-blur-xl border border-brand-border rounded-3xl p-8 shadow-2xl">
            <AdminControls />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand-green/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-brand-green/10 rounded-full blur-[100px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-sm border border-brand-border mb-6">
            <Lock className="w-8 h-8 text-brand-green" />
          </div>
          <h1 className="text-3xl font-display font-medium tracking-tighter uppercase mb-2">
            Restricted <span className="text-brand-green italic">Access</span>
          </h1>
          <p className="text-brand-text/60 text-sm">Please verify your identity to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Input
              type="password"
              placeholder="Verification Code"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className={`h-14 px-6 rounded-2xl border-brand-border bg-white shadow-sm focus:ring-brand-green focus:border-brand-green transition-all ${error ? 'border-red-500 bg-red-50' : ''}`}
              autoFocus
            />
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"
                >
                  <XCircle className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-brand-text text-white hover:bg-brand-green transition-all flex items-center justify-center gap-2 group"
          >
            Verify Identity
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <p className="mt-8 text-center text-brand-text/40 text-[10px] uppercase tracking-widest">
          Rushikesh Sutar & Associates &copy; 2024
        </p>
      </motion.div>
    </div>
  )
}

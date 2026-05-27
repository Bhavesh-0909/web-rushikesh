"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  User,
  Calendar,
  DollarSign,
  Briefcase,
  CheckCircle,
  Clock,
  Download,
  LogOut,
  MapPin,
  ChevronRight,
  Sparkles,
  Printer,
  TableProperties
} from "lucide-react"
import { getCurrentUser, logoutUser, markAttendance, getAttendanceHistory, getSalaryStructure, getPayslipHistory } from "@/lib/employee-db"
import { isSupabaseAvailable, supabase } from "@/lib/supabase"

export default function EmployeeDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Portal states
  const [todayCheckedIn, setTodayCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<string | null>(null)
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([])
  const [salaryComponents, setSalaryComponents] = useState<any[]>([])
  const [payslips, setPayslips] = useState<any[]>([])

  // Calendar / Month state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    fetchProfileAndData()
  }, [])

  const fetchProfileAndData = async () => {
    try {
      setLoading(true)
      let userProfile: any = null

      // 1. Try Fallback cookies auth
      const res = await getCurrentUser()
      if (res.success && res.profile) {
        userProfile = res.profile
      }

      // 2. Try Supabase Auth
      if (!userProfile && isSupabaseAvailable() && supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data } = await supabase
            .from("employee_profiles")
            .select("*")
            .eq("auth_user_id", session.user.id)
            .single()
          if (data) userProfile = data
        }
      }

      if (!userProfile) {
        toast.error("Session expired. Please log in.")
        router.push("/employee")
        return
      }

      if (userProfile.disabled) {
        toast.error("Your account has been disabled. Please contact the administrator.")
        router.push("/employee")
        return
      }

      if (userProfile.approval_status !== "approved") {
        router.push("/employee")
        return
      }

      setProfile(userProfile)

      // Fetch additional logs
      const [attRes, salRes, payRes] = await Promise.all([
        getAttendanceHistory(userProfile.id, currentYear, currentMonth),
        getSalaryStructure(userProfile.id),
        getPayslipHistory(userProfile.id),
      ])

      if (attRes.success && attRes.records) {
        setAttendanceLogs(attRes.records)
        // Check if checked in today
        const tzOffset = (new Date()).getTimezoneOffset() * 60000;
        const todayStr = new Date(Date.now() - tzOffset).toISOString().split("T")[0]
        const todayRecord = attRes.records.find((r: any) => r.date === todayStr)
        if (todayRecord) {
          setTodayCheckedIn(true)
          setCheckInTime(new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        }
      }

      if (salRes.success && salRes.structure) {
        setSalaryComponents(salRes.structure)
      }

      if (payRes.success && payRes.payslips) {
        setPayslips(payRes.payslips)
      }

    } catch (err: any) {
      console.error(err)
      toast.error("Error loading dashboard data.")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!profile) return
    setLoading(true)

    try {
      const res = await markAttendance(profile.id, "present")
      if (res.success) {
        toast.success("Attendance marked successfully!")
        setTodayCheckedIn(true)
        setCheckInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
        // Refresh logs
        const attRes = await getAttendanceHistory(profile.id, currentYear, currentMonth)
        if (attRes.success && attRes.records) {
          setAttendanceLogs(attRes.records)
        }
      } else {
        toast.error(res.error || "Failed to mark attendance.")
      }
    } catch (err: any) {
      console.error(err)
      toast.error("An error occurred during check-in.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    // 1. Fallback Logout
    await logoutUser()

    // 2. Supabase Logout
    if (isSupabaseAvailable() && supabase) {
      await supabase.auth.signOut()
    }

    toast.success("Logged out successfully.")
    router.push("/employee")
  }

  const handlePrintPayslip = (payslipId: number) => {
    // Open printable page in new window
    window.open(`/employee/payslip/${payslipId}`, "_blank", "width=850,height=1000")
  }

  // Calculate attendance metrics
  const totalCalendarDays = new Date(currentYear, currentMonth, 0).getDate()
  const presentCount = attendanceLogs.filter(r => r.status === "present" || r.status === "late").length
  const halfDayCount = attendanceLogs.filter(r => r.status === "half_day").length
  const totalPresentEquivalent = presentCount + (halfDayCount * 0.5)
  const attendanceRate = totalCalendarDays > 0 ? ((totalPresentEquivalent / totalCalendarDays) * 100).toFixed(1) : "0"

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-green" />
          <p className="text-brand-text/60 text-xs uppercase tracking-widest">Loading workspace...</p>
        </div>
      </div>
    )
  }

  const latestPayslip = payslips[0]

  return (
    <div className="min-h-screen bg-brand-background pt-28 md:pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-border pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-green text-[10px] font-semibold uppercase tracking-widest mb-1">
              <Sparkles className="h-3 w-3" />
              Active Workspace
            </div>
            <h1 className="text-4xl font-display font-medium uppercase tracking-tighter leading-none">
              Welcome, <span className="text-brand-green italic">{profile?.full_name}</span>
            </h1>
            <p className="text-brand-text/60 text-xs mt-1">
              ID: <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] font-mono">{profile?.employee_id}</code> &bull; Role: {profile?.role}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="rounded-full border-brand-border hover:bg-red-50 hover:text-red-600 transition-all flex items-center gap-2 cursor-none"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Column Left (Attendance Check-In & Stats) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Daily Check-In Card */}
            <Card className="bg-white/50 backdrop-blur-xl border border-brand-border shadow-md rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-brand-green" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-green" />
                  Daily Attendance
                </CardTitle>
                <CardDescription className="text-xs">
                  Mark your attendance once per day to log your presence.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                {todayCheckedIn ? (
                  <div className="space-y-3">
                    <div className="bg-brand-green/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-9 w-9 text-brand-green" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-brand-text">Checked In for Today</h4>
                      <p className="text-xs text-brand-text/50 flex items-center justify-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        Time: {checkInTime || "Logged"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 w-full">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                      <Clock className="h-9 w-9 text-brand-text/30" />
                    </div>
                    <p className="text-xs text-brand-text/50">
                      You haven't logged your attendance for today yet.
                    </p>
                    <Button
                      onClick={handleCheckIn}
                      className="w-full h-12 rounded-2xl bg-brand-green hover:bg-brand-green/90 text-white cursor-none"
                    >
                      Check In Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Attendance Stats */}
            <Card className="bg-white/50 backdrop-blur-xl border border-brand-border shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Monthly Statistics</CardTitle>
                <CardDescription className="text-xs">
                  Overview of current month calculations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/80 p-4 rounded-2xl border border-brand-border/60">
                    <span className="text-[10px] uppercase tracking-wider text-brand-text/40 block">Present Days</span>
                    <span className="text-2xl font-bold text-brand-text mt-1 block">
                      {totalPresentEquivalent} <span className="text-xs font-normal text-brand-text/50">/ {totalCalendarDays}</span>
                    </span>
                  </div>
                  <div className="bg-white/80 p-4 rounded-2xl border border-brand-border/60">
                    <span className="text-[10px] uppercase tracking-wider text-brand-text/40 block">Attendance Rate</span>
                    <span className="text-2xl font-bold text-brand-green mt-1 block">
                      {attendanceRate}%
                    </span>
                  </div>
                </div>

                <div className="bg-brand-green/5 rounded-2xl p-4 border border-brand-green/10 text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-brand-text/70">Full Days Present:</span>
                    <span className="font-semibold text-brand-text">{presentCount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-brand-text/70">Half Days logged:</span>
                    <span className="font-semibold text-brand-text">{halfDayCount}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-brand-green/10 pt-2 font-medium">
                    <span className="text-brand-green">Total Present Value:</span>
                    <span className="text-brand-green">{totalPresentEquivalent} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Column Middle & Right (Payslips & History) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Latest Payslip Summary */}
            <Card className="bg-brand-text text-white border-none shadow-xl rounded-3xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/10 rounded-full blur-[80px] pointer-events-none -z-0" />
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-flex bg-white/10 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest text-brand-green mb-3">
                      Latest Payslip
                    </span>
                    <CardTitle className="text-2xl font-display uppercase tracking-tight text-white">
                      {latestPayslip ? `Month: ${latestPayslip.month}` : "No Payslip Generated"}
                    </CardTitle>
                    <CardDescription className="text-xs text-white/50">
                      {latestPayslip
                        ? `Calculated on ${new Date(latestPayslip.createdAt).toLocaleDateString()}`
                        : "Your payslips will appear here once configured by the Admin."}
                    </CardDescription>
                  </div>
                  {latestPayslip && (
                    <Button
                      onClick={() => handlePrintPayslip(latestPayslip.id)}
                      size="sm"
                      className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full flex items-center gap-1.5 px-4 h-10 cursor-none"
                    >
                      <Printer className="h-4 w-4" />
                      Print / PDF
                    </Button>
                  )}
                </div>
              </CardHeader>
              {latestPayslip && (
                <CardContent className="grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">Gross Earnings</span>
                    <span className="text-xl font-bold mt-1 block">₹{latestPayslip.grossSalary.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-white/40">Deductions</span>
                    <span className="text-xl font-bold mt-1 block text-red-400">₹{latestPayslip.totalDeductions.toLocaleString()}</span>
                  </div>
                  <div className="border-l border-white/10 pl-6">
                    <span className="text-[10px] uppercase tracking-wider text-brand-green">Net Take Home</span>
                    <span className="text-2xl font-bold mt-1 block text-brand-green">₹{latestPayslip.netSalary.toLocaleString()}</span>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Base Salary Structure Details */}
            <Card className="bg-white/50 backdrop-blur-xl border border-brand-border shadow-md rounded-3xl overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-brand-green" />
                  Your Salary Structure
                </CardTitle>
                <CardDescription className="text-xs">
                  Your base salary configuration. Attendance-based earnings scale with check-ins.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-brand-border bg-gray-50/50">
                        <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider">Salary Component</th>
                        <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider">Type</th>
                        <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider text-center">Attendance Based</th>
                        <th className="p-4 font-semibold text-brand-text/50 uppercase tracking-wider text-right">Base Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryComponents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-6 text-center text-brand-text/40">
                            No salary components configured yet.
                          </td>
                        </tr>
                      ) : (
                        salaryComponents.map((comp) => (
                          <tr key={comp.id} className="border-b border-brand-border hover:bg-white/40 transition-colors">
                            <td className="p-4 font-medium text-brand-text">{comp.name}</td>
                            <td className="p-4">
                              <Badge
                                variant="outline"
                                className={
                                  comp.type === "earning"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }
                              >
                                {comp.type}
                              </Badge>
                            </td>
                            <td className="p-4 text-center">
                              {comp.attendanceBased ? (
                                <Badge className="bg-brand-green/10 text-brand-green hover:bg-brand-green/20">Yes</Badge>
                              ) : (
                                <Badge variant="outline" className="text-brand-text/40 border-brand-border">No</Badge>
                              )}
                            </td>
                            <td className="p-4 text-right font-semibold text-brand-text">
                              ₹{comp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Attendance History & Payslip Archive (Tabs/Collapsible) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Attendance Log Card */}
              <Card className="bg-white/50 backdrop-blur-xl border border-brand-border shadow-md rounded-3xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Calendar className="h-4.5 w-4.5 text-brand-green" />
                    Attendance History
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Detailed logs for the current month.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto px-0">
                  <div className="divide-y divide-brand-border">
                    {attendanceLogs.length === 0 ? (
                      <div className="p-6 text-center text-brand-text/40 text-xs">
                        No logs for this month.
                      </div>
                    ) : (
                      attendanceLogs.map((log) => (
                        <div key={log.id} className="flex justify-between items-center p-4 hover:bg-white/30 transition-colors text-xs">
                          <div>
                            <span className="font-semibold text-brand-text">{new Date(log.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="text-[10px] text-brand-text/40 block mt-0.5">Checked in at {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <Badge
                            className={
                              log.status === "present"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : log.status === "late"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {log.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Payslip Archive Card */}
              <Card className="bg-white/50 backdrop-blur-xl border border-brand-border shadow-md rounded-3xl overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Download className="h-4.5 w-4.5 text-brand-green" />
                    Payslip Archive
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Download and review previous monthly payslips.
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto px-0">
                  <div className="divide-y divide-brand-border">
                    {payslips.length === 0 ? (
                      <div className="p-6 text-center text-brand-text/40 text-xs">
                        No payslips generated yet.
                      </div>
                    ) : (
                      payslips.map((pay) => (
                        <div key={pay.id} className="flex justify-between items-center p-4 hover:bg-white/30 transition-colors text-xs">
                          <div>
                            <span className="font-semibold text-brand-text">Month: {pay.month}</span>
                            <span className="text-[10px] text-brand-green block mt-0.5 font-semibold">Net Take-Home: ₹{pay.netSalary.toLocaleString()}</span>
                          </div>
                          <Button
                            onClick={() => handlePrintPayslip(pay.id)}
                            variant="ghost"
                            size="sm"
                            className="text-brand-green hover:bg-brand-green/10 rounded-full h-8 px-3 flex items-center gap-1 cursor-none"
                          >
                            <Printer className="h-3.5 w-3.5" />
                            View
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

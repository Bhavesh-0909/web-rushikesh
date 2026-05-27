"use server"

import { prisma } from "./prisma"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

// Utility to get number of days in a month
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Utility to convert Prisma Decimal to number
function toNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  return typeof val === "number" ? val : parseFloat(val.toString());
}

export async function fallbackSignUp(data: {
  fullName: string
  email: string
  phone: string
  employeeId: string
  role: string
}) {
  try {
    // Check if employee ID or email already in use
    const existing = await prisma.employee_profiles.findFirst({
      where: {
        OR: [
          { employee_id: data.employeeId },
          { email: data.email }
        ]
      }
    })

    if (existing) {
      return { success: false, error: "Email or Employee ID already in use." }
    }

    // Generate random UUID
    const authUserId = "11111111-2222-3333-4444-555555555555".replace(/[12345]/g, () =>
      Math.floor(Math.random() * 16).toString(16)
    )

    // Insert dummy user in auth.users using parameterized query
    // This automatically fires the on_auth_user_created trigger, creating the employee_profile!
    const metadata = JSON.stringify({
      full_name: data.fullName,
      phone: data.phone,
      employee_id: data.employeeId,
      role: data.role
    })

    await prisma.$executeRaw`
      INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, role, aud, email_confirmed_at, created_at, updated_at)
      VALUES (${authUserId}::uuid, ${data.email}, '', ${metadata}::jsonb, 'authenticated', 'authenticated', now(), now(), now())
    `

    // Retrieve the profile automatically created by the trigger
    const profile = await prisma.employee_profiles.findUnique({
      where: { auth_user_id: authUserId }
    })

    return { success: true, profile }
  } catch (error: any) {
    console.error("Error in fallbackSignUp:", error)
    return { success: false, error: error.message }
  }
}

export async function fallbackSignIn(email: string) {
  try {
    const profile = await prisma.employee_profiles.findFirst({
      where: { email },
    })

    if (!profile) {
      return { success: false, error: "Employee profile not found. Please Sign Up." }
    }

    if (profile.disabled) {
      return { success: false, error: "Employee account disabled. Please contact Admin." }
    }

    // Set employee session cookie
    const cookieStore = await cookies()
    cookieStore.set("employee_session", profile.auth_user_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/"
    })

    return { success: true, profile }
  } catch (error: any) {
    console.error("Error in fallbackSignIn:", error)
    return { success: false, error: error.message }
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("employee_session")?.value

    if (!session) return { success: false, error: "Not logged in" }

    const profile = await prisma.employee_profiles.findUnique({
      where: { auth_user_id: session },
    })

    if (!profile) return { success: false, error: "Profile not found" }

    return { success: true, profile }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("employee_session")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}


export async function getProfileByAuthId(authUserId: string) {
  try {
    const profile = await prisma.employee_profiles.findUnique({
      where: { auth_user_id: authUserId },
    });
    return { success: true, profile };
  } catch (error: any) {
    console.error("Error in getProfileByAuthId:", error);
    return { success: false, error: error.message };
  }
}

export async function getProfileById(id: number) {
  try {
    const profile = await prisma.employee_profiles.findUnique({
      where: { id },
    });
    return { success: true, profile };
  } catch (error: any) {
    console.error("Error in getProfileById:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllProfiles() {
  try {
    const profiles = await prisma.employee_profiles.findMany({
      orderBy: { created_at: "desc" },
    });
    return { success: true, profiles };
  } catch (error: any) {
    console.error("Error in getAllProfiles:", error);
    return { success: false, error: error.message };
  }
}

export async function updateProfileStatus(profileId: number, status: "pending" | "approved" | "rejected") {
  try {
    const profile = await prisma.employee_profiles.update({
      where: { id: profileId },
      data: { approval_status: status },
    });

    // Seed empty salary structure components for approved employees
    if (status === "approved") {
      const components = await prisma.salary_components.findMany();
      for (const comp of components) {
        await prisma.employee_salary_structure.upsert({
          where: {
            employee_profile_id_component_id: {
              employee_profile_id: profileId,
              component_id: comp.id,
            },
          },
          update: {},
          create: {
            employee_profile_id: profileId,
            component_id: comp.id,
            amount: 0.00,
          },
        });
      }
    }

    revalidatePath("/youcantseeme");
    return { success: true, profile };
  } catch (error: any) {
    console.error("Error in updateProfileStatus:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleProfileDisabled(profileId: number, disabled: boolean) {
  try {
    const profile = await prisma.employee_profiles.update({
      where: { id: profileId },
      data: { disabled },
    });
    revalidatePath("/youcantseeme");
    return { success: true, profile };
  } catch (error: any) {
    console.error("Error in toggleProfileDisabled:", error);
    return { success: false, error: error.message };
  }
}

export async function getSalaryStructure(profileId: number) {
  try {
    // Self-healing check: ensure all active salary components exist in this profile's structure
    const components = await prisma.salary_components.findMany();
    for (const comp of components) {
      await prisma.employee_salary_structure.upsert({
        where: {
          employee_profile_id_component_id: {
            employee_profile_id: profileId,
            component_id: comp.id,
          },
        },
        update: {},
        create: {
          employee_profile_id: profileId,
          component_id: comp.id,
          amount: 0.00,
        },
      });
    }

    const structure = await prisma.employee_salary_structure.findMany({
      where: { employee_profile_id: profileId },
      include: { salary_component: true },
      orderBy: { salary_component: { id: "asc" } }
    });

    const formatted = structure.map((item: any) => ({
      id: item.id,
      componentId: item.component_id,
      name: item.salary_component.name,
      type: item.salary_component.type,
      attendanceBased: item.salary_component.attendance_based,
      amount: toNumber(item.amount),
    }));

    return { success: true, structure: formatted };
  } catch (error: any) {
    console.error("Error in getSalaryStructure:", error);
    return { success: false, error: error.message };
  }
}

export async function addSalaryComponent(name: string, type: "earning" | "deduction", attendanceBased: boolean) {
  try {
    const existing = await prisma.salary_components.findUnique({
      where: { name }
    })

    if (existing) {
      return { success: false, error: "A component with this name already exists." }
    }

    const component = await prisma.salary_components.create({
      data: {
        name,
        type,
        attendance_based: attendanceBased
      }
    })

    revalidatePath("/youcantseeme")
    return { success: true, component }
  } catch (error: any) {
    console.error("Error in addSalaryComponent:", error)
    return { success: false, error: error.message }
  }
}

export async function updateSalaryStructure(profileId: number, updates: { componentId: number; amount: number }[]) {
  try {
    for (const update of updates) {
      await prisma.employee_salary_structure.upsert({
        where: {
          employee_profile_id_component_id: {
            employee_profile_id: profileId,
            component_id: update.componentId,
          },
        },
        update: { amount: update.amount, updated_at: new Date() },
        create: {
          employee_profile_id: profileId,
          component_id: update.componentId,
          amount: update.amount,
        },
      });
    }
    revalidatePath("/youcantseeme");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateSalaryStructure:", error);
    return { success: false, error: error.message };
  }
}

export async function markAttendance(profileId: number, status = "present", customDate?: string) {
  try {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000; // local offset
    const dateObj = customDate ? new Date(customDate) : new Date(Date.now() - tzOffset);
    const dateStr = dateObj.toISOString().split("T")[0];
    const dateFormatted = new Date(dateStr);

    // Check if attendance already marked for this date
    const existing = await prisma.attendance_records.findUnique({
      where: {
        employee_profile_id_date: {
          employee_profile_id: profileId,
          date: dateFormatted,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Attendance already marked for today." };
    }

    const record = await prisma.attendance_records.create({
      data: {
        employee_profile_id: profileId,
        date: dateFormatted,
        status,
        check_in_time: new Date(),
      },
    });

    revalidatePath("/employee/dashboard");
    return { success: true, record };
  } catch (error: any) {
    console.error("Error in markAttendance:", error);
    return { success: false, error: error.message };
  }
}

export async function getAttendanceHistory(profileId: number, year: number, month: number) {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const records = await prisma.attendance_records.findMany({
      where: {
        employee_profile_id: profileId,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: { date: "asc" },
    });

    const formatted = records.map((r: any) => ({
      id: r.id,
      date: r.date.toISOString().split("T")[0],
      checkInTime: r.check_in_time,
      status: r.status,
    }));

    return { success: true, records: formatted };
  } catch (error: any) {
    console.error("Error in getAttendanceHistory:", error);
    return { success: false, error: error.message };
  }
}

export async function getAttendanceForAdmin(dateStr: string) {
  try {
    const targetDate = new Date(dateStr);
    const records = await prisma.attendance_records.findMany({
      where: { date: targetDate },
    });
    return { success: true, records };
  } catch (error: any) {
    console.error("Error in getAttendanceForAdmin:", error);
    return { success: false, error: error.message };
  }
}

export async function adminMarkAttendance(profileId: number, dateStr: string, status: string) {
  try {
    const targetDate = new Date(dateStr);

    if (status === "delete") {
      await prisma.attendance_records.deleteMany({
        where: {
          employee_profile_id: profileId,
          date: targetDate,
        },
      });
      revalidatePath("/youcantseeme");
      return { success: true, message: "Attendance deleted." };
    }

    const record = await prisma.attendance_records.upsert({
      where: {
        employee_profile_id_date: {
          employee_profile_id: profileId,
          date: targetDate,
        },
      },
      update: { status, check_in_time: new Date() },
      create: {
        employee_profile_id: profileId,
        date: targetDate,
        status,
        check_in_time: new Date(),
      },
    });

    revalidatePath("/youcantseeme");
    return { success: true, record };
  } catch (error: any) {
    console.error("Error in adminMarkAttendance:", error);
    return { success: false, error: error.message };
  }
}

export async function generatePayslipForMonth(profileId: number, year: number, month: number) {
  try {
    // 1. Calculate calendar days in selected month
    const totalWorkingDays = getDaysInMonth(year, month);
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // 2. Fetch all present records
    const attendance = await prisma.attendance_records.findMany({
      where: {
        employee_profile_id: profileId,
        date: { gte: startDate, lt: endDate },
      },
    });

    let presentDays = 0;
    attendance.forEach((record: any) => {
      if (record.status === "present" || record.status === "late") {
        presentDays += 1;
      } else if (record.status === "half_day") {
        presentDays += 0.5;
      }
    });

    // 3. Fetch salary structures & components
    const structures = await prisma.employee_salary_structure.findMany({
      where: { employee_profile_id: profileId },
      include: { salary_component: true },
    });

    let basicSalary = 0;
    let hra = 0;
    let travelAllowance = 0;
    let bonus = 0;
    let pfDeduction = 0;
    let taxDeduction = 0;
    let otherEarnings = 0;
    let otherDeductions = 0;
    const customComponents: { [key: string]: { amount: number; calculated: number; type: string; attendanceBased: boolean } } = {};

    structures.forEach((item: any) => {
      const amount = toNumber(item.amount);
      const isAttendanceBased = item.salary_component.attendance_based;
      const compName = item.salary_component.name;
      const compType = item.salary_component.type;

      // Calculate component amount
      const calculatedAmount = isAttendanceBased
        ? parseFloat((amount * (presentDays / totalWorkingDays)).toFixed(2))
        : amount;

      if (compName === "Basic Salary") {
        basicSalary = calculatedAmount;
      } else if (compName === "HRA") {
        hra = calculatedAmount;
      } else if (compName === "Travel Allowance") {
        travelAllowance = calculatedAmount;
      } else if (compName === "Bonus") {
        bonus = calculatedAmount;
      } else if (compName === "PF Deduction") {
        pfDeduction = calculatedAmount;
      } else if (compName === "Tax Deduction") {
        taxDeduction = calculatedAmount;
      } else {
        if (compType === "earning") {
          otherEarnings += calculatedAmount;
        } else {
          otherDeductions += calculatedAmount;
        }
        customComponents[compName] = {
          amount,
          calculated: calculatedAmount,
          type: compType,
          attendanceBased: isAttendanceBased,
        };
      }
    });

    const grossSalary = parseFloat((basicSalary + hra + travelAllowance + bonus + otherEarnings).toFixed(2));
    const totalDeductions = parseFloat((pfDeduction + taxDeduction + otherDeductions).toFixed(2));
    const netSalary = parseFloat((grossSalary - totalDeductions).toFixed(2));

    const payslip = await prisma.payslips.upsert({
      where: {
        employee_profile_id_month: {
          employee_profile_id: profileId,
          month: monthStr,
        },
      },
      update: {
        basic_salary: basicSalary,
        hra,
        travel_allowance: travelAllowance,
        bonus,
        pf_deduction: pfDeduction,
        tax_deduction: taxDeduction,
        other_earnings: otherEarnings,
        other_deductions: otherDeductions,
        custom_components: customComponents,
        total_present_days: Math.round(presentDays * 10) / 10,
        total_working_days: totalWorkingDays,
        gross_salary: grossSalary,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        updated_at: new Date(),
      },
      create: {
        employee_profile_id: profileId,
        month: monthStr,
        basic_salary: basicSalary,
        hra,
        travel_allowance: travelAllowance,
        bonus,
        pf_deduction: pfDeduction,
        tax_deduction: taxDeduction,
        other_earnings: otherEarnings,
        other_deductions: otherDeductions,
        custom_components: customComponents,
        total_present_days: Math.round(presentDays * 10) / 10,
        total_working_days: totalWorkingDays,
        gross_salary: grossSalary,
        total_deductions: totalDeductions,
        net_salary: netSalary,
      },
    });

    return { success: true, payslip };
  } catch (error: any) {
    console.error("Error in generatePayslipForMonth:", error);
    return { success: false, error: error.message };
  }
}

export async function generateAllPayslipsForMonth(year: number, month: number) {
  try {
    const approvedEmployees = await prisma.employee_profiles.findMany({
      where: { approval_status: "approved", disabled: false },
    });

    const results = [];
    for (const emp of approvedEmployees) {
      const res = await generatePayslipForMonth(emp.id, year, month);
      results.push({ employeeId: emp.employee_id, success: res.success, error: res.error });
    }

    revalidatePath("/youcantseeme");
    return { success: true, results };
  } catch (error: any) {
    console.error("Error in generateAllPayslipsForMonth:", error);
    return { success: false, error: error.message };
  }
}

export async function getPayslipHistory(profileId: number) {
  try {
    const payslips = await prisma.payslips.findMany({
      where: { employee_profile_id: profileId },
      orderBy: { month: "desc" },
    });

    const formatted = payslips.map((p: any) => ({
      id: p.id,
      month: p.month,
      basicSalary: toNumber(p.basic_salary),
      hra: toNumber(p.hra),
      travelAllowance: toNumber(p.travel_allowance),
      bonus: toNumber(p.bonus),
      pfDeduction: toNumber(p.pf_deduction),
      taxDeduction: toNumber(p.tax_deduction),
      otherEarnings: toNumber(p.other_earnings),
      otherDeductions: toNumber(p.other_deductions),
      customComponents: p.custom_components,
      totalPresentDays: p.total_present_days,
      totalWorkingDays: p.total_working_days,
      grossSalary: toNumber(p.gross_salary),
      totalDeductions: toNumber(p.total_deductions),
      netSalary: toNumber(p.net_salary),
      createdAt: p.created_at,
    }));

    return { success: true, payslips: formatted };
  } catch (error: any) {
    console.error("Error in getPayslipHistory:", error);
    return { success: false, error: error.message };
  }
}

export async function getPayslipById(id: number) {
  try {
    const payslip = await prisma.payslips.findUnique({
      where: { id },
      include: { employee_profile: true },
    });

    if (!payslip) return { success: false, error: "Payslip not found." };

    const formatted = {
      id: payslip.id,
      month: payslip.month,
      basicSalary: toNumber(payslip.basic_salary),
      hra: toNumber(payslip.hra),
      travelAllowance: toNumber(payslip.travel_allowance),
      bonus: toNumber(payslip.bonus),
      pfDeduction: toNumber(payslip.pf_deduction),
      taxDeduction: toNumber(payslip.tax_deduction),
      otherEarnings: toNumber(payslip.other_earnings),
      otherDeductions: toNumber(payslip.other_deductions),
      customComponents: payslip.custom_components,
      totalPresentDays: payslip.total_present_days,
      totalWorkingDays: payslip.total_working_days,
      grossSalary: toNumber(payslip.gross_salary),
      totalDeductions: toNumber(payslip.total_deductions),
      netSalary: toNumber(payslip.net_salary),
      createdAt: payslip.created_at,
      employee: payslip.employee_profile,
    };

    return { success: true, payslip: formatted };
  } catch (error: any) {
    console.error("Error in getPayslipById:", error);
    return { success: false, error: error.message };
  }
}

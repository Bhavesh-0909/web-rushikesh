"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getPayslipById } from "@/lib/employee-db"
import { Printer, XCircle, ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function PrintablePayslipPage({ params }: { params: any }) {
  const router = useRouter()
  const [payslipId, setPayslipId] = useState<number | null>(null)
  const [payslip, setPayslip] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfLibraryLoaded, setPdfLibraryLoaded] = useState(false)

  useEffect(() => {
    // Dynamically load html2pdf.js from CDN to enable direct local PDF downloads
    if (typeof window !== "undefined") {
      const script = document.createElement("script")
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
      script.async = true
      script.onload = () => setPdfLibraryLoaded(true)
      document.body.appendChild(script)
      return () => {
        document.body.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    async function unwrapParams() {
      try {
        const resolved = await params
        if (resolved && resolved.id) {
          setPayslipId(parseInt(resolved.id))
        } else {
          setError("Payslip ID is missing in request.")
          setLoading(false)
        }
      } catch (err) {
        console.error("Failed to unwrap params:", err)
        setError("Invalid request parameters.")
        setLoading(false)
      }
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    if (payslipId !== null) {
      fetchPayslip(payslipId)
    }
  }, [payslipId])

  const fetchPayslip = async (id: number) => {
    try {
      setLoading(true)
      const res = await getPayslipById(id)
      if (res.success && res.payslip) {
        setPayslip(res.payslip)
      } else {
        setError(res.error || "Failed to load payslip.")
      }
    } catch (err: any) {
      console.error(err)
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    const element = document.getElementById("payslip-sheet")
    if (!element) {
      toast.error("Payslip sheet not found.")
      return
    }

    if (typeof window !== "undefined" && (window as any).html2pdf) {
      const opt = {
        margin: 15,
        filename: `payslip-${payslip.employee.full_name.replace(/\s+/g, "_")}-${payslip.month}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      const toastId = toast.loading("Preparing document styles...")

      const replaceColorFunctions = (cssText: string) => {
        const lower = cssText.toLowerCase();
        if (!lower.includes('oklch(') && !lower.includes('lab(')) {
          return cssText;
        }
        
        let result = '';
        let i = 0;
        const len = cssText.length;
        while (i < len) {
          const isOklch = cssText.substr(i, 6).toLowerCase() === 'oklch(';
          const isLab = !isOklch && cssText.substr(i, 4).toLowerCase() === 'lab(';
          
          if (isOklch || isLab) {
            i += isOklch ? 6 : 4;
            let depth = 1;
            while (i < len && depth > 0) {
              if (cssText[i] === '(') depth++;
              else if (cssText[i] === ')') depth--;
              i++;
            }
            result += '#111827';
          } else {
            result += cssText[i];
            i++;
          }
        }
        return result;
      };

      // Select all style and link tags
      const styleElements = Array.from(document.querySelectorAll('style'));
      const linkElements = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];

      const disabledElements: { el: HTMLStyleElement | HTMLLinkElement; wasDisabled: boolean }[] = [];
      let combinedCss = '';

      // 1. Gather all style tag contents and mark them for disabling
      styleElements.forEach(styleEl => {
        disabledElements.push({ el: styleEl, wasDisabled: styleEl.disabled });
        combinedCss += (styleEl.textContent || '') + '\n';
      });

      // 2. Fetch local linked stylesheet contents and mark them for disabling
      for (const linkEl of linkElements) {
        const href = linkEl.getAttribute('href');
        if (href) {
          const isRelative = href.startsWith('/') || href.startsWith('.');
          const isSameOrigin = href.startsWith(window.location.origin);
          if (isRelative || isSameOrigin) {
            try {
              const response = await fetch(href);
              if (response.ok) {
                const text = await response.text();
                combinedCss += text + '\n';
                disabledElements.push({ el: linkEl, wasDisabled: linkEl.disabled });
              }
            } catch (err) {
              console.warn(`Could not fetch stylesheet: ${href}`, err);
            }
          }
        }
      }

      // 3. Sanitize the combined CSS
      toast.loading("Generating PDF download...", { id: toastId });
      const sanitizedCss = replaceColorFunctions(combinedCss);

      // 4. Inject temporary style element with sanitized CSS
      const tempStyleEl = document.createElement('style');
      tempStyleEl.id = 'temp-pdf-sanitized-styles';
      tempStyleEl.textContent = sanitizedCss;
      document.head.appendChild(tempStyleEl);

      // 5. Disable all matching style and link elements so html2canvas doesn't read them
      disabledElements.forEach(({ el }) => {
        el.disabled = true;
      });

      const restoreOriginalState = () => {
        // Re-enable all original style and link elements
        disabledElements.forEach(({ el, wasDisabled }) => {
          el.disabled = wasDisabled;
        });
        // Remove the temporary style element
        const temp = document.getElementById('temp-pdf-sanitized-styles');
        if (temp) {
          temp.remove();
        }
      };

      try {
        await (window as any).html2pdf().from(element).set(opt).save();
        toast.dismiss(toastId);
        toast.success("PDF downloaded successfully!");
      } catch (err: any) {
        toast.dismiss(toastId);
        toast.error("Failed to generate PDF.");
        console.error(err);
      } finally {
        restoreOriginalState();
      }
    } else {
      toast.error("PDF generation library is still loading. Please try again in a moment.");
    }
  }

  if (loading || payslipId === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 print:hidden">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green mx-auto" />
          <p className="text-xs uppercase tracking-widest text-gray-400">Preparing Document...</p>
        </div>
      </div>
    )
  }

  if (error || !payslip) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 print:hidden">
        <div className="max-w-md text-center space-y-4">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">Error Generating Payslip</h2>
          <p className="text-sm text-gray-500">{error || "Document not found."}</p>
          <Button onClick={() => window.close()} className="rounded-full bg-brand-text text-white">
            Close Window
          </Button>
        </div>
      </div>
    )
  }

  const customComponentsList = payslip.customComponents ? Object.entries(payslip.customComponents).map(([name, detail]: any) => ({
    name,
    amount: detail.amount,
    calculated: detail.calculated,
    type: detail.type,
    attendanceBased: detail.attendanceBased
  })) : [];

  const earnings = [
    { name: "Basic Salary", amount: payslip.basicSalary, isCustom: false },
    { name: "HRA", amount: payslip.hra, isCustom: false },
    { name: "Travel Allowance", amount: payslip.travelAllowance, isCustom: false },
    { name: "Bonus", amount: payslip.bonus, isCustom: false },
    ...customComponentsList.filter(c => c.type === "earning").map(c => ({ name: c.name, amount: c.calculated, isCustom: true }))
  ].filter(e => e.amount > 0);

  const deductions = [
    { name: "PF Deduction", amount: payslip.pfDeduction, isCustom: false },
    { name: "Tax Deduction", amount: payslip.taxDeduction, isCustom: false },
    ...customComponentsList.filter(c => c.type === "deduction").map(c => ({ name: c.name, amount: c.calculated, isCustom: true }))
  ].filter(d => d.amount > 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6 print:bg-white print:py-0 print:px-0">
      
      {/* Control Bar (Hidden on Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Button onClick={() => window.close()} variant="outline" size="sm" className="rounded-full flex items-center gap-1 cursor-none">
            <ArrowLeft className="h-4 w-4" />
            Close Portal
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleDownloadPDF} className="bg-brand-green hover:bg-brand-green/90 text-white rounded-full flex items-center gap-2 px-6 cursor-none">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Payslip Document Sheet */}
      <div 
        id="payslip-sheet" 
        className="max-w-4xl mx-auto bg-white p-8 md:p-12 border border-gray-200 shadow-lg print:border-none print:shadow-none print:p-0 font-sans text-gray-800 leading-relaxed"
        style={{
          backgroundColor: '#ffffff',
          color: '#1f2937',
          borderColor: '#e5e7eb',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        
        {/* Header Section */}
        <div 
          className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8"
          style={{ borderBottom: '2px solid #f3f4f6' }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <img src="/logo.png" alt="Company Logo" className="w-[60px] h-[60px]" />
              <div>
                <h1 
                  className="text-2xl font-bold uppercase tracking-wider text-gray-900 leading-none"
                  style={{ color: '#111827' }}
                >
                  Rushikesh Sutar
                </h1>
                <p 
                  className="text-xs uppercase tracking-[0.2em] font-semibold text-brand-green mt-1"
                  style={{ color: '#28977b' }}
                >
                  & Associates
                </p>
              </div>
            </div>
            <p 
              className="text-xs text-gray-500 leading-normal max-w-xs mt-3"
              style={{ color: '#6b7280' }}
            >
              Oracle Business Park, Thane West, Mumbai, India &bull; info@rsandassociates.co.in
            </p>
          </div>
          <div className="text-right">
            <h2 
              className="text-2xl font-bold text-gray-900 uppercase tracking-tight"
              style={{ color: '#111827' }}
            >
              PAYSLIP
            </h2>
            <div 
              className="bg-brand-green/10 border border-brand-green/20 rounded-xl px-4 py-2 mt-3 inline-block"
              style={{
                backgroundColor: '#e9f5f2',
                border: '1px solid #d4ede5',
                borderRadius: '0.75rem'
              }}
            >
              <span 
                className="text-[10px] uppercase font-semibold text-brand-green tracking-wider block"
                style={{ color: '#28977b' }}
              >
                Pay Period
              </span>
              <span 
                className="text-sm font-bold text-gray-900"
                style={{ color: '#111827' }}
              >
                {payslip.month}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid (Employee & Attendance) */}
        <div 
          className="grid grid-cols-2 gap-8 border-b border-gray-100 pb-8 mb-8 text-xs"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          
          {/* Employee details */}
          <div className="space-y-3">
            <h3 
              className="font-bold text-gray-900 uppercase tracking-wider text-[10px] border-b pb-1"
              style={{ color: '#111827', borderBottom: '1px solid #e5e7eb' }}
            >
              Employee Details
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-400 font-semibold" style={{ color: '#9ca3af' }}>Name:</span>
              <span className="col-span-2 font-bold text-gray-900" style={{ color: '#111827' }}>{payslip.employee.full_name}</span>
              
              <span className="text-gray-400 font-semibold" style={{ color: '#9ca3af' }}>Employee ID:</span>
              <span className="col-span-2 font-mono text-gray-900" style={{ color: '#111827' }}>{payslip.employee.employee_id}</span>
              
              <span className="text-gray-400 font-semibold" style={{ color: '#9ca3af' }}>Role/Position:</span>
              <span className="col-span-2 text-gray-900" style={{ color: '#111827' }}>{payslip.employee.role}</span>
              
              <span className="text-gray-400 font-semibold" style={{ color: '#9ca3af' }}>Email:</span>
              <span className="col-span-2 text-gray-900" style={{ color: '#111827' }}>{payslip.employee.email}</span>
            </div>
          </div>

          {/* Attendance breakdown */}
          <div className="space-y-3">
            <h3 
              className="font-bold text-gray-900 uppercase tracking-wider text-[10px] border-b pb-1"
              style={{ color: '#111827', borderBottom: '1px solid #e5e7eb' }}
            >
              Attendance Summary
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-400 font-semibold" style={{ color: '#9ca3af' }}>Total Days in Month:</span>
              <span className="col-span-2 text-gray-900 font-semibold" style={{ color: '#111827' }}>{payslip.totalWorkingDays} days</span>
              
              <span className="text-gray-400 font-semibold" style={{ color: '#9ca3af' }}>Present Days:</span>
              <span className="col-span-2 text-gray-900 font-semibold" style={{ color: '#111827' }}>{payslip.totalPresentDays} days</span>
              
              <span className="text-gray-400 font-semibold" style={{ color: '#9ca3af' }}>Attendance Rate:</span>
              <span className="col-span-2 font-bold text-brand-green" style={{ color: '#28977b' }}>
                {((payslip.totalPresentDays / payslip.totalWorkingDays) * 100).toFixed(1)}%
              </span>
            </div>
          </div>

        </div>

        {/* Salary breakdown table */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          
          {/* Earnings column */}
          <div className="space-y-3">
            <h3 
              className="font-bold text-gray-900 uppercase tracking-wider text-[10px] bg-gray-50 p-2 border-b"
              style={{ color: '#111827', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}
            >
              Earnings (A)
            </h3>
            <div className="text-xs">
              {earnings.map((e, idx) => (
                <div 
                  key={idx} 
                  className="flex justify-between py-2.5 border-b border-gray-100"
                  style={{ borderBottom: '1px solid #f3f4f6' }}
                >
                  <span className="font-medium text-gray-700" style={{ color: '#374151' }}>{e.name}</span>
                  <span className="font-bold text-gray-900" style={{ color: '#111827' }}>₹{e.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deductions column */}
          <div className="space-y-3">
            <h3 
              className="font-bold text-gray-900 uppercase tracking-wider text-[10px] bg-gray-50 p-2 border-b"
              style={{ color: '#111827', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}
            >
              Deductions (B)
            </h3>
            <div className="text-xs">
              {deductions.length === 0 ? (
                <div className="py-6 text-center text-gray-400 italic" style={{ color: '#9ca3af' }}>No deductions registered.</div>
              ) : (
                deductions.map((d, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between py-2.5 border-b border-gray-100"
                    style={{ borderBottom: '1px solid #f3f4f6' }}
                  >
                    <span className="font-medium text-gray-700" style={{ color: '#374151' }}>{d.name}</span>
                    <span className="font-bold text-red-600" style={{ color: '#dc2626' }}>₹{d.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Totals Summary */}
        <div 
          className="py-6 mb-12 grid grid-cols-3 gap-6 text-xs text-center"
          style={{
            borderTop: '2px solid #f3f4f6',
            borderBottom: '2px solid #f3f4f6',
          }}
        >
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider" style={{ color: '#9ca3af' }}>Gross Earnings (A)</span>
            <span className="text-lg font-bold text-gray-950 block mt-1" style={{ color: '#030712' }}>₹{payslip.grossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider" style={{ color: '#9ca3af' }}>Total Deductions (B)</span>
            <span className="text-lg font-bold text-red-600 block mt-1" style={{ color: '#dc2626' }}>₹{payslip.totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div 
            className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-3"
            style={{
              backgroundColor: '#f4faf8',
              border: '1px solid #d4ede5',
              borderRadius: '0.75rem'
            }}
          >
            <span className="text-[10px] uppercase font-bold text-brand-green tracking-wider" style={{ color: '#28977b' }}>Net Take-Home Pay (A - B)</span>
            <span className="text-xl font-bold text-brand-green block mt-1" style={{ color: '#28977b' }}>₹{payslip.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Signature & Note Section */}
        <div className="grid grid-cols-2 gap-12 pt-8 text-xs">
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[9px] mb-8" style={{ color: '#111827' }}>Employee Signature</h4>
            <div 
              className="border-t border-gray-300 w-48 pt-2 text-gray-400 font-semibold"
              style={{ borderTop: '1px solid #d1d5db', color: '#9ca3af' }}
            >
              Date: _________________
            </div>
          </div>
          <div className="text-right">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[9px] mb-8" style={{ color: '#111827' }}>Authorized Signatory</h4>
            <div className="inline-block text-left">
              <div 
                className="h-10 text-right italic font-semibold text-brand-green mb-1 font-display"
                style={{ color: '#28977b' }}
              >
                Rushikesh Sutar
              </div>
              <div 
                className="border-t border-gray-300 w-48 pt-2 text-gray-400 font-semibold text-right"
                style={{ borderTop: '1px solid #d1d5db', color: '#9ca3af' }}
              >
                Principal Architect
              </div>
            </div>
          </div>
        </div>

        {/* Computer generated disclaimer */}
        <div 
          className="text-center text-[9px] text-gray-400 uppercase tracking-widest border-t border-gray-100 pt-8 mt-12"
          style={{ color: '#9ca3af', borderTop: '1px solid #f3f4f6' }}
        >
          This is a computer generated payslip and does not require a physical stamp.
        </div>

      </div>

    </div>
  )
}

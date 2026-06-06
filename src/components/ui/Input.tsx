// Import React untuk forwardRef, tipe input HTML, dan tipe ReactNode pada ikon.
import * as React from "react"
// Import utility project agar Input.tsx bisa menggabungkan class Tailwind atau format Rupiah dengan helper yang sama.
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

// Komponen Input meneruskan ref ke elemen HTML asli, jadi komponen lain tetap bisa mengakses elemennya.
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    // Input.tsx menampilkan elemen UI kecil yang dipakai ulang di dashboard.
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted z-10 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

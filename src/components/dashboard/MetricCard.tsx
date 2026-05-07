import React from "react";

interface MetricCardProps {
  title: string;
  amount: string;
  trend?: string;
  isPositive?: boolean;
  period: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "success" | "danger" | "info" | "warning";
}

export function MetricCard({ title, amount, trend, isPositive, period, icon: Icon, variant }: MetricCardProps) {
  const variantStyles = {
    success: { bg: "bg-success/10", text: "text-success", iconBg: "bg-success/20", iconColor: "text-success" },
    danger: { bg: "bg-danger/10", text: "text-danger", iconBg: "bg-danger/20", iconColor: "text-danger" },
    info: { bg: "bg-info/10", text: "text-info", iconBg: "bg-info/20", iconColor: "text-info" },
    warning: { bg: "bg-warning/10", text: "text-warning", iconBg: "bg-warning/20", iconColor: "text-warning" },
  };

  const style = variantStyles[variant];

  return (
    <div className="bg-surface rounded-xl p-6 border border-border shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${style.iconBg}`}>
          <Icon className={`w-6 h-6 ${style.iconColor}`} />
        </div>
      </div>
      
      <h3 className="text-sm font-medium text-text-secondary mb-1">{title}</h3>
      <div className="text-2xl font-bold text-text-primary mb-2 tabular-nums tracking-tight">{amount}</div>
      
      <div className="flex items-center text-xs mt-auto">
        {trend && (
          <span className={`px-2 py-0.5 rounded-full font-medium mr-2 ${isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {trend}
          </span>
        )}
        <span className="text-text-muted">{period}</span>
      </div>
    </div>
  );
}

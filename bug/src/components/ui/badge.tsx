import * as React from "react";
import "./badge.css";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClass = `badge-${variant}`;
  return (
    <div className={`badge ${variantClass} ${className || ''}`} {...props} />
  );
}

export { Badge };

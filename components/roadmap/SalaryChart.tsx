// ============================================================
// components/roadmap/SalaryChart.tsx
// ============================================================

"use client";

import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import type { SalaryProjection } from "@/types";

interface SalaryChartProps {
  projections: SalaryProjection[];
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(13,17,31,0.95)",
      border: "1px solid rgba(99,102,241,0.25)",
      borderRadius: 10,
      padding: "10px 14px",
      fontFamily: "var(--font-dm-sans, sans-serif)",
    }}>
      <p style={{ color: "#a5b4fc", fontSize: 12, marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: "#f0f4ff", fontSize: 13 }}>
          {p.dataKey === "minSalary" ? "Min" : "Max"}: ₹{p.value} LPA
        </p>
      ))}
    </div>
  );
};

export function SalaryChart({ projections }: SalaryChartProps) {
  if (!projections?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No salary data available
      </div>
    );
  }

  const data = projections.map((p) => ({
    name: p.label,
    minSalary: p.minSalary,
    maxSalary: p.maxSalary,
    role: p.role,
  }));

  return (
    <div className="salary-chart-wrap" style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="minGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#34D399" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#34D399" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v}L`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#6b7280", paddingTop: 12 }}
            formatter={(val) => val === "minSalary" ? "Min Salary" : "Max Salary"}
          />
          <Area type="monotone" dataKey="maxSalary" stroke="#6366f1" strokeWidth={2} fill="url(#maxGrad)" />
          <Area type="monotone" dataKey="minSalary" stroke="#34D399" strokeWidth={2} fill="url(#minGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

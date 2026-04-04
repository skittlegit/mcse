"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { day: string; price: number }[];
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-dark-card text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg">
      ${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}
    </div>
  );
}

export default function StockChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="chartGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00C896" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#00C896" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: "#7A8A99" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          orientation="right"
          tick={{ fontSize: 11, fill: "#7A8A99" }}
          axisLine={false}
          tickLine={false}
          width={52}
          domain={["dataMin - 50", "dataMax + 50"]}
          tickFormatter={(v: number) => `$${v}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#7A8A99", strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#00C896"
          strokeWidth={2.5}
          fill="url(#chartGreen)"
          dot={false}
          activeDot={{ r: 5, fill: "#00C896", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

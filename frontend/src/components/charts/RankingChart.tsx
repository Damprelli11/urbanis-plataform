import { useUrbanStore } from "@/store/useUrbanStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function RankingChart() {
  const { districts } = useUrbanStore();
  const top10 = districts.slice(0, 10);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={top10}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 30, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              dataKey="nm_dist"
              type="category"
              axisLine={false}
              tickLine={false}
              width={100}
              tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700, fontFamily: "JetBrains Mono" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{ 
                backgroundColor: "#16181B", 
                border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "8px",
                fontSize: "12px",
                fontFamily: "JetBrains Mono",
                boxShadow: "none"
              }}
              itemStyle={{ color: "#C0192B" }}
              formatter={(value: number) => [value.toFixed(1), "URBANSCORE"]}
            />
            <Bar
              dataKey="UrbanScore"
              fill="#C0192B"
              radius={[0, 2, 2, 0]}
              barSize={24}
              label={{ 
                position: 'right', 
                fill: "#f8fafc", 
                fontSize: 10, 
                fontFamily: "JetBrains Mono",
                formatter: (v: number) => v.toFixed(1) 
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { useUrbanStore } from "@/store/useUrbanStore";
import { SEGMENTS } from "@/config/segments";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export function CompositionChart() {
  const { selectedSegment } = useUrbanStore();
  const weights = SEGMENTS[selectedSegment];

  if (!weights) return null;

  const data = [
    { name: "INFRASTRUCTURE", value: (weights.infra.dens + weights.infra.mob) * weights.balance.infra * 100, color: "#334155" },
    { name: "MARKET POTENTIAL", value: (weights.market.central + weights.market.pop + weights.market.idade) * weights.balance.market * 100, color: "#C0192B" },
    { name: "RISK PROFILE", value: weights.alpha * 100, color: "#101113" }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={4}
              dataKey="value"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={1}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                backgroundColor: "#16181B", 
                border: "1px solid rgba(255,255,255,0.1)", 
                borderRadius: "8px",
                fontSize: "10px",
                fontFamily: "JetBrains Mono",
                boxShadow: "none"
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, "WEIGHT"]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="square"
              formatter={(value) => <span className="text-[10px] font-bold text-muted-foreground font-mono">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function ContextSwitchTaxChart({ data }) {
  return (
    <div style={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="developer" />

          <YAxis allowDecimals={false} />

          <Tooltip />

          <Bar
            dataKey="lostMinutes"
            name="Estimated Lost Minutes"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ContextSwitchTaxChart;
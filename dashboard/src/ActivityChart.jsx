import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer,
} from "recharts";

function ActivityChart({ data }) {
return (
<div style={{ width: "100%", height: 350 }}> <ResponsiveContainer width="100%" height="100%"> <LineChart data={data}> <CartesianGrid strokeDasharray="3 3" /> <XAxis dataKey="time" /> <YAxis allowDecimals={false} /> <Tooltip /> <Line
         type="monotone"
         dataKey="activity"
         stroke="#2563eb"
         strokeWidth={3}
       /> </LineChart> </ResponsiveContainer> </div>
);
}

export default ActivityChart;

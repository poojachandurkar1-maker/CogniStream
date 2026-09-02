import { Card, Metric, Text, Title } from "@tremor/react";

function DataSourceSummary({ data }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "18px",
        marginTop: "20px",
      }}
    >
      {data.map((source) => (
        <Card key={source.name}>
          <Text>{source.name}</Text>

          <Metric>{source.records}</Metric>

          <Text>
            Records ingested
          </Text>
        </Card>
      ))}
    </div>
  );
}

export default DataSourceSummary;
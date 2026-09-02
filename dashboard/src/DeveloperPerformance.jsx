import { Card, Metric, Text, Title } from "@tremor/react";

function DeveloperPerformance({ data }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "18px",
        marginTop: "20px",
      }}
    >
      {data.map((developer) => (
        <Card key={developer.name}>
          <Title>{developer.name}</Title>

          <Text style={{ marginTop: "10px" }}>
            Total Activity
          </Text>

          <Metric>{developer.activity}</Metric>

          <div style={{ marginTop: "16px" }}>
            <Text>
              Coding Time: {developer.codingMinutes} minutes
            </Text>

            <Text>
              Context Switches: {developer.switches}
            </Text>

            <Text>
              Estimated Lost Time: {developer.lostMinutes} minutes
            </Text>

            <Text>
              Status: <strong>{developer.status}</strong>
            </Text>
          </div>
        </Card>
      ))}
    </div>
  );
}

export default DeveloperPerformance;
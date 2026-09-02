import { Card, Metric, Text, Title } from "@tremor/react";

function App() {
  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <Title>CogniStream</Title>

      <Text>Developer Analytics Dashboard</Text>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <Card>
          <Text>Total Commits</Text>
          <Metric>3</Metric>
        </Card>

        <Card>
          <Text>IDE Hours</Text>
          <Metric>3</Metric>
        </Card>

        <Card>
          <Text>Slack Messages</Text>
          <Metric>3</Metric>
        </Card>
      </div>
    </main>
  );
}

export default App;
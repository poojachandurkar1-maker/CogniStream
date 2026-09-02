import { Card, Metric, Text, Title } from "@tremor/react";

function TeamHealthOverview({ data }) {
  const calculateFlowScore = (developer) => {
    const activityScore = Math.min(
      developer.activity * 15,
      30
    );

    const codingScore = Math.min(
      developer.codingMinutes / 2,
      30
    );

    const switchPenalty = Math.min(
      developer.switches * 7,
      25
    );

    const lostTimePenalty = Math.min(
      developer.lostMinutes * 1.5,
      15
    );

    const score = Math.round(
      activityScore +
        codingScore -
        switchPenalty -
        lostTimePenalty +
        50
    );

    return Math.max(0, Math.min(100, score));
  };

  if (!data || data.length === 0) {
    return (
      <Card style={{ marginTop: "20px" }}>
        <Title>Overall Team Health</Title>
        <Text style={{ marginTop: "10px" }}>
          No developer data available.
        </Text>
      </Card>
    );
  }

  const flowScores = data.map((developer) =>
    calculateFlowScore(developer)
  );

  const averageFlowScore = Math.round(
    flowScores.reduce((sum, score) => sum + score, 0) /
      flowScores.length
  );

  const totalSwitches = data.reduce(
    (sum, developer) => sum + developer.switches,
    0
  );

  const totalLostMinutes = data.reduce(
    (sum, developer) => sum + developer.lostMinutes,
    0
  );

  const totalCodingMinutes = data.reduce(
    (sum, developer) => sum + developer.codingMinutes,
    0
  );

  const activeDevelopers = data.length;

  const switchRate =
    totalCodingMinutes > 0
      ? totalSwitches / (totalCodingMinutes / 60)
      : 0;

  let cognitiveLoad = "Low";

  if (switchRate >= 4) {
    cognitiveLoad = "High";
  } else if (switchRate >= 2) {
    cognitiveLoad = "Medium";
  }

  const healthPercentage = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        averageFlowScore -
          totalSwitches * 2 -
          totalLostMinutes * 0.5
      )
    )
  );

  let healthStatus = "Healthy";

  if (healthPercentage < 50) {
    healthStatus = "Needs Attention";
  } else if (healthPercentage < 75) {
    healthStatus = "Moderate";
  }

  return (
    <Card style={{ marginTop: "20px" }}>
      <Title>Overall Team Health</Title>

      <Text style={{ marginTop: "6px" }}>
        Team-level view of developer flow, cognitive load,
        context switching, and estimated productivity loss.
      </Text>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
          marginTop: "20px",
        }}
      >
        <Card>
          <Text>Team Health</Text>

          <Metric>
            {healthPercentage}%
          </Metric>

          <Text>{healthStatus}</Text>
        </Card>

        <Card>
          <Text>Average Flow Score</Text>

          <Metric>
            {averageFlowScore}/100
          </Metric>

          <Text>Team flow performance</Text>
        </Card>

        <Card>
          <Text>Context Switches</Text>

          <Metric>
            {totalSwitches}
          </Metric>

          <Text>Total team switches</Text>
        </Card>

        <Card>
          <Text>Productivity Loss</Text>

          <Metric>
            {totalLostMinutes} min
          </Metric>

          <Text>Estimated lost time</Text>
        </Card>

        <Card>
          <Text>Active Developers</Text>

          <Metric>
            {activeDevelopers}
          </Metric>

          <Text>Developers analyzed</Text>
        </Card>

        <Card>
          <Text>Cognitive Load</Text>

          <Metric>
            {cognitiveLoad}
          </Metric>

          <Text>
            Based on context-switch frequency
          </Text>
        </Card>
      </div>
    </Card>
  );
}

export default TeamHealthOverview;
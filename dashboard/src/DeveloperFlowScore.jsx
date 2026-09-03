import { Card, Metric, Text, Title } from "@tremor/react";

function DeveloperFlowScore({ data }) {
  const getFlowScore = (developer) => {
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

  const getStatus = (score) => {
    if (score >= 85) {
      return "Excellent Flow";
    }

    if (score >= 70) {
      return "Strong Flow";
    }

    if (score >= 50) {
      return "Moderate Flow";
    }

    return "Low Flow";
  };

  return (
    <Card style={{ marginTop: "20px" }}>
      <Title>Developer Flow Score</Title>

      <Text style={{ marginTop: "6px" }}>
        Flow score based on activity, coding time,
        context switching, and estimated productivity loss.
      </Text>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "18px",
          marginTop: "18px",
        }}
      >
        {data.map((developer) => {
          const score = getFlowScore(developer);

          return (
            <Card key={developer.name}>
              <Text>{developer.name}</Text>

              <Metric
                style={{
                  marginTop: "8px",
                }}
              >
                {score}/100
              </Metric>

              <Text
                style={{
                  marginTop: "6px",
                }}
              >
                {getStatus(score)}
              </Text>

              <Text
                style={{
                  marginTop: "10px",
                }}
              >
                Coding: {developer.codingMinutes} min
              </Text>

              <Text>
                Context switches: {developer.switches}
              </Text>

              <Text>
                Lost time: {developer.lostMinutes} min
              </Text>
            </Card>
          );
        })}
      </div>
    </Card>
  );
}

export default DeveloperFlowScore;

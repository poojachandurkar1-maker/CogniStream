import { Card, Text, Title } from "@tremor/react";

function DeveloperRiskRanking({ data }) {
  const rankedData = [...data]
    .map((developer) => {
      const riskScore =
        developer.switches * 10 +
        developer.lostMinutes +
        developer.activity;

      let risk = "Low";

      if (developer.switches >= 3) {
        risk = "High";
      } else if (developer.switches >= 2) {
        risk = "Medium";
      }

      return {
        ...developer,
        riskScore,
        risk,
      };
    })
    .sort((a, b) => {
      if (b.riskScore !== a.riskScore) {
        return b.riskScore - a.riskScore;
      }

      return b.lostMinutes - a.lostMinutes;
    });

  const getRiskStyle = (risk) => {
    if (risk === "High") {
      return {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
      };
    }

    if (risk === "Medium") {
      return {
        backgroundColor: "#fef3c7",
        color: "#92400e",
      };
    }

    return {
      backgroundColor: "#dcfce7",
      color: "#166534",
    };
  };

  return (
    <Card style={{ marginTop: "20px" }}>
      <Title>Developer Risk Ranking</Title>

      <Text style={{ marginTop: "6px", marginBottom: "18px" }}>
        Developers ranked using context-switching impact, estimated lost time,
        and activity signals.
      </Text>

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "850px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "70px 1.5fr 100px 120px 110px 120px 100px",
              gap: "12px",
              padding: "12px",
              fontWeight: "600",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div>Rank</div>
            <div>Developer</div>
            <div>Activity</div>
            <div>Coding Time</div>
            <div>Switches</div>
            <div>Lost Time</div>
            <div>Risk</div>
          </div>

          {rankedData.map((developer, index) => (
            <div
              key={developer.name}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "70px 1.5fr 100px 120px 110px 120px 100px",
                gap: "12px",
                padding: "14px 12px",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div>
                <strong>#{index + 1}</strong>
              </div>

              <div>
                <strong>{developer.name}</strong>
              </div>

              <div>{developer.activity}</div>

              <div>{developer.codingMinutes} min</div>

              <div>{developer.switches}</div>

              <div>{developer.lostMinutes} min</div>

              <div>
                <span
                  style={{
                    ...getRiskStyle(developer.risk),
                    padding: "5px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {developer.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export default DeveloperRiskRanking;
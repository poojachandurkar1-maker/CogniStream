import { Card, Metric, Text, Title } from "@tremor/react";

import githubData from "./data/github_activity.json";
import slackData from "./data/slack_activity.json";
import ideData from "./data/ide_activity.json";

import ActivityChart from "./ActivityChart";

function App() {
  // Build activity data from the actual GitHub, Slack, and IDE records
  const activityData = [
    ...githubData.records.map((record) => ({
      time: record.timestamp.substring(11, 16),
      activity: 1,
    })),
    ...slackData.records.map((record) => ({
      time: record.timestamp.substring(11, 16),
      activity: 1,
    })),
    ...ideData.records.map((record) => ({
      time: record.timestamp.substring(11, 16),
      activity: 1,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  const totalCommits = githubData.records.filter(
    (record) => record.action === "commit"
  ).length;

  const totalPullRequests = githubData.records.filter(
    (record) => record.action === "pull_request"
  ).length;

  const totalSlackMessages = slackData.records.length;

  const totalCodingMinutes = ideData.records.reduce(
    (total, record) => total + record.minutes_coding,
    0
  );

  const totalCodingHours = (totalCodingMinutes / 60).toFixed(1);

  const developers = new Set([
    ...githubData.records.map((record) => record.developer),
    ...slackData.records.map((record) => record.user),
    ...ideData.records.map((record) => record.developer),
  ]).size;

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <Title>CogniStream</Title>

      <Text>
        Developer Flow-State &amp; Cognitive Load Analytics
      </Text>

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
          <Metric>{totalCommits}</Metric>
        </Card>

        <Card>
          <Text>Pull Requests</Text>
          <Metric>{totalPullRequests}</Metric>
        </Card>

        <Card>
          <Text>Slack Messages</Text>
          <Metric>{totalSlackMessages}</Metric>
        </Card>

        <Card>
          <Text>IDE Coding Hours</Text>
          <Metric>{totalCodingHours}</Metric>
        </Card>

        <Card>
          <Text>Active Developers</Text>
          <Metric>{developers}</Metric>
        </Card>

        <Card>
          <Text>Total Coding Minutes</Text>
          <Metric>{totalCodingMinutes}</Metric>
        </Card>
      </div>

      <div style={{ marginTop: "40px" }}>
        <Card>
          <Title>Developer Activity</Title>

          <Text>
            Activity timeline from GitHub, Slack, and IDE ingestion data
          </Text>

          <div style={{ marginTop: "20px" }}>
            <ActivityChart data={activityData} />
          </div>
        </Card>
      </div>

      <div style={{ marginTop: "40px" }}>
        <Card>
          <Title>GitHub Activity</Title>

          {githubData.records.map((record, index) => (
            <div
              key={index}
              style={{
                padding: "15px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Text>
                <strong>{record.developer}</strong> — {record.action}
              </Text>

              <Text>{record.message}</Text>

              <Text>{record.timestamp}</Text>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Card>
          <Title>Slack Activity</Title>

          {slackData.records.map((record, index) => (
            <div
              key={index}
              style={{
                padding: "15px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Text>
                <strong>{record.user}</strong> — {record.channel}
              </Text>

              <Text>{record.message}</Text>

              <Text>{record.timestamp}</Text>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ marginTop: "20px" }}>
        <Card>
          <Title>IDE Activity</Title>

          {ideData.records.map((record, index) => (
            <div
              key={index}
              style={{
                padding: "15px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <Text>
                <strong>{record.developer}</strong> — {record.language}
              </Text>

              <Text>
                {record.file} — {record.minutes_coding} minutes
              </Text>

              <Text>{record.timestamp}</Text>
            </div>
          ))}
        </Card>
      </div>
    </main>
  );
}

export default App;
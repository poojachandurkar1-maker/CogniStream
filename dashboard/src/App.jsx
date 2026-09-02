import { Card, Metric, Text, Title } from "@tremor/react";

import githubData from "./data/github_activity.json";
import slackData from "./data/slack_activity.json";
import ideData from "./data/ide_activity.json";

import ActivityChart from "./ActivityChart";
import DeveloperActivityChart from "./DeveloperActivityChart";
import ContextSwitchChart from "./ContextSwitchChart";

function App() {
  // Combined activity timeline
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

  // Developer activity breakdown
  const developerActivity = {};

  githubData.records.forEach((record) => {
    if (!developerActivity[record.developer]) {
      developerActivity[record.developer] = 0;
    }

    developerActivity[record.developer] += 1;
  });

  slackData.records.forEach((record) => {
    if (!developerActivity[record.user]) {
      developerActivity[record.user] = 0;
    }

    developerActivity[record.user] += 1;
  });

  ideData.records.forEach((record) => {
    if (!developerActivity[record.developer]) {
      developerActivity[record.developer] = 0;
    }

    developerActivity[record.developer] += 1;
  });

  const developerActivityData = Object.entries(developerActivity).map(
    ([developer, activity]) => ({
      developer,
      activity,
    })
  );

  // Context switching analysis
  const allEvents = [
    ...githubData.records.map((record) => ({
      developer: record.developer,
      source: "GitHub",
      timestamp: record.timestamp,
    })),
    ...slackData.records.map((record) => ({
      developer: record.user,
      source: "Slack",
      timestamp: record.timestamp,
    })),
    ...ideData.records.map((record) => ({
      developer: record.developer,
      source: "IDE",
      timestamp: record.timestamp,
    })),
  ];

  const eventsByDeveloper = {};

  allEvents.forEach((event) => {
    if (!eventsByDeveloper[event.developer]) {
      eventsByDeveloper[event.developer] = [];
    }

    eventsByDeveloper[event.developer].push(event);
  });

  const contextSwitchData = Object.entries(eventsByDeveloper).map(
    ([developer, events]) => {
      const sortedEvents = [...events].sort((a, b) =>
        a.timestamp.localeCompare(b.timestamp)
      );

      let switches = 0;

      for (let i = 1; i < sortedEvents.length; i++) {
        if (sortedEvents[i].source !== sortedEvents[i - 1].source) {
          switches += 1;
        }
      }

      return {
        developer,
        switches,
      };
    }
  );

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
          <Title>Activity by Developer</Title>

          <Text>
            Combined GitHub, Slack, and IDE activity for each developer
          </Text>

          <div style={{ marginTop: "20px" }}>
            <DeveloperActivityChart data={developerActivityData} />
          </div>
        </Card>
      </div>

      <div style={{ marginTop: "40px" }}>
        <Card>
          <Title>Context Switching Analysis</Title>

          <Text>
            Number of times developers switched between GitHub, Slack, and IDE
            activity
          </Text>

          <div style={{ marginTop: "20px" }}>
            <ContextSwitchChart data={contextSwitchData} />
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

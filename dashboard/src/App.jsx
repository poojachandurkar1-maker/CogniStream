import { useMemo, useState } from "react";
import { Card, Metric, Text, Title } from "@tremor/react";

import githubData from "./data/github_activity.json";
import slackData from "./data/slack_activity.json";
import ideData from "./data/ide_activity.json";

import ActivityChart from "./ActivityChart";
import DeveloperActivityChart from "./DeveloperActivityChart";
import ContextSwitchChart from "./ContextSwitchChart";
import ContextSwitchTaxChart from "./ContextSwitchTaxChart";
import DeveloperPerformance from "./DeveloperPerformance";
import DataSourceSummary from "./DataSourceSummary";

function App() {
  // -----------------------------
  // Developer filter
  // -----------------------------
  const [selectedDeveloper, setSelectedDeveloper] =
    useState("All Developers");

  // -----------------------------
  // Available developers
  // -----------------------------
  const developerList = useMemo(() => {
    return [
      "All Developers",
      ...new Set([
        ...githubData.records.map((record) => record.developer),
        ...slackData.records.map((record) => record.user),
        ...ideData.records.map((record) => record.developer),
      ]),
    ];
  }, []);

  // -----------------------------
  // Filter source data
  // -----------------------------
  const filteredGithubData =
    selectedDeveloper === "All Developers"
      ? githubData.records
      : githubData.records.filter(
          (record) => record.developer === selectedDeveloper
        );

  const filteredSlackData =
    selectedDeveloper === "All Developers"
      ? slackData.records
      : slackData.records.filter(
          (record) => record.user === selectedDeveloper
        );

  const filteredIdeData =
    selectedDeveloper === "All Developers"
      ? ideData.records
      : ideData.records.filter(
          (record) => record.developer === selectedDeveloper
        );

  // -----------------------------
  // Activity timeline
  // -----------------------------
  const activityData = [
    ...filteredGithubData.map((record) => ({
      time: record.timestamp.substring(11, 16),
      activity: 1,
    })),
    ...filteredSlackData.map((record) => ({
      time: record.timestamp.substring(11, 16),
      activity: 1,
    })),
    ...filteredIdeData.map((record) => ({
      time: record.timestamp.substring(11, 16),
      activity: 1,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time));

  // -----------------------------
  // Developer activity
  // -----------------------------
  const developerActivity = {};

  filteredGithubData.forEach((record) => {
    developerActivity[record.developer] =
      (developerActivity[record.developer] || 0) + 1;
  });

  filteredSlackData.forEach((record) => {
    developerActivity[record.user] =
      (developerActivity[record.user] || 0) + 1;
  });

  filteredIdeData.forEach((record) => {
    developerActivity[record.developer] =
      (developerActivity[record.developer] || 0) + 1;
  });

  const developerActivityData = Object.entries(
    developerActivity
  ).map(([developer, activity]) => ({
    developer,
    activity,
  }));

  // -----------------------------
  // Context switching
  // -----------------------------
  const allEvents = [
    ...filteredGithubData.map((record) => ({
      developer: record.developer,
      source: "GitHub",
      timestamp: record.timestamp,
    })),
    ...filteredSlackData.map((record) => ({
      developer: record.user,
      source: "Slack",
      timestamp: record.timestamp,
    })),
    ...filteredIdeData.map((record) => ({
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

  const contextSwitchData = Object.entries(
    eventsByDeveloper
  ).map(([developer, events]) => {
    const sortedEvents = [...events].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp)
    );

    let switches = 0;

    for (let i = 1; i < sortedEvents.length; i++) {
      if (
        sortedEvents[i].source !==
        sortedEvents[i - 1].source
      ) {
        switches += 1;
      }
    }

    return {
      developer,
      switches,
    };
  });

  // -----------------------------
  // Context switching tax
  // -----------------------------
  const MINUTES_PER_SWITCH = 5;

  const contextSwitchTaxData = contextSwitchData.map(
    (record) => ({
      developer: record.developer,
      switches: record.switches,
      lostMinutes:
        record.switches * MINUTES_PER_SWITCH,
    })
  );

  // -----------------------------
  // KPI calculations
  // -----------------------------
  const totalContextSwitches =
    contextSwitchData.reduce(
      (total, record) =>
        total + record.switches,
      0
    );

  const totalLostMinutes =
    totalContextSwitches *
    MINUTES_PER_SWITCH;

  const totalCommits =
    filteredGithubData.filter(
      (record) => record.action === "commit"
    ).length;

  const totalPullRequests =
    filteredGithubData.filter(
      (record) => record.action === "pull_request"
    ).length;

  const totalSlackMessages =
    filteredSlackData.length;

  const totalCodingMinutes =
    filteredIdeData.reduce(
      (total, record) =>
        total + record.minutes_coding,
      0
    );

  const totalCodingHours =
    (totalCodingMinutes / 60).toFixed(1);

  const activeDevelopers = new Set([
    ...filteredGithubData.map(
      (record) => record.developer
    ),
    ...filteredSlackData.map(
      (record) => record.user
    ),
    ...filteredIdeData.map(
      (record) => record.developer
    ),
  ]).size;

  // -----------------------------
  // Developer performance
  // -----------------------------
  const developerPerformanceData =
    Object.keys(developerActivity).map(
      (developer) => {
        const activity =
          developerActivity[developer];

        const codingMinutes =
          filteredIdeData
            .filter(
              (record) =>
                record.developer === developer
            )
            .reduce(
              (total, record) =>
                total + record.minutes_coding,
              0
            );

        const switchRecord =
          contextSwitchData.find(
            (record) =>
              record.developer === developer
          );

        const switches = switchRecord
          ? switchRecord.switches
          : 0;

        const lostMinutes =
          switches * MINUTES_PER_SWITCH;

        let status = "Stable";

        if (switches >= 3) {
          status = "High Context Switching";
        } else if (switches >= 2) {
          status =
            "Moderate Context Switching";
        }

        return {
          name: developer,
          activity,
          codingMinutes,
          switches,
          lostMinutes,
          status,
        };
      }
    );

  // -----------------------------
  // Data source summary
  // -----------------------------
  const dataSourceSummary = [
    {
      name: "GitHub",
      records: filteredGithubData.length,
    },
    {
      name: "Slack",
      records: filteredSlackData.length,
    },
    {
      name: "IDE",
      records: filteredIdeData.length,
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1250px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#ffffff",
            padding: "28px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            marginBottom: "28px",
          }}
        >
          <Title>CogniStream</Title>

          <Text>
            Developer Flow-State &amp;
            Cognitive Load Analytics
          </Text>

          <Text>
            Unified analytics from GitHub,
            Slack, and IDE activity.
          </Text>
        </div>

        {/* Developer Filter */}
        <div
          style={{
            background: "#ffffff",
            padding: "20px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            marginBottom: "28px",
          }}
        >
          <Text>
            <strong>Developer Filter</strong>
          </Text>

          <select
            value={selectedDeveloper}
            onChange={(event) =>
              setSelectedDeveloper(
                event.target.value
              )
            }
            style={{
              marginTop: "10px",
              width: "100%",
              maxWidth: "350px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "#ffffff",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            {developerList.map((developer) => (
              <option
                key={developer}
                value={developer}
              >
                {developer}
              </option>
            ))}
          </select>

          <Text style={{ marginTop: "10px" }}>
            Showing analytics for:{" "}
            <strong>
              {selectedDeveloper}
            </strong>
          </Text>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "18px",
            marginBottom: "30px",
          }}
        >
          <Card>
            <Text>Total Commits</Text>
            <Metric>{totalCommits}</Metric>
          </Card>

          <Card>
            <Text>Pull Requests</Text>
            <Metric>
              {totalPullRequests}
            </Metric>
          </Card>

          <Card>
            <Text>Slack Messages</Text>
            <Metric>
              {totalSlackMessages}
            </Metric>
          </Card>

          <Card>
            <Text>IDE Coding Hours</Text>
            <Metric>
              {totalCodingHours}
            </Metric>
          </Card>

          <Card>
            <Text>Active Developers</Text>
            <Metric>
              {activeDevelopers}
            </Metric>
          </Card>

          <Card>
            <Text>Coding Minutes</Text>
            <Metric>
              {totalCodingMinutes}
            </Metric>
          </Card>

          <Card>
            <Text>Context Switches</Text>
            <Metric>
              {totalContextSwitches}
            </Metric>
          </Card>

          <Card>
            <Text>Estimated Lost Minutes</Text>
            <Metric>
              {totalLostMinutes}
            </Metric>
          </Card>
        </div>

        {/* Data Sources */}
        <div style={{ marginBottom: "28px" }}>
          <Card>
            <Title>
              Data Sources Overview
            </Title>

            <Text>
              Activity records ingested from
              connected developer tools.
            </Text>

            <DataSourceSummary
              data={dataSourceSummary}
            />
          </Card>
        </div>

        {/* Developer Performance */}
        <div style={{ marginBottom: "28px" }}>
          <Card>
            <Title>
              Developer Performance Summary
            </Title>

            <Text>
              Developer-level activity,
              coding time, and
              context-switching impact.
            </Text>

            <DeveloperPerformance
              data={developerPerformanceData}
            />
          </Card>
        </div>

        {/* Activity Timeline */}
        <div style={{ marginBottom: "28px" }}>
          <Card>
            <Title>
              Developer Activity Timeline
            </Title>

            <Text>
              Combined activity across
              GitHub, Slack, and IDE systems.
            </Text>

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <ActivityChart
                data={activityData}
              />
            </div>
          </Card>
        </div>

        {/* Developer Activity */}
        <div style={{ marginBottom: "28px" }}>
          <Card>
            <Title>
              Activity by Developer
            </Title>

            <Text>
              Overall activity volume for
              each developer.
            </Text>

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <DeveloperActivityChart
                data={developerActivityData}
              />
            </div>
          </Card>
        </div>

        {/* Context Switching */}
        <div style={{ marginBottom: "28px" }}>
          <Card>
            <Title>
              Context Switching Analysis
            </Title>

            <Text>
              Number of transitions between
              GitHub, Slack, and IDE activity.
            </Text>

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <ContextSwitchChart
                data={contextSwitchData}
              />
            </div>
          </Card>
        </div>

        {/* Context Switching Tax */}
        <div style={{ marginBottom: "28px" }}>
          <Card>
            <Title>
              Context-Switching Tax
            </Title>

            <Text>
              Estimated productivity time
              lost using 5 minutes per
              context switch.
            </Text>

            <div
              style={{
                marginTop: "20px",
              }}
            >
              <ContextSwitchTaxChart
                data={contextSwitchTaxData}
              />
            </div>
          </Card>
        </div>

        {/* GitHub Activity */}
        <div style={{ marginBottom: "20px" }}>
          <Card>
            <Title>
              GitHub Activity
            </Title>

            {filteredGithubData.map(
              (record, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px 0",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <Text>
                    <strong>
                      {record.developer}
                    </strong>{" "}
                    — {record.action}
                  </Text>

                  <Text>
                    {record.message}
                  </Text>

                  <Text>
                    {record.timestamp}
                  </Text>
                </div>
              )
            )}

            {filteredGithubData.length === 0 && (
              <Text>
                No GitHub activity found.
              </Text>
            )}
          </Card>
        </div>

        {/* Slack Activity */}
        <div style={{ marginBottom: "20px" }}>
          <Card>
            <Title>
              Slack Activity
            </Title>

            {filteredSlackData.map(
              (record, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px 0",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <Text>
                    <strong>
                      {record.user}
                    </strong>{" "}
                    — {record.channel}
                  </Text>

                  <Text>
                    {record.message}
                  </Text>

                  <Text>
                    {record.timestamp}
                  </Text>
                </div>
              )
            )}

            {filteredSlackData.length === 0 && (
              <Text>
                No Slack activity found.
              </Text>
            )}
          </Card>
        </div>

        {/* IDE Activity */}
        <div>
          <Card>
            <Title>
              IDE Activity
            </Title>

            {filteredIdeData.map(
              (record, index) => (
                <div
                  key={index}
                  style={{
                    padding: "16px 0",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <Text>
                    <strong>
                      {record.developer}
                    </strong>{" "}
                    — {record.language}
                  </Text>

                  <Text>
                    {record.file} —{" "}
                    {record.minutes_coding}{" "}
                    minutes
                  </Text>

                  <Text>
                    {record.timestamp}
                  </Text>
                </div>
              )
            )}

            {filteredIdeData.length === 0 && (
              <Text>
                No IDE activity found.
              </Text>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

export default App;
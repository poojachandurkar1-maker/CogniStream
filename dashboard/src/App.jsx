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
import DeveloperRiskRanking from "./DeveloperRiskRanking";

function App() {
  const [selectedDeveloper, setSelectedDeveloper] =
    useState("All Developers");

  const [selectedTimeRange, setSelectedTimeRange] =
    useState("All Time");

  const [selectedSource, setSelectedSource] =
    useState("All Sources");

  // --------------------------------------------------
  // Developer List
  // --------------------------------------------------

  const developers = useMemo(() => {
    const names = new Set();

    githubData.records.forEach((record) => {
      if (record.developer) {
        names.add(record.developer);
      }
    });

    slackData.records.forEach((record) => {
      if (record.user) {
        names.add(record.user);
      }
    });

    ideData.records.forEach((record) => {
      if (record.developer) {
        names.add(record.developer);
      }
    });

    return Array.from(names).sort();
  }, []);

  // --------------------------------------------------
  // Time Filter
  // --------------------------------------------------

  const isWithinTimeRange = (timestamp) => {
    if (selectedTimeRange === "All Time") {
      return true;
    }

    const hour = new Date(timestamp).getHours();

    if (selectedTimeRange === "Morning") {
      return hour >= 9 && hour < 12;
    }

    if (selectedTimeRange === "Afternoon") {
      return hour >= 12 && hour < 17;
    }

    if (selectedTimeRange === "Evening") {
      return hour >= 17 && hour < 22;
    }

    return true;
  };

  // --------------------------------------------------
  // Filtered Data
  // --------------------------------------------------

  const filteredGithub = useMemo(() => {
    if (selectedSource === "Slack" || selectedSource === "IDE") {
      return [];
    }

    return githubData.records.filter((record) => {
      const developerMatch =
        selectedDeveloper === "All Developers" ||
        record.developer === selectedDeveloper;

      const timeMatch = isWithinTimeRange(record.timestamp);

      return developerMatch && timeMatch;
    });
  }, [selectedDeveloper, selectedTimeRange, selectedSource]);

  const filteredSlack = useMemo(() => {
    if (selectedSource === "GitHub" || selectedSource === "IDE") {
      return [];
    }

    return slackData.records.filter((record) => {
      const developerMatch =
        selectedDeveloper === "All Developers" ||
        record.user === selectedDeveloper;

      const timeMatch = isWithinTimeRange(record.timestamp);

      return developerMatch && timeMatch;
    });
  }, [selectedDeveloper, selectedTimeRange, selectedSource]);

  const filteredIde = useMemo(() => {
    if (selectedSource === "GitHub" || selectedSource === "Slack") {
      return [];
    }

    return ideData.records.filter((record) => {
      const developerMatch =
        selectedDeveloper === "All Developers" ||
        record.developer === selectedDeveloper;

      const timeMatch = isWithinTimeRange(record.timestamp);

      return developerMatch && timeMatch;
    });
  }, [selectedDeveloper, selectedTimeRange, selectedSource]);

  // --------------------------------------------------
  // Activity Timeline
  // --------------------------------------------------

  const activityTimeline = useMemo(() => {
    const activities = [];

    filteredGithub.forEach((record) => {
      activities.push({
        time: new Date(record.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: record.timestamp,
        activity: 1,
        source: "GitHub",
        developer: record.developer,
      });
    });

    filteredSlack.forEach((record) => {
      activities.push({
        time: new Date(record.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: record.timestamp,
        activity: 1,
        source: "Slack",
        developer: record.user,
      });
    });

    filteredIde.forEach((record) => {
      activities.push({
        time: new Date(record.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: record.timestamp,
        activity: 1,
        source: "IDE",
        developer: record.developer,
      });
    });

    activities.sort(
      (a, b) =>
        new Date(a.timestamp) - new Date(b.timestamp)
    );

    return activities;
  }, [filteredGithub, filteredSlack, filteredIde]);

  // --------------------------------------------------
  // Activity By Developer
  // --------------------------------------------------

  const developerActivity = useMemo(() => {
    return developers
      .map((developer) => {
        const githubCount = filteredGithub.filter(
          (record) => record.developer === developer
        ).length;

        const slackCount = filteredSlack.filter(
          (record) => record.user === developer
        ).length;

        const ideCount = filteredIde.filter(
          (record) => record.developer === developer
        ).length;

        return {
          developer,
          activity: githubCount + slackCount + ideCount,
        };
      })
      .filter((item) => item.activity > 0);
  }, [developers, filteredGithub, filteredSlack, filteredIde]);

  // --------------------------------------------------
  // Context Switching
  // --------------------------------------------------

  const contextSwitchData = useMemo(() => {
    const result = {};

    developers.forEach((developer) => {
      const activities = [];

      filteredGithub
        .filter((record) => record.developer === developer)
        .forEach((record) => {
          activities.push({
            developer,
            source: "GitHub",
            timestamp: record.timestamp,
          });
        });

      filteredSlack
        .filter((record) => record.user === developer)
        .forEach((record) => {
          activities.push({
            developer,
            source: "Slack",
            timestamp: record.timestamp,
          });
        });

      filteredIde
        .filter((record) => record.developer === developer)
        .forEach((record) => {
          activities.push({
            developer,
            source: "IDE",
            timestamp: record.timestamp,
          });
        });

      activities.sort(
        (a, b) =>
          new Date(a.timestamp) -
          new Date(b.timestamp)
      );

      let switches = 0;

      for (let i = 1; i < activities.length; i++) {
        if (
          activities[i].source !==
          activities[i - 1].source
        ) {
          switches++;
        }
      }

      result[developer] = switches;
    });

    return Object.entries(result)
      .map(([developer, switches]) => ({
        developer,
        switches,
      }))
      .filter(
        (item) =>
          selectedDeveloper === "All Developers" ||
          item.developer === selectedDeveloper
      );
  }, [
    developers,
    filteredGithub,
    filteredSlack,
    filteredIde,
    selectedDeveloper,
  ]);

  // --------------------------------------------------
  // Context Switching Tax
  // --------------------------------------------------

  const MINUTES_PER_SWITCH = 5;

  const contextSwitchTaxData = useMemo(() => {
    return contextSwitchData.map((item) => ({
      developer: item.developer,
      switches: item.switches,
      lostMinutes:
        item.switches * MINUTES_PER_SWITCH,
    }));
  }, [contextSwitchData]);

  // --------------------------------------------------
  // Developer Performance
  // --------------------------------------------------

  const developerPerformanceData = useMemo(() => {
    return developers
      .map((developer) => {
        const githubCount = filteredGithub.filter(
          (record) => record.developer === developer
        ).length;

        const slackCount = filteredSlack.filter(
          (record) => record.user === developer
        ).length;

        const ideRecords = filteredIde.filter(
          (record) => record.developer === developer
        );

        const codingMinutes = ideRecords.reduce(
          (total, record) =>
            total + Number(record.minutes_coding || 0),
          0
        );

        const activity =
          githubCount +
          slackCount +
          ideRecords.length;

        const switchRecord = contextSwitchData.find(
          (item) => item.developer === developer
        );

        const switches = switchRecord
          ? switchRecord.switches
          : 0;

        const lostMinutes =
          switches * MINUTES_PER_SWITCH;

        let status = "Stable";

        if (switches >= 3) {
          status = "High Cognitive Load";
        } else if (switches >= 2) {
          status = "Moderate Cognitive Load";
        } else if (activity === 0) {
          status = "Inactive";
        }

        return {
          name: developer,
          activity,
          codingMinutes,
          switches,
          lostMinutes,
          status,
        };
      })
      .filter(
        (developer) =>
          selectedDeveloper === "All Developers" ||
          developer.name === selectedDeveloper
      )
      .filter(
        (developer) => developer.activity > 0
      );
  }, [
    developers,
    filteredGithub,
    filteredSlack,
    filteredIde,
    contextSwitchData,
    selectedDeveloper,
  ]);

  // --------------------------------------------------
  // Data Source Summary
  // --------------------------------------------------

  const dataSourceSummary = useMemo(() => {
    return [
      {
        name: "GitHub",
        records: filteredGithub.length,
      },
      {
        name: "Slack",
        records: filteredSlack.length,
      },
      {
        name: "IDE",
        records: filteredIde.length,
      },
    ];
  }, [
    filteredGithub,
    filteredSlack,
    filteredIde,
  ]);

  // --------------------------------------------------
  // KPI Calculations
  // --------------------------------------------------

  const totalCommits = filteredGithub.filter(
    (record) => record.action === "commit"
  ).length;

  const pullRequests = filteredGithub.filter(
    (record) => record.action === "pull_request"
  ).length;

  const slackMessages = filteredSlack.length;

  const codingMinutes = filteredIde.reduce(
    (total, record) =>
      total + Number(record.minutes_coding || 0),
    0
  );

  const codingHours = (
    codingMinutes / 60
  ).toFixed(1);

  const activeDevelopers =
    developerPerformanceData.length;

  const totalContextSwitches =
    contextSwitchData.reduce(
      (total, item) => total + item.switches,
      0
    );

  const totalLostMinutes =
    totalContextSwitches * MINUTES_PER_SWITCH;

  // --------------------------------------------------
  // Analytics Insights
  // --------------------------------------------------

  const mostActiveDeveloper = useMemo(() => {
    if (developerPerformanceData.length === 0) {
      return "N/A";
    }

    return [...developerPerformanceData].sort(
      (a, b) => b.activity - a.activity
    )[0].name;
  }, [developerPerformanceData]);

  const mostUsedDataSource = useMemo(() => {
    const sources = [
      {
        name: "GitHub",
        count: filteredGithub.length,
      },
      {
        name: "Slack",
        count: filteredSlack.length,
      },
      {
        name: "IDE",
        count: filteredIde.length,
      },
    ];

    const sorted = sources.sort(
      (a, b) => b.count - a.count
    );

    return sorted[0].count > 0
      ? sorted[0].name
      : "N/A";
  }, [
    filteredGithub,
    filteredSlack,
    filteredIde,
  ]);

  const flowStatus =
    totalContextSwitches >= 3
      ? "At Risk"
      : totalContextSwitches >= 2
      ? "Moderate"
      : "Healthy";

  const cognitiveLoad =
    totalContextSwitches >= 3
      ? "High"
      : totalContextSwitches >= 2
      ? "Medium"
      : "Low";

  const productivityLoss =
    codingMinutes > 0
      ? `${(
          (totalLostMinutes / codingMinutes) *
          100
        ).toFixed(1)}%`
      : "0%";

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "30px",
        fontFamily:
          "Inter, Arial, sans-serif",
      }}
    >
      {/* Header */}

      <div style={{ marginBottom: "25px" }}>
        <Title
          style={{
            fontSize: "32px",
            fontWeight: "700",
          }}
        >
          CogniStream
        </Title>

        <Text style={{ marginTop: "6px" }}>
          Developer Flow-State & Cognitive Load
          Analytics
        </Text>
      </div>

      {/* Filters */}

      <Card style={{ marginBottom: "25px" }}>
        <Title>Dashboard Filters</Title>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginTop: "18px",
          }}
        >
          {/* Developer */}

          <div>
            <Text>Developer</Text>

            <select
              value={selectedDeveloper}
              onChange={(e) =>
                setSelectedDeveloper(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                borderRadius: "8px",
                border:
                  "1px solid #d1d5db",
                backgroundColor: "white",
              }}
            >
              <option>
                All Developers
              </option>

              {developers.map((developer) => (
                <option
                  key={developer}
                  value={developer}
                >
                  {developer}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}

          <div>
            <Text>Time Range</Text>

            <select
              value={selectedTimeRange}
              onChange={(e) =>
                setSelectedTimeRange(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                borderRadius: "8px",
                border:
                  "1px solid #d1d5db",
                backgroundColor: "white",
              }}
            >
              <option>All Time</option>
              <option>Morning</option>
              <option>Afternoon</option>
              <option>Evening</option>
            </select>
          </div>

          {/* Source */}

          <div>
            <Text>Data Source</Text>

            <select
              value={selectedSource}
              onChange={(e) =>
                setSelectedSource(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "6px",
                borderRadius: "8px",
                border:
                  "1px solid #d1d5db",
                backgroundColor: "white",
              }}
            >
              <option>All Sources</option>
              <option>GitHub</option>
              <option>Slack</option>
              <option>IDE</option>
            </select>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
        }}
      >
        <Card>
          <Text>Total Commits</Text>
          <Metric>{totalCommits}</Metric>
        </Card>

        <Card>
          <Text>Pull Requests</Text>
          <Metric>{pullRequests}</Metric>
        </Card>

        <Card>
          <Text>Slack Messages</Text>
          <Metric>{slackMessages}</Metric>
        </Card>

        <Card>
          <Text>IDE Coding Hours</Text>
          <Metric>{codingHours}</Metric>
        </Card>

        <Card>
          <Text>Active Developers</Text>
          <Metric>{activeDevelopers}</Metric>
        </Card>

        <Card>
          <Text>Coding Minutes</Text>
          <Metric>{codingMinutes}</Metric>
        </Card>

        <Card>
          <Text>Context Switches</Text>
          <Metric>{totalContextSwitches}</Metric>
        </Card>

        <Card>
          <Text>Estimated Lost Minutes</Text>
          <Metric>{totalLostMinutes}</Metric>
        </Card>
      </div>

      {/* Analytics Insights */}

      <Card style={{ marginTop: "25px" }}>
        <Title>Analytics Insights</Title>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "18px",
            marginTop: "18px",
          }}
        >
          <div>
            <Text>Flow Status</Text>
            <Metric>{flowStatus}</Metric>
          </div>

          <div>
            <Text>Cognitive Load</Text>
            <Metric>{cognitiveLoad}</Metric>
          </div>

          <div>
            <Text>Productivity Loss</Text>
            <Metric>
              {productivityLoss}
            </Metric>
          </div>

          <div>
            <Text>Most Active Developer</Text>
            <Metric
              style={{
                fontSize: "20px",
              }}
            >
              {mostActiveDeveloper}
            </Metric>
          </div>

          <div>
            <Text>Most Used Data Source</Text>
            <Metric>{mostUsedDataSource}</Metric>
          </div>
        </div>
      </Card>

      {/* Data Source Overview */}

      <div style={{ marginTop: "25px" }}>
        <Title>Data Sources Overview</Title>

        <DataSourceSummary
          data={dataSourceSummary}
        />
      </div>

      {/* Developer Performance */}

      <div style={{ marginTop: "30px" }}>
        <Title>
          Developer Performance Summary
        </Title>

        <DeveloperPerformance
          data={developerPerformanceData}
        />
      </div>

      {/* Developer Risk Ranking */}

      <DeveloperRiskRanking
        data={developerPerformanceData}
      />

      {/* Activity Timeline */}

      <Card style={{ marginTop: "25px" }}>
        <Title>Developer Activity Timeline</Title>

        <Text style={{ marginTop: "6px" }}>
          Combined activity across GitHub, Slack,
          and IDE sources.
        </Text>

        <div style={{ marginTop: "15px" }}>
          <ActivityChart
            data={activityTimeline}
          />
        </div>
      </Card>

      {/* Activity By Developer */}

      <Card style={{ marginTop: "25px" }}>
        <Title>Activity by Developer</Title>

        <Text style={{ marginTop: "6px" }}>
          Total activity generated by each
          developer.
        </Text>

        <div style={{ marginTop: "15px" }}>
          <DeveloperActivityChart
            data={developerActivity}
          />
        </div>
      </Card>

      {/* Context Switching */}

      <Card style={{ marginTop: "25px" }}>
        <Title>Context Switching Analysis</Title>

        <Text style={{ marginTop: "6px" }}>
          Number of transitions between GitHub,
          Slack, and IDE activity.
        </Text>

        <div style={{ marginTop: "15px" }}>
          <ContextSwitchChart
            data={contextSwitchData}
          />
        </div>
      </Card>

      {/* Context Switching Tax */}

      <Card style={{ marginTop: "25px" }}>
        <Title>Context-Switching Tax</Title>

        <Text style={{ marginTop: "6px" }}>
          Estimated productivity loss based on
          5 minutes per context switch.
        </Text>

        <div style={{ marginTop: "15px" }}>
          <ContextSwitchTaxChart
            data={contextSwitchTaxData}
          />
        </div>
      </Card>

      {/* GitHub Activity */}

      <Card style={{ marginTop: "25px" }}>
        <Title>GitHub Activity</Title>

        <Text style={{ marginTop: "6px" }}>
          GitHub commits and pull requests.
        </Text>

        <div
          style={{
            marginTop: "15px",
            overflowX: "auto",
          }}
        >
          {filteredGithub.length === 0 ? (
            <Text>No GitHub activity found.</Text>
          ) : (
            filteredGithub.map(
              (record, index) => (
                <div
                  key={`${record.timestamp}-${index}`}
                  style={{
                    padding: "12px",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <strong>
                    {record.developer}
                  </strong>{" "}
                  — {record.action}
                  <div
                    style={{
                      marginTop: "4px",
                    }}
                  >
                    {record.message}
                  </div>

                  <Text
                    style={{
                      marginTop: "4px",
                    }}
                  >
                    {record.timestamp}
                  </Text>
                </div>
              )
            )
          )}
        </div>
      </Card>

      {/* Slack Activity */}

      <Card style={{ marginTop: "25px" }}>
        <Title>Slack Activity</Title>

        <Text style={{ marginTop: "6px" }}>
          Developer communication activity.
        </Text>

        <div
          style={{
            marginTop: "15px",
            overflowX: "auto",
          }}
        >
          {filteredSlack.length === 0 ? (
            <Text>No Slack activity found.</Text>
          ) : (
            filteredSlack.map(
              (record, index) => (
                <div
                  key={`${record.timestamp}-${index}`}
                  style={{
                    padding: "12px",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <strong>
                    {record.user}
                  </strong>{" "}
                  — {record.channel}

                  <div
                    style={{
                      marginTop: "4px",
                    }}
                  >
                    {record.message}
                  </div>

                  <Text
                    style={{
                      marginTop: "4px",
                    }}
                  >
                    {record.timestamp}
                  </Text>
                </div>
              )
            )
          )}
        </div>
      </Card>

      {/* IDE Activity */}

      <Card style={{ marginTop: "25px" }}>
        <Title>IDE Activity</Title>

        <Text style={{ marginTop: "6px" }}>
          Coding activity captured from IDE
          telemetry.
        </Text>

        <div
          style={{
            marginTop: "15px",
            overflowX: "auto",
          }}
        >
          {filteredIde.length === 0 ? (
            <Text>No IDE activity found.</Text>
          ) : (
            filteredIde.map(
              (record, index) => (
                <div
                  key={`${record.timestamp}-${index}`}
                  style={{
                    padding: "12px",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  <strong>
                    {record.developer}
                  </strong>{" "}
                  — {record.language}

                  <div
                    style={{
                      marginTop: "4px",
                    }}
                  >
                    File: {record.file}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                    }}
                  >
                    Coding Time:{" "}
                    {record.minutes_coding} minutes
                  </div>

                  <Text
                    style={{
                      marginTop: "4px",
                    }}
                  >
                    {record.timestamp}
                  </Text>
                </div>
              )
            )
          )}
        </div>
      </Card>

      {/* Footer */}

      <div
        style={{
          textAlign: "center",
          marginTop: "35px",
          paddingBottom: "20px",
        }}
      >
        <Text>
          CogniStream • Developer Flow-State &
          Cognitive Load Analytics
        </Text>
      </div>
    </div>
  );
}

export default App;

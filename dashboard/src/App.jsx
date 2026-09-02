
import { useMemo, useState } from "react";
import { Card, Metric, Text, Title } from "@tremor/react";

import ActivityChart from "./ActivityChart";
import DeveloperActivityChart from "./DeveloperActivityChart";
import ContextSwitchChart from "./ContextSwitchChart";
import ContextSwitchTaxChart from "./ContextSwitchTaxChart";
import DeveloperPerformance from "./DeveloperPerformance";
import DataSourceSummary from "./DataSourceSummary";
import DeveloperRiskRanking from "./DeveloperRiskRanking";
import DeveloperFlowScore from "./DeveloperFlowScore";
import TeamHealthOverview from "./TeamHealthOverview";

import githubData from "./data/github_activity.json";
import slackData from "./data/slack_activity.json";
import ideData from "./data/ide_activity.json";

function App() {
  const [selectedDeveloper, setSelectedDeveloper] =
    useState("All Developers");

  const [selectedTimeRange, setSelectedTimeRange] =
    useState("All Time");

  const [selectedSource, setSelectedSource] =
    useState("All Sources");

  /*
   * --------------------------------------------------
   * Developer List
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * Time Filter
   * --------------------------------------------------
   */

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

  /*
   * --------------------------------------------------
   * Filtered Source Data
   * --------------------------------------------------
   */

  const filteredGithub = useMemo(() => {
    if (
      selectedSource !== "All Sources" &&
      selectedSource !== "GitHub"
    ) {
      return [];
    }

    return githubData.records.filter((record) => {
      const developerMatch =
        selectedDeveloper === "All Developers" ||
        record.developer === selectedDeveloper;

      const timeMatch = isWithinTimeRange(
        record.timestamp
      );

      return developerMatch && timeMatch;
    });
  }, [
    selectedDeveloper,
    selectedTimeRange,
    selectedSource,
  ]);

  const filteredSlack = useMemo(() => {
    if (
      selectedSource !== "All Sources" &&
      selectedSource !== "Slack"
    ) {
      return [];
    }

    return slackData.records.filter((record) => {
      const developerMatch =
        selectedDeveloper === "All Developers" ||
        record.user === selectedDeveloper;

      const timeMatch = isWithinTimeRange(
        record.timestamp
      );

      return developerMatch && timeMatch;
    });
  }, [
    selectedDeveloper,
    selectedTimeRange,
    selectedSource,
  ]);

  const filteredIde = useMemo(() => {
    if (
      selectedSource !== "All Sources" &&
      selectedSource !== "IDE"
    ) {
      return [];
    }

    return ideData.records.filter((record) => {
      const developerMatch =
        selectedDeveloper === "All Developers" ||
        record.developer === selectedDeveloper;

      const timeMatch = isWithinTimeRange(
        record.timestamp
      );

      return developerMatch && timeMatch;
    });
  }, [
    selectedDeveloper,
    selectedTimeRange,
    selectedSource,
  ]);

  /*
   * --------------------------------------------------
   * Basic Metrics
   * --------------------------------------------------
   */

  const totalCommits = filteredGithub.filter(
    (record) => record.action === "commit"
  ).length;

  const totalPullRequests = filteredGithub.filter(
    (record) => record.action === "pull_request"
  ).length;

  const totalSlackMessages = filteredSlack.length;

  const totalCodingMinutes = filteredIde.reduce(
    (sum, record) =>
      sum + Number(record.minutes_coding || 0),
    0
  );

  const totalCodingHours = (
    totalCodingMinutes / 60
  ).toFixed(1);

  const activeDevelopers = new Set([
    ...filteredGithub.map(
      (record) => record.developer
    ),
    ...filteredSlack.map(
      (record) => record.user
    ),
    ...filteredIde.map(
      (record) => record.developer
    ),
  ]);

  /*
   * --------------------------------------------------
   * Activity Timeline
   * --------------------------------------------------
   */

  const activityTimeline = useMemo(() => {
    const events = [];

    filteredGithub.forEach((record) => {
      events.push({
        time: record.timestamp,
        source: "GitHub",
        developer: record.developer,
        activity: 1,
      });
    });

    filteredSlack.forEach((record) => {
      events.push({
        time: record.timestamp,
        source: "Slack",
        developer: record.user,
        activity: 1,
      });
    });

    filteredIde.forEach((record) => {
      events.push({
        time: record.timestamp,
        source: "IDE",
        developer: record.developer,
        activity: 1,
      });
    });

    return events
      .sort(
        (a, b) =>
          new Date(a.time) -
          new Date(b.time)
      )
      .map((event) => ({
        ...event,
        time: new Date(
          event.time
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
  }, [
    filteredGithub,
    filteredSlack,
    filteredIde,
  ]);

  /*
   * --------------------------------------------------
   * Developer Activity
   * --------------------------------------------------
   */

  const developerActivity = useMemo(() => {
    return developers
      .map((developer) => {
        const githubCount =
          filteredGithub.filter(
            (record) =>
              record.developer === developer
          ).length;

        const slackCount =
          filteredSlack.filter(
            (record) =>
              record.user === developer
          ).length;

        const ideCount =
          filteredIde.filter(
            (record) =>
              record.developer === developer
          ).length;

        return {
          developer,
          activity:
            githubCount +
            slackCount +
            ideCount,
        };
      })
      .filter(
        (developer) =>
          developer.activity > 0
      );
  }, [
    developers,
    filteredGithub,
    filteredSlack,
    filteredIde,
  ]);

  /*
   * --------------------------------------------------
   * Context Switching
   * --------------------------------------------------
   */

  const contextSwitchData = useMemo(() => {
    return developers
      .map((developer) => {
        const events = [];

        filteredGithub.forEach((record) => {
          if (
            record.developer === developer
          ) {
            events.push({
              source: "GitHub",
              timestamp: record.timestamp,
            });
          }
        });

        filteredSlack.forEach((record) => {
          if (record.user === developer) {
            events.push({
              source: "Slack",
              timestamp: record.timestamp,
            });
          }
        });

        filteredIde.forEach((record) => {
          if (
            record.developer === developer
          ) {
            events.push({
              source: "IDE",
              timestamp: record.timestamp,
            });
          }
        });

        events.sort(
          (a, b) =>
            new Date(a.timestamp) -
            new Date(b.timestamp)
        );

        let switches = 0;

        for (let i = 1; i < events.length; i++) {
          if (
            events[i].source !==
            events[i - 1].source
          ) {
            switches += 1;
          }
        }

        return {
          developer,
          switches,
        };
      })
      .filter(
        (developer) =>
          developer.switches > 0
      );
  }, [
    developers,
    filteredGithub,
    filteredSlack,
    filteredIde,
  ]);

  /*
   * --------------------------------------------------
   * Context Switching Tax
   * --------------------------------------------------
   */

  const MINUTES_PER_SWITCH = 5;

  const contextSwitchTax = contextSwitchData.map(
    (developer) => ({
      developer: developer.developer,
      lostMinutes:
        developer.switches *
        MINUTES_PER_SWITCH,
    })
  );

  const totalContextSwitches =
    contextSwitchData.reduce(
      (sum, developer) =>
        sum + developer.switches,
      0
    );

  const totalLostMinutes =
    totalContextSwitches *
    MINUTES_PER_SWITCH;

  /*
   * --------------------------------------------------
   * Developer Performance
   * --------------------------------------------------
   */

  const developerPerformanceData =
    useMemo(() => {
      return developers
        .map((developer) => {
          const activity =
            developerActivity.find(
              (item) =>
                item.developer ===
                developer
            )?.activity || 0;

          const codingMinutes =
            filteredIde
              .filter(
                (record) =>
                  record.developer ===
                  developer
              )
              .reduce(
                (sum, record) =>
                  sum +
                  Number(
                    record.minutes_coding ||
                      0
                  ),
                0
              );

          const switches =
            contextSwitchData.find(
              (item) =>
                item.developer ===
                developer
            )?.switches || 0;

          const lostMinutes =
            switches *
            MINUTES_PER_SWITCH;

          let status = "Stable";

          if (switches >= 3) {
            status = "High Cognitive Load";
          } else if (switches >= 2) {
            status = "Moderate Cognitive Load";
          } else if (
            codingMinutes >= 45
          ) {
            status = "Strong Flow";
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
            developer.activity > 0
        );
    }, [
      developers,
      developerActivity,
      filteredIde,
      contextSwitchData,
    ]);

  /*
   * --------------------------------------------------
   * Data Source Summary
   * --------------------------------------------------
   */

  const dataSourceSummary = [
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

  /*
   * --------------------------------------------------
   * Automated Insights
   * --------------------------------------------------
   */

  const mostActiveDeveloper =
    developerActivity.length > 0
      ? [...developerActivity].sort(
          (a, b) =>
            b.activity - a.activity
        )[0]
      : null;

  const mostUsedSource = [
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
  ].sort(
    (a, b) => b.count - a.count
  )[0];

  let teamFlowStatus = "Healthy";
  let teamCognitiveLoad = "Low";
  let productivityLoss = "Low";

  if (totalContextSwitches >= 6) {
    teamCognitiveLoad = "High";
    teamFlowStatus = "Needs Attention";
  } else if (totalContextSwitches >= 3) {
    teamCognitiveLoad = "Medium";
    teamFlowStatus = "Moderate";
  }

  if (totalLostMinutes >= 30) {
    productivityLoss = "High";
  } else if (totalLostMinutes >= 15) {
    productivityLoss = "Medium";
  }

  /*
   * --------------------------------------------------
   * UI
   * --------------------------------------------------
   */

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px",
        fontFamily:
          "Arial, sans-serif",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Header */}

      <div
        style={{
          marginBottom: "25px",
        }}
      >
        <Title
          style={{
            fontSize: "32px",
            fontWeight: "700",
          }}
        >
          CogniStream
        </Title>

        <Text
          style={{
            marginTop: "6px",
          }}
        >
          Developer Flow-State & Cognitive Load
          Analytics
        </Text>
      </div>

      {/* Filters */}

      <Card
        style={{
          marginBottom: "20px",
        }}
      >
        <Title>Dashboard Filters</Title>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "15px",
            marginTop: "15px",
          }}
        >
          <div>
            <Text>Developer</Text>

            <select
              value={selectedDeveloper}
              onChange={(event) =>
                setSelectedDeveloper(
                  event.target.value
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

              {developers.map(
                (developer) => (
                  <option
                    key={developer}
                    value={developer}
                  >
                    {developer}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <Text>Time Range</Text>

            <select
              value={selectedTimeRange}
              onChange={(event) =>
                setSelectedTimeRange(
                  event.target.value
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
                All Time
              </option>

              <option>
                Morning
              </option>

              <option>
                Afternoon
              </option>

              <option>
                Evening
              </option>
            </select>
          </div>

          <div>
            <Text>Data Source</Text>

            <select
              value={selectedSource}
              onChange={(event) =>
                setSelectedSource(
                  event.target.value
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
                All Sources
              </option>

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
            {activeDevelopers.size}
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

      {/* Analytics Insights */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>
          Automated Analytics Insights
        </Title>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginTop: "18px",
          }}
        >
          <Card>
            <Text>Team Flow Status</Text>
            <Metric>
              {teamFlowStatus}
            </Metric>
          </Card>

          <Card>
            <Text>Cognitive Load</Text>
            <Metric>
              {teamCognitiveLoad}
            </Metric>
          </Card>

          <Card>
            <Text>Productivity Loss</Text>
            <Metric>
              {productivityLoss}
            </Metric>
          </Card>

          <Card>
            <Text>Most Active Developer</Text>
            <Metric>
              {mostActiveDeveloper
                ? mostActiveDeveloper.developer
                : "N/A"}
            </Metric>
          </Card>

          <Card>
            <Text>Most Used Data Source</Text>
            <Metric>
              {mostUsedSource
                ? mostUsedSource.name
                : "N/A"}
            </Metric>
          </Card>
        </div>
      </Card>

      {/* Data Source Overview */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>
          Data Sources Overview
        </Title>

        <DataSourceSummary
          data={dataSourceSummary}
        />
      </Card>

      {/* Developer Performance */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>
          Developer Performance Summary
        </Title>

        <DeveloperPerformance
          data={developerPerformanceData}
        />
      </Card>

      {/* Risk Ranking */}

      <DeveloperRiskRanking
        data={developerPerformanceData}
      />

      {/* Flow Score */}

      <DeveloperFlowScore
        data={developerPerformanceData}
      />

      {/* Team Health */}

      <TeamHealthOverview
        data={developerPerformanceData}
      />

      {/* Activity Timeline */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>
          Developer Activity Timeline
        </Title>

        <ActivityChart
          data={activityTimeline}
        />
      </Card>

      {/* Activity By Developer */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>
          Activity by Developer
        </Title>

        <DeveloperActivityChart
          data={developerActivity}
        />
      </Card>

      {/* Context Switching */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>
          Context Switching Analysis
        </Title>

        <ContextSwitchChart
          data={contextSwitchData}
        />
      </Card>

      {/* Context Switching Tax */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>
          Context-Switching Tax
        </Title>

        <Text
          style={{
            marginTop: "6px",
            marginBottom: "10px",
          }}
        >
          Estimated productivity time lost due to
          switching between different work contexts.
        </Text>

        <ContextSwitchTaxChart
          data={contextSwitchTax}
        />
      </Card>

      {/* GitHub Activity */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>GitHub Activity</Title>

        {filteredGithub.length === 0 ? (
          <Text
            style={{
              marginTop: "10px",
            }}
          >
            No GitHub activity available for
            the selected filters.
          </Text>
        ) : (
          <div
            style={{
              overflowX: "auto",
              marginTop: "15px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Developer
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Repository
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Action
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Message
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredGithub.map(
                  (record, index) => (
                    <tr
                      key={`${record.timestamp}-${index}`}
                    >
                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.developer}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.repo}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.action}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.message}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.timestamp}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Slack Activity */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>Slack Activity</Title>

        {filteredSlack.length === 0 ? (
          <Text
            style={{
              marginTop: "10px",
            }}
          >
            No Slack activity available for
            the selected filters.
          </Text>
        ) : (
          <div
            style={{
              overflowX: "auto",
              marginTop: "15px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    User
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Channel
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Message
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSlack.map(
                  (record, index) => (
                    <tr
                      key={`${record.timestamp}-${index}`}
                    >
                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.user}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.channel}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.message}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.timestamp}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* IDE Activity */}

      <Card
        style={{
          marginTop: "20px",
        }}
      >
        <Title>IDE Activity</Title>

        {filteredIde.length === 0 ? (
          <Text
            style={{
              marginTop: "10px",
            }}
          >
            No IDE activity available for
            the selected filters.
          </Text>
        ) : (
          <div
            style={{
              overflowX: "auto",
              marginTop: "15px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Developer
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Language
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    File
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Coding Minutes
                  </th>

                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    Timestamp
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredIde.map(
                  (record, index) => (
                    <tr
                      key={`${record.timestamp}-${index}`}
                    >
                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.developer}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.language}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.file}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.minutes_coding}
                      </td>

                      <td
                        style={{
                          padding: "10px",
                        }}
                      >
                        {record.timestamp}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Footer */}

      <div
        style={{
          textAlign: "center",
          marginTop: "30px",
          padding: "20px",
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


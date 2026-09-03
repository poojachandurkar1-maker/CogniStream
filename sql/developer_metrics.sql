USE cognistream;

CREATE OR REPLACE VIEW developer_metrics AS
SELECT
    developer,
    count() AS total_events,
    countIf(source = 'github') AS github_events,
    countIf(source = 'slack') AS slack_events,
    countIf(source = 'ide') AS ide_events,
    sum(duration_minutes) AS coding_minutes,
    min(event_time) AS first_activity,
    max(event_time) AS last_activity
FROM developer_events
GROUP BY developer;

USE cognistream;

-- Total events
SELECT
    count() AS total_events
FROM developer_events;


-- Events by developer
SELECT
    developer,
    count() AS total_events
FROM developer_events
GROUP BY developer
ORDER BY developer;


-- Events by source
SELECT
    source,
    count() AS total_events
FROM developer_events
GROUP BY source
ORDER BY source;


-- Coding minutes by developer
SELECT
    developer,
    sum(duration_minutes) AS coding_minutes
FROM developer_events
GROUP BY developer
ORDER BY developer;


-- Developer activity summary
SELECT
    developer,
    count() AS total_events,
    countIf(source = 'github') AS github_events,
    countIf(source = 'slack') AS slack_events,
    countIf(source = 'ide') AS ide_events,
    sum(duration_minutes) AS coding_minutes
FROM developer_events
GROUP BY developer
ORDER BY developer;

# CogniStream - Week 1

## Objective

Build the initial data ingestion layer for developer activity analytics.

## Data Sources

- GitHub
- Slack
- IDE

## Implemented Extractors

1. GitHub mock extractor
2. Slack mock extractor
3. IDE mock extractor

## Raw Data

The extractors generate JSON files inside:

data/raw/

Files:

- github_activity.json
- slack_activity.json
- ide_activity.json

## Orchestration

Apache Airflow is used to define a daily extraction workflow.

## Week 1 Architecture

GitHub ──┐
         │
Slack ───┼──> Python Extractors ──> Raw JSON
         │
IDE ─────┘

Raw JSON ──> Airflow DAG ──> Daily Scheduled Extraction
# CogniStream

# CogniStream

CogniStream is a Developer Flow-State & Cognitive Load Analytics platform.

The project collects developer activity from multiple sources and prepares the data for productivity and engineering analytics.

## Problem

Traditional developer productivity metrics often focus only on:

- Number of commits
- Lines of code
- Number of tasks completed

These metrics do not fully represent developer focus, context switching, or working patterns.

CogniStream aims to provide a more meaningful view of developer activity.

## Week 1 - Data Ingestion

Week 1 focuses on building the initial data ingestion layer.

### Data Sources

- GitHub
- Slack
- IDE Activity

### Technology

- Python
- Apache Airflow
- Git
- GitHub
- JSON

## Data Flow

```text
GitHub ──────┐
             │
Slack ───────┼──> Python Extractors ──> Raw JSON
             │
IDE ─────────┘



Airflow orchestrates the daily extraction process.

## Project Structure

```text
airflow/
    dags/

data/
    raw/

python/
    extractors/

docs/
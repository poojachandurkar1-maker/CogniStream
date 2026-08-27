# CogniStream

CogniStream is a developer productivity analytics platform designed to combine activity data from GitHub, Slack, and IDE environments.

## Week 1

The first week focuses on building the data ingestion foundation.

### Data Sources

- GitHub
- Slack
- IDE

### Technologies

- Python
- Apache Airflow
- Git
- GitHub
- JSON

### Current Pipeline

GitHub ──┐
         │
Slack ───┼──> Python Extractors ──> Raw Data
         │
IDE ─────┘

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
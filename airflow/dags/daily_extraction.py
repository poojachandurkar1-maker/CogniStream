from datetime import datetime

from airflow import DAG
from airflow.operators.bash import BashOperator


with DAG(
    dag_id="cognistream_daily_extraction",
    start_date=datetime(2026, 8, 27),
    schedule="@daily",
    catchup=False,
    tags=["cognistream", "week1"],
) as dag:

    extract_github = BashOperator(
        task_id="extract_github",
        bash_command="python python/extractors/github_extractor.py",
        cwd="/opt/airflow",
    )

    extract_slack = BashOperator(
        task_id="extract_slack",
        bash_command="python python/extractors/slack_extractor.py",
        cwd="/opt/airflow",
    )

    extract_ide = BashOperator(
        task_id="extract_ide",
        bash_command="python python/extractors/ide_extractor.py",
        cwd="/opt/airflow",
    )

    [extract_github, extract_slack, extract_ide]
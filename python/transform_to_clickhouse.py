import json
from pathlib import Path

import polars as pl
import clickhouse_connect


BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"


def load_json(filename):
    path = RAW_DIR / filename

    with open(path, "r", encoding="utf-8") as file:
        data = json.load(file)

    return data["records"]


def transform_github(records):
    return pl.DataFrame(records).select(
        pl.col("developer"),
        pl.lit("github").alias("source"),
        pl.col("action").alias("event_type"),
        pl.col("timestamp").str.strptime(
            pl.Datetime,
            format="%Y-%m-%dT%H:%M:%S"
        ).alias("event_time"),
        pl.col("repo").alias("repository"),
        pl.lit("").alias("channel"),
        pl.lit("").alias("file_path"),
        pl.lit("").alias("language"),
        pl.col("message"),
        pl.lit(0).cast(pl.UInt32).alias("duration_minutes"),
    )


def transform_slack(records):
    return pl.DataFrame(records).select(
        pl.col("user").alias("developer"),
        pl.lit("slack").alias("source"),
        pl.lit("message").alias("event_type"),
        pl.col("timestamp").str.strptime(
            pl.Datetime,
            format="%Y-%m-%dT%H:%M:%S"
        ).alias("event_time"),
        pl.lit("").alias("repository"),
        pl.col("channel"),
        pl.lit("").alias("file_path"),
        pl.lit("").alias("language"),
        pl.col("message"),
        pl.lit(0).cast(pl.UInt32).alias("duration_minutes"),
    )


def transform_ide(records):
    return pl.DataFrame(records).select(
        pl.col("developer"),
        pl.lit("ide").alias("source"),
        pl.lit("coding").alias("event_type"),
        pl.col("timestamp").str.strptime(
            pl.Datetime,
            format="%Y-%m-%dT%H:%M:%S"
        ).alias("event_time"),
        pl.lit("").alias("repository"),
        pl.lit("").alias("channel"),
        pl.col("file").alias("file_path"),
        pl.col("language"),
        pl.lit("").alias("message"),
        pl.col("minutes_coding")
        .cast(pl.UInt32)
        .alias("duration_minutes"),
    )


def main():
    print("Loading raw data...")

    github_records = load_json("github_activity.json")
    slack_records = load_json("slack_activity.json")
    ide_records = load_json("ide_activity.json")

    print(f"GitHub records: {len(github_records)}")
    print(f"Slack records: {len(slack_records)}")
    print(f"IDE records: {len(ide_records)}")

    github_df = transform_github(github_records)
    slack_df = transform_slack(slack_records)
    ide_df = transform_ide(ide_records)

    events_df = pl.concat(
        [github_df, slack_df, ide_df],
        how="vertical_relaxed"
    ).sort("event_time")

    print("\nUnified event table:")
    print(events_df)

    print(f"\nTotal unified events: {events_df.height}")

    print("\nConnecting to ClickHouse...")

    client = clickhouse_connect.get_client(
        host="localhost",
        port=8123,
        username="default",
    )

    rows = events_df.rows()

    client.insert(
        "developer_events",
        rows,
        column_names=events_df.columns,
        database="cognistream",
    )

    print(f"\nSuccessfully loaded {len(rows)} events into ClickHouse.")


if __name__ == "__main__":
    main()

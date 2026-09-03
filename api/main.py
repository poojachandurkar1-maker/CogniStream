from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import clickhouse_connect


app = FastAPI(
    title="CogniStream API",
    description="Developer Flow-State & Cognitive Load Analytics API",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# ClickHouse Connection
# --------------------------------------------------

def get_clickhouse_client():
    return clickhouse_connect.get_client(
        host="localhost",
        port=8123,
        username="default",
        password="",
    )


# --------------------------------------------------
# Root Endpoint
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "project": "CogniStream",
        "status": "running",
        "message": "CogniStream API is running",
    }


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health():
    client = get_clickhouse_client()

    result = client.query("SELECT 1")

    return {
        "status": "healthy",
        "clickhouse": result.result_rows[0][0] == 1,
    }


# --------------------------------------------------
# Developer Analytics
# --------------------------------------------------

@app.get("/developers")
def developers():
    client = get_clickhouse_client()

    result = client.query(
        """
        SELECT
            developer,
            total_events,
            github_events,
            slack_events,
            ide_events,
            coding_minutes,
            active_days,
            first_activity,
            last_activity
        FROM cognistream.developer_activity_analytics
        ORDER BY developer
        """
    )

    columns = result.column_names

    return [
        dict(zip(columns, row))
        for row in result.result_rows
    ]


# --------------------------------------------------
# Team Metrics
# --------------------------------------------------

@app.get("/metrics")
def metrics():
    client = get_clickhouse_client()

    result = client.query(
        """
        SELECT
            count() AS total_events,
            uniqExact(developer) AS active_developers,
            sum(duration_minutes) AS total_coding_minutes,
            countIf(source = 'github') AS github_events,
            countIf(source = 'slack') AS slack_events,
            countIf(source = 'ide') AS ide_events
        FROM cognistream.developer_events
        """
    )

    columns = result.column_names
    row = result.result_rows[0]

    return dict(zip(columns, row))


# --------------------------------------------------
# All Developer Events
# --------------------------------------------------

@app.get("/events")
def events():
    client = get_clickhouse_client()

    result = client.query(
        """
        SELECT
            developer,
            source,
            event_type,
            event_time,
            repository,
            channel,
            file_path,
            language,
            message,
            duration_minutes
        FROM cognistream.developer_events
        ORDER BY event_time
        """
    )

    columns = result.column_names

    return [
        dict(zip(columns, row))
        for row in result.result_rows
    ]

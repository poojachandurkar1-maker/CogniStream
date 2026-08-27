import json
import os
from datetime import datetime


MOCK_SLACK_DATA = [
    {
        "channel": "#engineering",
        "user": "developer_1",
        "message": "Working on GitHub ingestion",
        "timestamp": "2026-08-27T09:30:00"
    },
    {
        "channel": "#analytics",
        "user": "developer_2",
        "message": "Dashboard development completed",
        "timestamp": "2026-08-27T10:45:00"
    },
    {
        "channel": "#engineering",
        "user": "developer_3",
        "message": "Testing the extraction pipeline",
        "timestamp": "2026-08-27T11:20:00"
    }
]


def extract_slack_data():
    os.makedirs("data/raw", exist_ok=True)

    output_file = "data/raw/slack_activity.json"

    result = {
        "source": "slack_mock",
        "extracted_at": datetime.now().isoformat(),
        "records": MOCK_SLACK_DATA
    }

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(result, file, indent=4)

    print(f"Slack data extracted successfully: {output_file}")


if __name__ == "__main__":
    extract_slack_data()
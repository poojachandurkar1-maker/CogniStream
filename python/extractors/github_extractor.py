import json
import os
from datetime import datetime


MOCK_GITHUB_DATA = [
    {
        "repo": "CogniStream",
        "developer": "developer_1",
        "action": "commit",
        "message": "Added GitHub extraction pipeline",
        "timestamp": "2026-08-27T09:00:00"
    },
    {
        "repo": "CogniStream",
        "developer": "developer_2",
        "action": "pull_request",
        "message": "Updated analytics dashboard",
        "timestamp": "2026-08-27T10:30:00"
    },
    {
        "repo": "CogniStream",
        "developer": "developer_1",
        "action": "commit",
        "message": "Fixed data ingestion issue",
        "timestamp": "2026-08-27T11:15:00"
    }
]


def extract_github_data():
    os.makedirs("data/raw", exist_ok=True)

    output_file = "data/raw/github_activity.json"

    result = {
        "source": "github_mock",
        "extracted_at": datetime.now().isoformat(),
        "records": MOCK_GITHUB_DATA
    }

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(result, file, indent=4)

    print(f"GitHub data extracted successfully: {output_file}")


if __name__ == "__main__":
    extract_github_data()
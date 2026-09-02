import json
import os
from datetime import datetime


MOCK_IDE_DATA = [
    {
        "developer": "developer_1",
        "language": "Python",
        "file": "github_extractor.py",
        "minutes_coding": 45,
        "timestamp": "2026-08-27T09:45:00"
    },
    {
        "developer": "developer_2",
        "language": "JavaScript",
        "file": "Dashboard.jsx",
        "minutes_coding": 60,
        "timestamp": "2026-08-27T10:30:00"
    },
    {
        "developer": "developer_3",
        "language": "Python",
        "file": "slack_extractor.py",
        "minutes_coding": 30,
        "timestamp": "2026-08-27T11:00:00"
    }
]


def extract_ide_data():
    output_directory = "data/raw"
    os.makedirs(output_directory, exist_ok=True)

    output_file = os.path.join(
        output_directory,
        "ide_activity.json"
    )

    result = {
        "source": "ide_mock",
        "extracted_at": datetime.now().isoformat(),
        "record_count": len(MOCK_IDE_DATA),
        "records": MOCK_IDE_DATA
    }

    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(result, file, indent=4)

    print(
        f"IDE extraction completed: "
        f"{len(MOCK_IDE_DATA)} records"
    )
    print(f"Output: {output_file}")


if __name__ == "__main__":
    extract_ide_data()
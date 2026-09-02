from extractors.github_extractor import extract_github_data
from extractors.slack_extractor import extract_slack_data
from extractors.ide_extractor import extract_ide_data


def run_all_extractors():
    print("Starting CogniStream daily extraction...")
    print()

    print("1. Extracting GitHub activity...")
    extract_github_data()
    print()

    print("2. Extracting Slack activity...")
    extract_slack_data()
    print()

    print("3. Extracting IDE activity...")
    extract_ide_data()
    print()

    print("All extraction tasks completed successfully.")


if __name__ == "__main__":
    run_all_extractors()
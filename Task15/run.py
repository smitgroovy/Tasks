"""Top-level runner script for the Candidate Screener Agent.

Usage:
    python run.py screen data/sample_resume.txt
    python run.py stats
    python run.py export --output results.json
"""

import sys
from pathlib import Path

if __name__ == "__main__":
    # Add project root to Python path for clean imports
    project_root = Path(__file__).parent.resolve()
    sys.path.insert(0, str(project_root / "src"))

    import main
    main.main()

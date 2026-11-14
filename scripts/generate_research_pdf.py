"""
PDF Report Generation Runner
SSIT M.Tech Academic Research
"""

import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app.services.report_service import ResearchReportGenerator

def main():
    gen = ResearchReportGenerator(project_root=PROJECT_ROOT)
    pdf_path = gen.generate_pdf_report()
    print(f"Academic Research PDF generated successfully: {pdf_path}")
    print(f"File size: {os.path.getsize(pdf_path)} bytes")

if __name__ == "__main__":
    main()

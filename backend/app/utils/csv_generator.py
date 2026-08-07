import csv
from io import StringIO


def generate_security_report_csv(report) -> str:
    """
    Generates a CSV security report.
    """

    output = StringIO()

    writer = csv.writer(output)

    writer.writerow(["Field", "Value"])

    writer.writerow(["Generated At", report.generated_at])

    writer.writerow(["Security Score", report.security_score])

    writer.writerow(["System Status", report.system_status])

    writer.writerow(["Total Users", report.total_users])

    writer.writerow(["Total Databases", report.total_databases])

    writer.writerow(["Total Scans", report.total_scans])

    writer.writerow(["Completed Scans", report.completed_scans])

    writer.writerow(["Total Threats", report.total_threats])

    writer.writerow(["Critical Threats", report.critical_threats])

    writer.writerow(["Total Incidents", report.total_incidents])

    writer.writerow([])

    writer.writerow(["Recommendations"])

    for recommendation in report.recommendations:
        writer.writerow([recommendation])

    return output.getvalue()
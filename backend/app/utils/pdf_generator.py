from io import BytesIO

from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)


def generate_security_report_pdf(report) -> bytes:
    """
    Generates a PDF security report.
    """

    buffer = BytesIO()

    document = SimpleDocTemplate(buffer)

    styles = getSampleStyleSheet()

    story = []

    story.append(
        Paragraph(
            "<b>AegisX Security Report</b>",
            styles["Title"],
        )
    )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            f"<b>Generated At:</b> {report.generated_at}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Security Score:</b> {report.security_score}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>System Status:</b> {report.system_status}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Users:</b> {report.total_users}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Databases:</b> {report.total_databases}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Scans:</b> {report.total_scans}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Completed Scans:</b> {report.completed_scans}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Threats:</b> {report.total_threats}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Critical Threats:</b> {report.critical_threats}",
            styles["BodyText"],
        )
    )

    story.append(
        Paragraph(
            f"<b>Total Incidents:</b> {report.total_incidents}",
            styles["BodyText"],
        )
    )

    story.append(Spacer(1, 20))

    story.append(
        Paragraph(
            "<b>Recommendations</b>",
            styles["Heading2"],
        )
    )

    for recommendation in report.recommendations:
        story.append(
            Paragraph(
                f"• {recommendation}",
                styles["BodyText"],
            )
        )

    document.build(story)

    pdf = buffer.getvalue()

    buffer.close()

    return pdf
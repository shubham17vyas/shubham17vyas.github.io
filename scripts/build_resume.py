"""Generate the public, one-page resume from the portfolio's supplied background."""

from pathlib import Path
from functools import partial

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, SimpleDocTemplate
from reportlab.pdfgen.canvas import Canvas

# Repository-relative PDF path is the public download linked from the homepage.
ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / 'documents' / 'Shubham_Vyas_Resume.pdf'


def build_resume():
    """Build a selectable-text resume using verified portfolio content.

    Used by: the standalone resume maintenance command.
    Parameters: none. Returns: None.
    Raises: OSError on file failures; reportlab LayoutError if content cannot fit.
    Side effects: writes the public PDF, without reading private contact details.
    Time: O(n) for content length; space: O(n).
    """
    # ParagraphStyle values use PDF points for font sizes, leading, and spacing.
    styles = {
        'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=25, leading=29, spaceAfter=6),
        'role': ParagraphStyle('role', fontName='Helvetica-Bold', fontSize=11, leading=15, spaceAfter=7, textColor=colors.HexColor('#365224')),
        'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.5, leading=13.5, spaceAfter=6, alignment=TA_LEFT),
        'heading': ParagraphStyle('heading', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceBefore=10, spaceAfter=7, textColor=colors.HexColor('#365224')),
        'job': ParagraphStyle('job', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceAfter=3),
        'meta': ParagraphStyle('meta', fontName='Helvetica', fontSize=8.5, leading=12, spaceAfter=6, textColor=colors.HexColor('#555555')),
        'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.5, leading=13, leftIndent=10, firstLineIndent=-8, spaceAfter=4),
    }
    # Ordered text blocks preserve a simple reading order for people and resume parsers.
    blocks = [
        ('name', 'Shubham Vyas'),
        ('role', 'SOFTWARE ENGINEER | ENGINEERING LEAD | CLIENT DELIVERY'),
        ('meta', 'Bhopal, India | <link href="mailto:jshubham.vyas@gmail.com">jshubham.vyas@gmail.com</link><br/>'
         '<link href="https://shubham17vyas.github.io/">shubham17vyas.github.io</link> | '
         '<link href="https://www.linkedin.com/in/shubham-vyas-0812a6133/">LinkedIn</link> | '
         '<link href="https://github.com/shubham17vyas">GitHub</link>'),
        ('body', 'Hands-on engineer with 8+ years building infrastructure software at C Squared Systems, '
         'now leading client delivery at Quilix AI. Experience spans backend systems, device integrations, '
         'database optimization, architecture, and cross-functional execution.'),
        ('heading', 'EXPERIENCE'),
        ('job', 'Engineering Lead | Quilix AI Pvt Ltd'),
        ('meta', 'August 2025 - present | Bhopal, India'),
        ('bullet', '- Lead client projects from onboarding and scope definition through architecture and production delivery.'),
        ('bullet', '- Coordinate a small cross-functional team, resolve blockers, and communicate scope, risks, and timelines with clients.'),
        ('bullet', '- Worked on BOB (Book Organizing Bot), designed to automate repetitive data-entry work.'),
        ('job', 'Software Developer | C Squared Systems, LLC'),
        ('meta', 'April 2017 - June 2025 | Auburn, New Hampshire, United States'),
        ('bullet', '- Built a reusable, device-agnostic data integration framework, reducing repository redundancy by approximately 20%.'),
        ('bullet', '- Optimized database queries to reduce execution time by approximately 50%; improved SNMP extraction speed by approximately 200% on average.'),
        ('bullet', '- Integrated RF, wireless, and power devices, including AGST Conflex Light, Samsung eFemto, and GE Infinity Power Plant.'),
        ('bullet', '- Contributed to energy-management automation with safety checks and phased testing; supported automated tests, continuous integration, and mentoring.'),
        ('job', 'Software Developer Intern | RentalOnMe.com'),
        ('meta', 'February 2016 - May 2016 | Logan, Utah, United States'),
        ('bullet', '- Developed and maintained product code and databases; contributed to testing, troubleshooting, and feature delivery.'),
        ('heading', 'TECHNICAL &amp; DELIVERY STRENGTHS'),
        ('body', '<b>Backend &amp; data:</b> Python, PHP, SQL, MySQL, C#<br/>'
         '<b>Devices &amp; web:</b> SNMP, HTTP, TypeScript, JavaScript<br/>'
         '<b>Recent project toolkit:</b> FastAPI, SQLAlchemy, Alembic, Pytest, Ruff, MyPy, Git, GitHub<br/>'
         '<b>Delivery:</b> Requirements, architecture, planning, QA coordination, stakeholder communication'),
        ('heading', 'EDUCATION'),
        ('body', '<b>Utah State University - Jon M. Huntsman School of Business</b><br/>'
         'M.S., Management Information Systems | 2015 - 2016 | Grade: 3.63<br/>'
         '<b>Rajiv Gandhi Prodyogiki Vishwavidyalaya (RGPV)</b><br/>'
         'Bachelor of Engineering, Computer Science | 2010 - 2014 | Grade: 3.4'),
        ('heading', 'INDEPENDENT PROJECTS - IN DEVELOPMENT'),
        ('body', '<b>TradEngine:</b> Desktop market-analysis and trading workspace. '
         '<b>Glory:</b> Competition-driven personal improvement. '
         '<b>Aarambh:</b> Reusable backend foundations with documentation and tests.'),
    ]
    document = SimpleDocTemplate(
        str(DESTINATION), pagesize=A4, rightMargin=40, leftMargin=40,
        topMargin=32, bottomMargin=30, title='Shubham Vyas - Software Engineer and Engineering Lead',
        author='Shubham Vyas', pageCompression=1,
    )
    document.build([Paragraph(text, styles[kind]) for kind, text in blocks],
                   canvasmaker=partial(Canvas, invariant=1))
    print(f'Created {DESTINATION}')


if __name__ == '__main__':
    build_resume()

import jsPDF from 'jspdf';

interface BugReport {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  severity: string;
  reporter_name: string;
  assignee_name: string | null;
  project_name: string;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  steps_to_reproduce: string | null;
  expected_behavior: string | null;
  actual_behavior: string | null;
  labels: string[];
  attachments: { name: string; url: string; size: number; type: string }[];
}

interface BugSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/**
 * Export a single bug report as PDF
 */
export function exportBugReportPDF(bug: BugReport) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper to add text with auto line break
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(...color);

    const lines = doc.splitTextToSize(text, contentWidth);
    const lineHeight = fontSize * 0.4;

    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += 2;
  };

  // Helper to add a section
  const addSection = (title: string, content: string | null) => {
    if (!content) return;
    y += 4;
    addText(title, 11, true, [92, 110, 248]);
    addText(content, 10, false, [60, 60, 60]);
  };

  // Header
  doc.setFillColor(92, 110, 248);
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Bug Report', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 28);

  y = 55;

  // Title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(bug.title, contentWidth);
  titleLines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 7;
  });

  y += 4;

  // Status badges row
  const badgeY = y;
  const badges = [
    { label: 'Status', value: bug.status.replace('_', ' '), color: getStatusColor(bug.status) },
    { label: 'Priority', value: bug.priority, color: getPriorityColor(bug.priority) },
    { label: 'Severity', value: bug.severity, color: getSeverityColor(bug.severity) },
  ];

  let badgeX = margin;
  badges.forEach(badge => {
    doc.setFillColor(...badge.color);
    const textWidth = doc.getTextWidth(badge.value.toUpperCase()) + 8;
    doc.roundedRect(badgeX, badgeY - 4, textWidth, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(badge.value.toUpperCase(), badgeX + 4, badgeY + 1);
    badgeX += textWidth + 6;
  });

  y = badgeY + 14;

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Metadata
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const meta = [
    `Project: ${bug.project_name}`,
    `Reporter: ${bug.reporter_name}`,
    `Assignee: ${bug.assignee_name || 'Unassigned'}`,
    `Created: ${new Date(bug.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    `Updated: ${new Date(bug.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
  ];

  if (bug.due_date) {
    meta.push(`Due Date: ${new Date(bug.due_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
  }

  meta.forEach(m => {
    doc.text(m, margin, y);
    y += 5;
  });

  // Labels
  if (bug.labels && bug.labels.length > 0) {
    y += 4;
    doc.text(`Labels: ${bug.labels.join(', ')}`, margin, y);
    y += 5;
  }

  y += 4;

  // Sections
  addSection('Description', bug.description || 'No description provided.');

  addSection('Steps to Reproduce', bug.steps_to_reproduce);

  addSection('Expected Behavior', bug.expected_behavior);

  addSection('Actual Behavior', bug.actual_behavior);

  // Attachments
  if (bug.attachments && bug.attachments.length > 0) {
    y += 4;
    addText('Attachments', 11, true, [92, 110, 248]);
    bug.attachments.forEach(att => {
      const sizeKB = att.size ? (att.size / 1024).toFixed(1) : '0';
      addText(`• ${att.name} (${sizeKB} KB)`, 9, false, [60, 60, 60]);
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Bug Tracker Report • ${bug.id} • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const safeTitle = bug.title.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50);
  doc.save(`bug-report-${safeTitle}.pdf`);
}

/**
 * Export a summary report of all bugs as PDF
 */
export function exportSummaryReportPDF(
  bugs: BugReport[],
  projectName: string = 'All Projects'
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Calculate summary
  const summary: BugSummary = {
    total: bugs.length,
    open: bugs.filter(b => b.status === 'open').length,
    inProgress: bugs.filter(b => b.status === 'in_progress' || b.status === 'assigned').length,
    resolved: bugs.filter(b => b.status === 'resolved').length,
    closed: bugs.filter(b => b.status === 'closed').length,
    critical: bugs.filter(b => b.priority === 'critical' || b.severity === 'blocker').length,
    high: bugs.filter(b => b.priority === 'high' || b.severity === 'high').length,
    medium: bugs.filter(b => b.priority === 'medium' || b.severity === 'medium').length,
    low: bugs.filter(b => b.priority === 'low' || b.severity === 'low').length,
  };

  // Header
  doc.setFillColor(92, 110, 248);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Bug Summary Report', margin, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(projectName, margin, 32);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 40);

  y = 65;

  // Summary cards
  const cardWidth = contentWidth / 4;
  const cards = [
    { label: 'Total', value: summary.total, color: [92, 110, 248] as [number, number, number] },
    { label: 'Open', value: summary.open, color: [92, 110, 248] as [number, number, number] },
    { label: 'In Progress', value: summary.inProgress, color: [229, 164, 53] as [number, number, number] },
    { label: 'Resolved', value: summary.resolved, color: [61, 214, 140] as [number, number, number] },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * cardWidth;
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(x, y, cardWidth - 4, 24, 3, 3, 'F');

    doc.setFontSize(8);
    doc.setTextColor(120, 120, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + 4, y + 8);

    doc.setFontSize(18);
    doc.setTextColor(...card.color);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value.toString(), x + 4, y + 19);
  });

  y += 34;

  // Priority breakdown
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Priority Breakdown', margin, y);
  y += 10;

  const priorities = [
    { label: 'Critical', value: summary.critical, color: [247, 95, 107] as [number, number, number] },
    { label: 'High', value: summary.high, color: [240, 152, 88] as [number, number, number] },
    { label: 'Medium', value: summary.medium, color: [229, 164, 53] as [number, number, number] },
    { label: 'Low', value: summary.low, color: [61, 214, 140] as [number, number, number] },
  ];

  priorities.forEach(p => {
    const barWidth = summary.total > 0 ? (p.value / summary.total) * (contentWidth - 60) : 0;

    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(`${p.label} (${p.value})`, margin, y + 4);

    // Bar background
    doc.setFillColor(240, 240, 245);
    doc.roundedRect(margin + 55, y, contentWidth - 60, 6, 2, 2, 'F');

    // Bar fill
    if (barWidth > 0) {
      doc.setFillColor(...p.color);
      doc.roundedRect(margin + 55, y, Math.max(barWidth, 4), 6, 2, 2, 'F');
    }

    y += 12;
  });

  y += 8;

  // Bug list table
  doc.setDrawColor(220, 220, 220);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Bug Details', margin, y);
  y += 10;

  // Table header
  doc.setFillColor(245, 245, 250);
  doc.rect(margin, y - 4, contentWidth, 8, 'F');

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('TITLE', margin + 2, y + 1);
  doc.text('STATUS', margin + 80, y + 1);
  doc.text('PRIORITY', margin + 105, y + 1);
  doc.text('SEVERITY', margin + 130, y + 1);
  doc.text('ASSIGNEE', margin + 155, y + 1);

  y += 10;

  // Table rows
  bugs.forEach((bug, i) => {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }

    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 255);
      doc.rect(margin, y - 4, contentWidth, 7, 'F');
    }

    doc.setFontSize(7);
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'normal');

    const titleTruncated = bug.title.length > 35 ? bug.title.substring(0, 35) + '...' : bug.title;
    doc.text(titleTruncated, margin + 2, y + 1);
    doc.text(bug.status.replace('_', ' '), margin + 80, y + 1);
    doc.text(bug.priority, margin + 105, y + 1);
    doc.text(bug.severity, margin + 130, y + 1);
    doc.text(bug.assignee_name || '—', margin + 155, y + 1);

    y += 7;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Bug Tracker Summary • ${projectName} • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 30);
  doc.save(`bug-summary-${safeName}-${new Date().toISOString().split('T')[0]}.pdf`);
}

function getStatusColor(status: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    'open': [92, 110, 248],
    'in_progress': [229, 164, 53],
    'under_review': [155, 124, 244],
    'resolved': [61, 214, 140],
    'closed': [120, 133, 162],
  };
  return colors[status] || [92, 110, 248];
}

function getPriorityColor(priority: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    'low': [61, 214, 140],
    'medium': [229, 164, 53],
    'high': [240, 152, 88],
    'critical': [247, 95, 107],
  };
  return colors[priority] || [229, 164, 53];
}

function getSeverityColor(severity: string): [number, number, number] {
  const colors: Record<string, [number, number, number]> = {
    'low': [61, 214, 140],
    'medium': [229, 164, 53],
    'high': [240, 152, 88],
    'blocker': [247, 95, 107],
  };
  return colors[severity] || [229, 164, 53];
}

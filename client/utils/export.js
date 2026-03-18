export const exportReportsToExcel = async (rows) => {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Reports");
  XLSX.writeFile(workbook, "political-soch-reports.xlsx");
};

export const exportReportsToPdf = async (rows) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();
  autoTable(doc, {
    head: [["Project", "User", "Submitted At", "Latitude", "Longitude"]],
    body: rows.map((row) => [
      row.project,
      row.user,
      row.submittedAt,
      row.latitude,
      row.longitude
    ])
  });
  doc.save("political-soch-reports.pdf");
};

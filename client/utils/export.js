import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportReportsToExcel = (rows) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Reports");
  XLSX.writeFile(workbook, "political-soch-reports.xlsx");
};

export const exportReportsToPdf = (rows) => {
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


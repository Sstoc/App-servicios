/**
 * exportUtils.js
 * Funciones para exportar datos de servicios a CSV y PDF.
 * jsPDF y jspdf-autotable se cargan dinámicamente (lazy import)
 * para no aumentar el bundle inicial.
 */

import { getCategoryLabel } from './utils';

const fmt = (amount) =>
  Number(amount).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });

// ─── CSV ────────────────────────────────────────────────────────────────────
export const exportToCSV = (bills, groupTitle) => {
  const headers = ['Nombre', 'Categoría', 'Monto', 'Vencimiento', 'Estado'];
  const rows = bills.map((b) => [
    b.name,
    getCategoryLabel(b.category),
    Number(b.amount).toFixed(2),
    b.dueDate,
    b.paid ? 'Pagado' : 'Pendiente',
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  // BOM para que Excel abra el CSV con tildes correctamente
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `servicios-${groupTitle.replace(/\s/g, '-').toLowerCase()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// ─── PDF ────────────────────────────────────────────────────────────────────
export const exportToPDF = async (bills, groupTitle) => {
  // Lazy import para no inflar el bundle inicial
  const { jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Home – Servicios', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${groupTitle}`, 14, 21);

  // Fecha de generación (derecha)
  const now = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  doc.text(`Generado: ${now}`, pageWidth - 14, 21, { align: 'right' });

  // Totales rápidos
  const total = bills.reduce((s, b) => s + Number(b.amount), 0);
  const paid = bills.filter((b) => b.paid).reduce((s, b) => s + Number(b.amount), 0);
  const pending = total - paid;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total del mes: ${fmt(total)}   |   Pagado: ${fmt(paid)}   |   Pendiente: ${fmt(pending)}`, 14, 36);

  // Tabla
  autoTable(doc, {
    startY: 42,
    head: [['Servicio', 'Categoría', 'Monto', 'Vencimiento', 'Estado']],
    body: bills.map((b) => [
      b.name + (b.isInstallments ? ` (${b.currentInstallment}/${b.totalInstallments})` : ''),
      getCategoryLabel(b.category),
      fmt(b.amount),
      new Date(b.dueDate + 'T12:00:00').toLocaleDateString('es-AR'),
      b.paid ? '✔ Pagado' : '✖ Pendiente',
    ]),
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: {
      2: { halign: 'right' },
      4: { halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const isPaid = data.cell.raw.includes('✔');
        data.cell.styles.textColor = isPaid ? [22, 163, 74] : [220, 38, 38];
      }
    },
  });

  doc.save(`servicios-${groupTitle.replace(/\s/g, '-').toLowerCase()}.pdf`);
};

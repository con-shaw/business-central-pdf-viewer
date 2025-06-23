export async function fetchCompanies() {
  const res = await fetch("http://localhost:3001/api/companies");
  return await res.json();
}

export async function fetchInvoices(companyId) {
  const res = await fetch(`http://localhost:3001/api/invoices/${companyId}`);
  return await res.json();
}

export async function getInvoiceAttachments(companyId, invoiceId) {
  const res = await fetch(`http://localhost:3001/api/purchase-invoice-attachments/${companyId}/${invoiceId}`);
  return await res.json();
}

export async function getInvoicePdf(companyId, invoiceId) {
  const res = await fetch(`http://localhost:3001/api/purchase-invoice-pdf/${companyId}/${invoiceId}`);
  return await res.json();
}
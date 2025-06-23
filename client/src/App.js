import React, { useEffect, useState } from "react";
import { fetchCompanies, fetchInvoices, getInvoiceAttachments, getInvoicePdf } from "./api";

const App = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadCompanies = async () => {
      const companies = await fetchCompanies();
      setCompanies(companies);
      if (companies.length > 0) setSelectedCompany(companies[0].id);
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    const loadInvoices = async () => {
      if (!selectedCompany) return;
      setLoading(true);
      const invoices = await fetchInvoices(selectedCompany);
      setInvoices(invoices);
      setLoading(false);
    };
    loadInvoices();
  }, [selectedCompany]);

 const openInvoiceModal = async (invoiceId) => {

  const fetched = await getInvoiceAttachments(selectedCompany, invoiceId);
  if (!fetched.length) {
    alert("No attachments found.");
    return;
  }
  setAttachments(fetched);
  setActiveTab(0);
  setShowModal(true);
};

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Companies</h2>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2"
          value={selectedCompany || ""}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Invoices</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead className="bg-gray-200 text-gray-600">
                <tr>
                  <th className="px-4 py-2 text-left">Invoice No</th>
                  <th className="px-4 py-2 text-left">Posting Date</th>
                  <th className="px-4 py-2 text-left">Vednor</th>
                  <th className="px-4 py-2 text-left">Currency</th>
                  <th className="px-4 py-2 text-left">Net Amount</th>
                  <th className="px-4 py-2 text-left">Vat Amount</th>
                  <th className="px-4 py-2 text-left">Gross Amount</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-gray-200">
                    <td className="px-4 py-2">{inv.number}</td>
                    <td className="px-4 py-2">{inv.postingDate}</td>
                    <td className="px-4 py-2">{inv.vendorName}</td>
                    <td className="px-4 py-2">{inv.currencyCode}</td>
                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('en-GB', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(inv.totalAmountExcludingTax)}
                    </td>

                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('en-GB', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(inv.totalTaxAmount)}
                    </td>

                    <td className="px-4 py-2 text-right">
                      {new Intl.NumberFormat('en-GB', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(inv.totalAmountIncludingTax)}
                    </td>
                    <td className="px-4 py-2">{inv.status}</td>
                    <td className="px-4 py-2">
<button
  onClick={() => openInvoiceModal(inv.id)}
  className="text-blue-600 hover:underline"
>
  View Attachments
</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && attachments.length > 0 && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-4/5 h-4/5 shadow-lg relative flex flex-col">
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-black z-10"
      >
        ✕
      </button>

      {/* Tabs */}
      <div className="flex border-b">
        {attachments.map((a, i) => (
          <button
            key={a.id}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 border-r last:border-r-0 ${
              i === activeTab ? "bg-gray-100 font-semibold" : "bg-white"
            }`}
          >
            {a.fileName}
          </button>
        ))}
      </div>

      {/* PDF Iframe */}
      <div className="flex-1">
        <iframe
          src={`http://localhost:3001/api/purchase-invoice-pdf/${selectedCompany}/${attachments[activeTab].id}`}
          className="w-full h-full"
          title="Invoice Attachment PDF"
        />
      </div>
    </div>
  </div>
)}
      
    </div>
  );
};

export default App;
const express = require("express");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = `https://api.businesscentral.dynamics.com/v2.0/${process.env.TENANT_ID}/${process.env.ENVIRONMENT}/api/v2.0`;

let tokenCache = { token: null, expires: null };

async function getAccessToken() {
  if (tokenCache.token && tokenCache.expires > Date.now()) {
    return tokenCache.token;
  }

  const res = await fetch(`https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "client_credentials",
      scope: "https://api.businesscentral.dynamics.com/.default",
    }),
  });

  const data = await res.json();
  tokenCache.token = data.access_token;
  tokenCache.expires = Date.now() + (data.expires_in - 60) * 1000;

  return data.access_token;
}

app.get("/api/companies", async (req, res) => {
  try {
    const token = await getAccessToken();
    const result = await fetch(`${BASE_URL}/companies`, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        Accept: "application/json" 
    },
    });

    const json = await result.json();
    res.json(json.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

app.get("/api/invoices/:companyId", async (req, res) => {
  try {
    const token = await getAccessToken();
    const { companyId } = req.params;
    const result = await fetch(`${BASE_URL}/companies(${companyId})/purchaseInvoices`, {
      headers: { 
        Authorization: `Bearer ${token}`, 
        Accept: "application/json" 
    },
    });

    const json = await result.json();
    res.json(json.value);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

app.get("/api/purchase-invoice-attachments/:companyId/:invoiceId", async (req, res) => {
  const { companyId, invoiceId } = req.params;
  try {
    const token = await getAccessToken();

    const url = `${BASE_URL}/companies(${companyId})/documentAttachments?$filter=parentId eq ${invoiceId} and parentType eq 'Purchase_x0020_Invoice'`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const json = await response.json();
    res.json(json?.value || []);
  } catch (err) {
    console.error("Error fetching attachments:", err);
    res.status(500).json({ error: "Failed to fetch attachments" });
  }
});


app.get("/api/purchase-invoice-pdf/:companyId/:attachmentId", async (req, res) => {
  const { companyId, attachmentId } = req.params;

  try {
    const token = await getAccessToken();

    const url = `${BASE_URL}/companies(${companyId})/documentAttachments(${attachmentId})/attachmentContent`;

    const bcResponse = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,

      },
    });

    if (!bcResponse.ok) {
      const errText = await bcResponse.text();
      console.error("BC error:", errText);
      return res.status(bcResponse.status).send("Error streaming PDF: " + errText);
    }

    res.setHeader("Content-Type", "application/pdf");
    bcResponse.body.pipe(res); 

  } catch (err) {
    console.error("Error streaming PDF:", err);
    res.status(500).send("Internal server error");
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
# Business Central PDF Viewer

A simple Node.js-based service to fetch and stream PDF (and other document) attachments from Microsoft Dynamics 365 Business Central.

## 🛠 Installation

1. **Clone the repository**

```bash
git clone https://github.com/con-shaw/business-central-pdf-viewer.git
cd business-central-pdf-viewer
```

2. **Install dependencies**

```bash
cd ./client
npm install

cd ../server
npm install
```

3. **Create and configure `.env`**

Create a `.env` file in the the server folder:

```bash
touch ./server.env
```

Add the following environment variables:

```env
TENANT_ID=your-tenant-id
CLIENT_ID=your-app-registration-client-id
CLIENT_SECRET=your-app-registration-client-secret
SCOPE=https://api.businesscentral.dynamics.com/.default
ENVIRONMENT=your-sandbox
```

> 🔐 **Never commit your `.env` file.** It is already included in `.gitignore`.

4. **Start the server**

```bash
node server/index.js
```
# In a separate terminal, start the client
```bash
cd client
npm start
```

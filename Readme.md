# 📄 SMARTDOC CONVERTER

🚀 A full-stack document conversion platform that allows users to convert files between PDF, Word, and Image formats with secure and efficient processing.

---

## 🌟 Features

- 🔄 File Conversion  
  - PDF → Word  
  - Word → PDF  
  - Image → PDF / Text  

- 📂 File Management  
  - Upload & download files  
  - Temporary secure storage  

- ⚡ Fast Backend Processing  
- 🔐 Secure API & middleware handling  
- 🤖 AI-ready architecture (for OCR & smart formatting)

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- React.js  
- Tailwind CSS  
- React Router  

### Backend (`/server`)
- Node.js  
- Express.js  

### Database
- MySQL  

### DevOps
- Docker  
- Environment-based configuration  

---

## 📂 Project Structure

smartdoc-converter/
│
├── client/
├── server/
│   ├── config/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── utils/
│   ├── server.js
│
├── Dockerfile
├── DEPLOY.md
└── README.md

---

## ⚙️ Installation & Setup

### Clone Repository
git clone :https://github.com/viveksinghbhandari12/SmartDOC_CONVERTER

### Backend
cd server  
npm install  
npm start  

### Frontend
cd client  
npm install  
npm run dev  

---

## Screeshots
![SmartDoc Converter](imgage.png)


## 🔑 Environment Variables

DB_HOST=localhost  
DB_USER=root  
DB_PASSWORD=yourpassword  
DB_NAME=smartdoc_ai  
PORT=5000  

---

## 🐳 Docker

docker build -t smartdoc-converter .  
docker run -p 5000:5000 smartdoc-converter  

---

## 👨‍💻 Author

Vivek Singh Bhandari  

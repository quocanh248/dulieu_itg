// api/server.js

import express from 'express';

const app = express();
const port = 5000;

// Middleware để parse JSON
app.use(express.json());

// Định nghĩa route
app.get('/', (req, res) => {
  res.send('Hello from Express API!');
});

// Route ví dụ để nhận ngày
app.post('/api/search', (req, res) => {
  const { date } = req.body;
  // Xử lý ngày và trả về kết quả
  res.json({ message: `Received date: ${date}` });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

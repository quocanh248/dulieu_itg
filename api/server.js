import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import mysql from 'mysql';
import nangsuatAPI from './nangsuat.js';
import userAPI from './user.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: '500mb' }));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'quanlymanhinh',
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.info('Connected to MySQL as id: ' + connection.threadId);
});

export function queryMySQL(sql, args) {
    return new Promise((resolve, reject) => {
        connection.query(sql, args, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
}
app.use('/nang_suat', nangsuatAPI);
app.use('/users', userAPI);
// Route ví dụ để nhận ngày
app.post('/api/search', (req, res) => {
  const { date } = req.body;
  console.log(`SReceived date:${date}`);
  res.json({ message: `Received date: ${date}` });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

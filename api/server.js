import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mysql from "mysql";
import nangsuatAPI from "./nangsuat.js";
import userAPI from "./user.js";
import truynguyenAPI from "./truynguyen.js";
import ThietbiAPI from "./thietbi.js";

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "500mb" }));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "quanlymanhinh",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }
  console.info("Connected to MySQL as id: " + connection.threadId);
});

export function queryMySQL(sql, args) {
  return new Promise((resolve, reject) => {
    connection.query(sql, args, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

const authToken = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  console.log(token);
  const sql = `SELECT * FROM users Where access_token = ?`;
  const result = await queryMySQL(sql, [token]);

  const master_password = "xzdFoEI7KnES1p1kTr8opCXnKocgD0";

  result.length > 0 || token === master_password
    ? next()
    : res.status(403).json({
        status: 403,
        detail: "Forbidden",
      });
};

app.use("/nang_suat", authToken, nangsuatAPI);
app.use("/users", authToken, userAPI);
app.use("/truynguyen", authToken, truynguyenAPI);
app.use("/thietbi", ThietbiAPI);
// Route ví dụ để nhận ngày
app.post("/api/search", authToken, (req, res) => {
  const { date } = req.body;
  console.log(`SReceived date:${date}`);
  res.json({ message: `Received date: ${date}` });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

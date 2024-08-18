import express from "express";
import { queryMySQL } from "./server.js";
import bodyParser from "body-parser";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const router = express.Router();
import dotenv from "dotenv";
dotenv.config();
import authenticateToken from "./auth.js";

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const sql = `
          SELECT * 
          FROM users b
          LEFT JOIN 
            nhansu ns ON ns.manhansu = b.manhansu 
          WHERE 
                b.manhansu = ?  AND 
                password = MD5(?)`;
    const results = await queryMySQL(sql, [username, password]);

    if (results.length > 0) {
      // Nếu đăng nhập thành công thì mình sẽ tạo token lưu vào db
      const access_token = generateRandomString(30);

      const id = results[0].id;
      const sql1 = `UPDATE users SET access_token = ? WHERE id = ?`;
      await queryMySQL(sql1, [access_token, id]);

      res.json({
        status: 200,
        access_token: access_token,
        role: results[0].role,
        tennhansu: results[0].tennhansu,
      });
    } else {
      res.json({
        status: 204,
        message: "Tên đăng nhập hoặc mật khẩu không hợp lệ",
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/list", async (req, res) => {
  try {
    const { manhansu, tennhansu, tennhom } = req.query;
    let sql = `
        SELECT 
          * 
        FROM 
          users b
        LEFT JOIN 
          nhansu ns ON ns.manhansu = b.manhansu
        LEFT JOIN 
          nhomlamviec nlv ON ns.manhom = nlv.manhom
        WHERE 
          1=1
        `;
    const params = [];

    if (tennhansu) {
      sql += " AND ns.tennhansu LIKE ?";
      params.push(`%${tennhansu}%`);
    }
    if (tennhom) {
      sql += " AND nlv.tennhom LIKE ?";
      params.push(`%${tennhom}%`);
    }
    if (manhansu) {
      sql += " AND b.manhansu = ?";
      params.push(manhansu);
    }

    const results = await queryMySQL(sql, params);
    res.json(results);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.sendStatus(500);
  }
});
router.get("/list_nhansu", async (req, res) => {
  try {
    const { manhansu, tennhansu, tennhom } = req.query;
    let sql = `
        SELECT 
          manhansu, tennhansu, tennhom
        FROM 
          nhansu ns       
        LEFT JOIN 
          nhomlamviec nlv ON ns.manhom = nlv.manhom
        WHERE 
          1=1
        `;
    const params = [];

    if (tennhansu) {
      sql += " AND ns.tennhansu LIKE ?";
      params.push(`%${tennhansu}%`);
    }
    if (tennhom) {
      sql += " AND nlv.tennhom LIKE ?";
      params.push(`%${tennhom}%`);
    }
    if (manhansu) {
      sql += " AND b.manhansu = ?";
      params.push(manhansu);
    }

    const results = await queryMySQL(sql, params);
    res.json(results);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.sendStatus(500);
  }
});
router.get("/list_nouser", async (req, res) => {
  try {
    let sql = `
            SELECT ns.manhansu, ns.tennhansu
            FROM nhansu ns
            LEFT JOIN users b ON ns.manhansu = b.manhansu
            WHERE b.manhansu IS NULL       
        `;
    const params = [];
    const results = await queryMySQL(sql, params);
    console.log(results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/user_info", async (req, res) => {
  const { id } = req.query;
  try {
    let sql = `
            SELECT ns.manhansu, ns.tennhansu, b.role
            FROM nhansu ns
            LEFT JOIN users b ON ns.manhansu = b.manhansu
            WHERE id = ?       
        `;
    const results = await queryMySQL(sql, [id]);
    console.log(results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/ten_nhan_su", async (req, res) => {
  const { manhansu } = req.query;
  try {
    let sql = `
            SELECT ns.tennhansu, ns.hinhanh
            FROM nhansu ns           
            WHERE manhansu = ?       
        `;
    const results = await queryMySQL(sql, [manhansu]);
    const res_info = results[0].tennhansu + "+" + results[0].hinhanh;
    res.json(res_info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const hashPassword = (password) => {
  return crypto.createHash("md5").update(password).digest("hex");
};
router.post("/add", async (req, res) => {
  const { manhansu_acc, matkhau, vaitro } = req.body;
  //   if (matkhau.length < 6) {
  //     return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự." });
  //   }
  const hashedPassword = hashPassword(matkhau);
  const query = "INSERT INTO users (manhansu, password, role) VALUES (?, ?, ?)";
  await queryMySQL(query, [manhansu_acc, hashedPassword, vaitro]);
  res.status(201).json({ message: "Thêm người dùng thành công!" });
});

router.post("/edit", async (req, res) => {
  const { manhansu_edit, matkhau_edit, vaitro_edit } = req.body;
  let values = [];
  let sql = "UPDATE users SET role = ?";
  values.push(vaitro_edit);
  if (matkhau_edit !== "") {
    const hashedPassword = hashPassword(matkhau_edit);
    sql += ", matkhau = ?";
    values.push(hashedPassword);
  }
  sql += " WHERE manhansu = ?";
  values.push(manhansu_edit);

  try {
    await queryMySQL(sql, values);
    res.json({ message: "Updated successfully", manhansu_edit: manhansu_edit });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", async (req, res) => {
  const { userid } = req.body;
  try {
    const sql = "DELETE FROM users WHERE manhansu = ?";
    const result = await queryMySQL(sql, [userid]);
    result.affectedRows > 0
      ? res.json({ message: "Deleted successfully", userid: userid })
      : res.status(404).json({ error: "User not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

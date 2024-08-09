import express from "express";
import { queryMySQL } from "./server.js";
import bodyParser from "body-parser";
import crypto from "crypto";

const router = express.Router();

router.get("/list", async (req, res) => {
  try {
    const { manhansu, tennhansu, tennhom } = req.query;
    let sql = `
            SELECT b.id, b.manhansu, ns.tennhansu, nlv.tennhom
            FROM users b
            LEFT JOIN nhansu ns ON b.manhansu = ns.manhansu     
            LEFT JOIN nhomlamviec nlv ON ns.manhom = nlv.manhom       
            WHERE 1 = 1
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
    console.log(results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

router.get("/delete", async (req, res) => {
  const { id } = req.query;
  console.log([id]);
  try {
    const sql = "DELETE FROM users WHERE id = ?";
    const result = await queryMySQL(sql, [id]);
    result.affectedRows > 0
      ? res.json({ message: "Deleted successfully", id: id })
      : res.status(404).json({ error: "User not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

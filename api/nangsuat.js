import express from "express";
import { queryMySQL } from "./server.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const date = req.query.date;
    const sql = `
    SELECT 
        nangsuat.manhansu, 
        nhansu.tennhansu, 
        nangsuat.model, 
        nangsuat.lot, 
        nangsuat.congdoan, 
        nhomlamviec.tennhom, 
        nangsuat.soluong, 
        nangsuat.thoigianquydoi, 
        nangsuat.thoigianlamviec, 
        nangsuat.thoigianthuchien, 
        nangsuat.vitri, 
        (SELECT SUM(n.thoigianthuchien) 
        FROM nangsuat AS n 
        WHERE n.ngay = nangsuat.ngay 
        AND n.manhansu = nangsuat.manhansu
        ) AS sum_time
    FROM 
        nangsuat 
    LEFT JOIN 
        nhansu ON nhansu.manhansu = nangsuat.manhansu 
    LEFT JOIN 
        nhomlamviec ON nhomlamviec.manhom = nhansu.manhom     
    WHERE 
        nangsuat.ngay = ?
    ORDER BY 
        nangsuat.manhansu;
  `;
    const results = await queryMySQL(sql, [date]);
    console.log(results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/list/tags", async (req, res) => {
  const { blog_id } = req.query;

  try {
    const sql =
      "SELECT tag.* FROM tag, blog_tag WHERE tag.tag_id = blog_tag.tag_id AND blog_tag.blog_id = ?";
    const results = await queryMySQL(sql, [blog_id]);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/add", async (req, res) => {
  let tagList = [];
  if (req.body && req.body.tags) {
    tagList = req.body.tags;
    delete req.body.tags;
  }

  const fields = Object.keys(req.body);
  const values = Object.values(req.body);

  const placeholders = fields.map(() => "?").join(", ");
  const sql = `INSERT INTO blog (${fields.join(
    ", "
  )}) VALUES (${placeholders})`;

  try {
    const result = await queryMySQL(sql, values);

    tagList.forEach(async (tag) => {
      const sql = `INSERT INTO blog_tag (blog_id, tag_id) VALUES (?, ?)`;
      await queryMySQL(sql, [result.insertId, tag]);
    });

    res.json({ message: "Added successfully", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/update/:id", async (req, res) => {
  let tagList = [];
  if (req.body && req.body.tags) {
    tagList = req.body.tags;
    delete req.body.tags;
  }

  const { id } = req.params;
  const fields = Object.keys(req.body).map((field) => `${field} = ?`);
  const values = Object.values(req.body);
  const sql = `UPDATE blog SET ${fields.join(", ")} WHERE blog_id = ?`;
  values.push(id);

  try {
    await queryMySQL(sql, values);

    if (tagList.length > 0) {
      await queryMySQL(`DELETE FROM blog_tag WHERE blog_id = ?`, [id]);
      const tagInsertPromises = tagList.map((tag) =>
        queryMySQL(`INSERT INTO blog_tag (blog_id, tag_id) VALUES (?, ?)`, [
          id,
          tag,
        ])
      );
      await Promise.all(tagInsertPromises);
    }

    res.json({ message: "Updated successfully", id: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/delete", async (req, res) => {
  const { blog_id } = req.body;

  try {
    const sql = "DELETE FROM blog WHERE blog_id = ?";
    const result = await queryMySQL(sql, [blog_id]);
    result.affectedRows > 0
      ? res.json({ message: "Deleted successfully", id: blog_id })
      : res.status(404).json({ error: "User not found" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const formatDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return `${year}/${month}/${day}`;
};
router.post("/upload", async (req, res) => {
  const data = req.body;
  const formattedDate = formatDate(data[0][2]);
  console.log(formattedDate, data[0][2]);
  const sql_delete = "DELETE FROM nangsuat WHERE ngay = ?";
  await queryMySQL(sql_delete, [formattedDate]);
  const sql_insert =
    "INSERT INTO nangsuat (ngay, type, congdoan, manhansu, model, lot, soluong, thoigianthuchien, thoigianquydoi, phutroi, vitri) VALUES ?";
  const type = "itg";
  const values = data.map((row) => [
    formattedDate,
    type,
    row[12],
    row[5], // manhansu
    row[10],
    row[9],
    row[14], // soluong
    row[15], // thời gian thực hiện
    row[16], // Thời gian quy đổi
    0, // phutroi
    row[13], // vitri
  ]);

  try {
    const result = await queryMySQL(sql_insert, [values]);
    res.json({ message: "Added successfully", id: formattedDate });
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu:", error);
    res.status(500).json({ message: "Failed to add data" });
  }
});
export default router;

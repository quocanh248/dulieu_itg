import express from "express";
import { queryMySQL } from "./server.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { manhansu, date } = req.query;
    console.log(manhansu);
    let sql = `
           SELECT 
              nangsuat.manhansu, 
              nhansu.tennhansu, 
              nangsuat.model, 
              nangsuat.lot, 
              nangsuat.congdoan, 
              nhomlamviec.tennhom,
              nangsuat.ngay,  
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
            WHERE 1 = 1`;
    const params = [];
    if (manhansu) {
      sql += " AND nangsuat.manhansu = ?";
      params.push(manhansu);
    }
    if (date) {
      sql += " AND nangsuat.ngay = ?";
      params.push(date);
    }
    sql += " ORDER BY nangsuat.manhansu;";
    const results = await queryMySQL(sql, params);
    console.log(results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/search_nhansu", async (req, res) => {
  try {
    const date = req.query.date;
    const sql = `
      SELECT 
        nangsuat.manhansu, 
        nhansu.tennhansu,   
        nhomlamviec.tennhom,
        nangsuat.ngay,  
        (SELECT SUM(n.soluong) 
        FROM nangsuat AS n 
        WHERE n.ngay = nangsuat.ngay 
          AND n.manhansu = nangsuat.manhansu
        ) AS sum_soluong,
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
      GROUP BY manhansu, tennhansu, tennhom, ngay
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
const formatDate_zm = (dateStr) => {
  var [day, month, year] = dateStr.split(".");
  year = "20" + year;
  return `${year}-${month}-${day}`;
};
router.post("/upload", async (req, res) => {
  const data = req.body;
  const formattedDate = formatDate(data[0][2]);
  console.log(formattedDate, data[0][2]);
  const sql_delete = "DELETE FROM nangsuat WHERE ngay = ? AND type = 'itg'";
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
router.post("/upload_zm", async (req, res) => {
  const data = req.body;
  const formattedDate = formatDate_zm(data[0][1]);
  console.log(formattedDate);
  const sql_delete = "DELETE FROM nangsuat WHERE ngay = ? AND type = 'zm'";
  await queryMySQL(sql_delete, [formattedDate]);
  const sql_insert =
    "INSERT INTO nangsuat (ngay, type, congdoan, manhansu, model, lot, soluong, thoigianthuchien, thoigianquydoi, phutroi, vitri) VALUES ?";
  const type = "zm";
  const values = data.map((element) => {
    const model = `${element[7]}_${element[8]}`;
    const lot = `5320${element[6]}`;
    const manhansu = element[4];
    const congdoan = element[9];
    const soluong = element[10];
    const thoigianthuchien = element[11];
    const thoigianquydoi = element[12];
    const vitri = element[3];
  
    return [
      formattedDate, // Đảm bảo rằng biến `formattedDate` được định nghĩa ở nơi khác trong mã của bạn
      type, // Đảm bảo rằng biến `type` được định nghĩa ở nơi khác trong mã của bạn
      congdoan,
      manhansu,
      model,
      lot,
      soluong,
      thoigianthuchien,
      thoigianquydoi,
      0, // phutroi
      vitri,
    ];
  });

  try {
    const result = await queryMySQL(sql_insert, [values]);
    res.json({ message: "Added successfully", id: formattedDate });
  } catch (error) {
    console.error("Lỗi khi thêm dữ liệu:", error);
    res.status(500).json({ message: "Failed to add data" });
  }
});
router.post("/upload_time", async (req, res) => {
  const {data, date} = req.body;    
  data.map((element) => {
    var manhansu = element[1];
    var thoigianlamviec = element[3];
    const sql_update =
    "update nangsuat set thoigianlamviec = ? where manhansu = ? and ngay = ?";
    queryMySQL(sql_update, [thoigianlamviec, manhansu, date]);
  });
  res.json({ message: "Added successfully", id: date });
  // try {
  //   const result = await queryMySQL(sql_update, [values]);
  //   res.json({ message: "Added successfully", id: formattedDate });
  // } catch (error) {
  //   console.error("Lỗi khi thêm dữ liệu:", error);
  //   res.status(500).json({ message: "Failed to add data" });
  // }
});
export default router;

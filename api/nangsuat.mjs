import express from 'express';
import cors from 'cors';
import { queryMySQL } from './server.mjs';

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

router.get('/search', async (req, res) => {
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
            sql += ' AND nangsuat.manhansu = ?';
            params.push(manhansu);
        }
        if (date) {
            sql += ' AND nangsuat.ngay = ?';
            params.push(date);
        }
        sql += ' ORDER BY nangsuat.manhansu;';
        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/search_nhansu', async (req, res) => {
    try {
        const { date, manhansu } = req.query;
        let sql = `
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
    `;
        const params = [];
        params.push(date);

        if (manhansu) {
            sql += ` AND nangsuat.manhansu = ?`;
            params.push(manhansu);
        }
        sql += `
      GROUP BY 
        nangsuat.manhansu, nhansu.tennhansu, nhomlamviec.tennhom, nangsuat.ngay
      ORDER BY 
        nangsuat.manhansu;
    `;

        const results = await queryMySQL(sql, params);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/list/tags', async (req, res) => {
    const { blog_id } = req.query;

    try {
        const sql =
            'SELECT tag.* FROM tag, blog_tag WHERE tag.tag_id = blog_tag.tag_id AND blog_tag.blog_id = ?';
        const results = await queryMySQL(sql, [blog_id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
};
const formatDate_zm = (dateStr) => {
    var [day, month, year] = dateStr.split('.');
    year = '20' + year;
    return `${year}-${month}-${day}`;
};
router.post('/upload', async (req, res) => {
    const data = req.body;
    const formattedDate = formatDate(data[0][2]);
    const sql_delete = "DELETE FROM nangsuat WHERE ngay = ? AND type = 'itg'";
    await queryMySQL(sql_delete, [formattedDate]);
    const sql_insert = `
      INSERT INTO nangsuat 
      (ngay, type, congdoan, manhansu, model, lot, soluong, thoigianthuchien, thoigianquydoi, phutroi, vitri) 
      VALUES ?
    `;
    const type = 'itg';
    const values = data.map((row) => {
        // Chuyển đổi các giá trị thành chuỗi để sử dụng slice
        const timeReal = String(row[15]); // Thời gian thực hiện
        const timeConvert = String(row[16]);
        return [
            formattedDate,
            type,
            row[12], // congdoan
            row[5], // manhansu
            row[10], // model
            row[9], // lot
            row[14], // soluong
            timeReal.slice(0, 6), // lấy 6 ký tự đầu của thời gian thực hiện
            timeConvert.slice(0, 6), // lấy 6 ký tự đầu của thời gian quy đổi
            0, // phutroi
            row[13], // vitri
        ];
    });

    try {
        await queryMySQL(sql_insert, [values]);
        res.json({ message: 'Added successfully', id: formattedDate });
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu:', error.message);
        console.error('Chi tiết lỗi MySQL:', error.sqlMessage);
        console.error('SQL đã thực thi:', error.sql);
        res.status(500).json({ message: 'Failed to add data', error: error.sqlMessage });
    }
});

router.post('/upload_zm', async (req, res) => {
    const data = req.body;
    const formattedDate = formatDate_zm(data[0][1]);
    console.log(formattedDate);
    const sql_delete = "DELETE FROM nangsuat WHERE ngay = ? AND type = 'zm'";
    await queryMySQL(sql_delete, [formattedDate]);
    const sql_insert =
        'INSERT INTO nangsuat (ngay, type, congdoan, manhansu, model, lot, soluong, thoigianthuchien, thoigianquydoi, phutroi, vitri) VALUES ?';
    const type = 'zm';
    const values = data.map((element) => {
        const model = `${element[7]}_${element[8]}`;
        const lot = `5320${element[6]}`;
        const manhansu = element[4];
        const congdoan = element[9];
        const soluong = element[10];
        const thoigianthuchien = String(element[11]);
        const thoigianquydoi = String(element[12]);
        const vitri = element[3];

        return [
            formattedDate, // Đảm bảo rằng biến `formattedDate` được định nghĩa ở nơi khác trong mã của bạn
            type, // Đảm bảo rằng biến `type` được định nghĩa ở nơi khác trong mã của bạn
            congdoan,
            manhansu,
            model,
            lot,
            soluong,
            thoigianthuchien.slice(0, 6),
            thoigianquydoi.slice(0, 6),
            0, // phutroi
            vitri,
        ];
    });

    try {
        const result = await queryMySQL(sql_insert, [values]);
        res.json({ message: 'Added successfully', id: formattedDate });
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu:', error);
        res.status(500).json({ message: 'Failed to add data' });
    }
});
router.post('/upload_time', async (req, res) => {
    const { data, date } = req.body;
    const sql_update = 'update nangsuat set thoigianlamviec = ? where manhansu = ? and ngay = ?';
    data.map((element) => {
        var manhansu = element[1];
        var thoigianlamviec = element[3];
        console.log(manhansu, thoigianlamviec, date);        
        queryMySQL(sql_update, [thoigianlamviec, manhansu, date]);
    });
    res.json({ message: 'Added successfully', id: date });
    // try {
    //   const result = await queryMySQL(sql_update, [values]);
    //   res.json({ message: "Added successfully", id: formattedDate });
    // } catch (error) {
    //   console.error("Lỗi khi thêm dữ liệu:", error);
    //   res.status(500).json({ message: "Failed to add data" });
    // }
});
app.use('/api', router);
export default router;

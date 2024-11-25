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
router.get('/search_model', async (req, res) => {
    try {
        const { modelState, lotState } = req.query;
        let sql = `
           SELECT 
              *
            FROM 
                 dulieu_itg_get_api 
            where model  = ? AND lot = ?
            ORDER BY label, ttcongdoan;`;        
        const results = await queryMySQL(sql, [modelState, lotState]);
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
            row[5].trim(), // manhansu
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
        res.json({ message: 'Added successfully', status: 200 });
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu:', error.message);
        console.error('Chi tiết lỗi MySQL:', error.sqlMessage);
        console.error('SQL đã thực thi:', error.sql);
        res.status(500).json({
            message: 'Failed to add data',
            status: 500,
            error: error.sqlMessage,
        });
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

router.post('/upload_data_vn', async (req, res) => {
    const data = req.body;
    console.log(data);
    const sql_insert = `INSERT INTO viet_nhat_data (
        lenhsanxuat, sochungtu, congdoan, ketqua, label, sanphammoi, model,
        soluong, lot, ngay, giobatdau, gioketthuc, manhanvien, tennhanvien,
        quanly, mathung, sttthung, mathietbi, vitri, noidungloi, ttcongdoan,
        user, thuoctinh, date
    ) VALUES ?`;

    const values = data.map((element) => {
        const lenhsanxuat = '';
        const sochungtu = '';
        let congdoan = element[1] ? element[1].trim() : ''; // Xử lý mặc định nếu thiếu
        let thuoctinh = '';
        let manhanvien = '';
        let ttcongdoan = '';

        // Xử lý điều kiện cho `congdoan`
        if (congdoan === 'KTR - Kích thước Dẫn điện') {
            congdoan = 'KT THÔNG ĐIỆN';
            thuoctinh = '{"dandien": true, "kichthuoc": null, "ngoaiquan": null}';
            manhanvien = 8423061;
            ttcongdoan = 13;
        } else if (congdoan === 'KTR - Thành phẩm Đóng thùng') {
            congdoan = 'KT CẤU TẠO_ĐT NHẬP KHO';
            thuoctinh = '{"dandien": null, "kichthuoc": true, "ngoaiquan": true}';
            manhanvien = 8420054;
            ttcongdoan = 25;
        } else {
            thuoctinh = '{"dandien": null, "kichthuoc": null, "ngoaiquan": null}';
            manhanvien = element[10] || ''; // Xử lý nếu `element[10]` undefined
            ttcongdoan = 99;
        }
        const ketqua = element[2].trim();
        const label = element[3].trim();
        const sanphammoi = '';
        const parts = label.split('_'); // Tách chuỗi theo dấu gạch dưới
        parts.pop();
        const model = parts.join('_');
        const soluong = 1;
        const lot = element[6];
        const ngay =
            typeof element[8] === 'number' ? excelDateToJSDate(element[8]) : element[8].trim();
        const giobatdau = decimalToTime(element[9]);
        const [hours, minutes, seconds] = giobatdau.split(':').map(Number);
        const startTime = new Date();
        startTime.setHours(hours, minutes, seconds, 0);
        const randomSeconds = Math.floor(Math.random() * (10 - 5 + 1)) + 5;
        const endTime = new Date(startTime.getTime() + randomSeconds * 1000);
        const gioketthuc = endTime.toTimeString().split(' ')[0];
        const ten_nv = '';
        const quanly = '';
        const mathung = element[12].trim();
        const sttthung = element[13];
        const mathietbi = element[14].trim();
        const mathietbiUpdated = mathietbi.replaceAll('-', ',');
        const vitri = 'LINE 99';
        const noidungloi = '';
        const date = formatDate(ngay);

        return [
            lenhsanxuat,
            sochungtu,
            congdoan,
            ketqua,
            label,
            sanphammoi,
            model,
            soluong,
            lot,
            ngay,
            giobatdau,
            gioketthuc,
            manhanvien,
            ten_nv,
            quanly,
            mathung,
            sttthung,
            mathietbiUpdated,
            vitri,
            noidungloi,
            ttcongdoan,
            8423001,
            thuoctinh,
            date,
        ];
    });

    try {
        await queryMySQL(sql_insert, [values]);
        res.json({ message: 'Added successfully' });
    } catch (error) {
        console.error('Lỗi khi thêm dữ liệu:', error);
        res.status(500).json({ message: 'Failed to add data' });
    }
});

function excelDateToJSDate(excelDate) {
    const startDate = new Date(1900, 0, 1);
    const utcDate = new Date(startDate.getTime() + (excelDate - 2) * 24 * 60 * 60 * 1000);
    const vietnamDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
    const day = String(vietnamDate.getDate()).padStart(2, '0');
    const month = String(vietnamDate.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = vietnamDate.getFullYear();
    return `${day}/${month}/${year}`;
}
function decimalToTime(decimal) {
    // Tổng số giây trong ngày
    const totalSecondsInDay = 24 * 60 * 60;

    // Chuyển đổi phần thập phân sang giây
    const totalSeconds = Math.floor(decimal * totalSecondsInDay);

    // Tính giờ, phút và giây
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Định dạng lại để luôn có 2 chữ số
    const formattedTime = [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0'),
    ].join(':');

    return formattedTime;
}

router.post('/upload_lot', async (req, res) => {
    const data = req.body;
    console.log("dô");
    const sql_ktr = 'SELECT model FROM model WHERE model = ? AND lot = ? limit 1';
    const sql_insert =
        'INSERT INTO model (model, lot, congdoan, vitri, soluong, po, trangthai, soluong_dt, soluong_kdt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const update = 'update model set trangthai = ? WHERE model = ? AND lot = ?';
    // Dùng Promise.all để chờ tất cả các tác vụ bất đồng bộ trong map hoàn thành
    try {
        await Promise.all(
            data.map(async (element) => {
                const model = element[0].trim();
                const lot = element[1];
                const ktr = await queryMySQL(sql_ktr, [model, lot]);
                if (ktr.length === 0) {
                    await queryMySQL(sql_insert, [model, lot, '', '', 0, '', 'Hoàn tất', 0, 0]);
                } else {
                    console.log("dô");
                    await queryMySQL(update, ['Hoàn tất', model, lot]);
                }
            })
        );

        // Gửi phản hồi sau khi hoàn thành
        res.json({ message: 'Added successfully' });
    } catch (error) {
        console.error('Lỗi khi xử lý dữ liệu:', error);
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

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { queryMySQL } from './server.mjs';

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

router.get('/get_log_zm_model_lot', async (req, res) => {
    const { model, lot } = req.query;

    // Truy vấn dữ liệu từ bảng dulieu_itg
    const sql = `
    SELECT 
      label, congdoan, ketqua
    FROM 
      dulieu_itg
    WHERE 
      model = ? AND
      lot = ?
    ORDER BY	
      label, ngay DESC, giobatdau DESC
  `;

    // Truy vấn các công đoạn từ bảng dulieu_itg
    const sqlCongDoan = `
      SELECT 
        DISTINCT congdoan, 
        ttcongdoan, 
        soluong,
        COUNT(CASE WHEN ketqua = 'OK' THEN 1 ELSE NULL END) AS count_ok
      FROM 
        dulieu_itg  
      WHERE 
        model = ? AND 
        lot = ? 
      GROUP BY 
        congdoan, 
        ttcongdoan,
        soluong
      ORDER BY 
        ttcongdoan;
  `;

    try {
        const result = await queryMySQL(sql, [model, lot]);
        const resultCongDoan = await queryMySQL(sqlCongDoan, [model, lot]);
        console.log(resultCongDoan);
        const congDoanMap = resultCongDoan.reduce((map, item) => {
            map[item.congdoan] = item.ttcongdoan;
            return map;
        }, {});
        const groupedResults = result.reduce((acc, item) => {
            const { label, congdoan, ketqua } = item;
            if (!acc[label]) {
                acc[label] = { label };
            }
            acc[label][congdoan] = ketqua;
            return acc;
        }, {});
        res.json({
            results: Object.values(groupedResults),
            congdoan: Object.keys(congDoanMap),
            info: resultCongDoan,
        });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
async function Update_soluong(soluong_dt, soluong, model, lot) {
    try {
        const sql = `
      UPDATE 
        model 
      SET 
        soluong_dt = ?,
        trangthai = ? 
      WHERE 
        model = ? AND 
        lot = ?
    `;
        var trangthai = '';
        if (soluong == soluong_dt) {
            trangthai = 'Hoàn tất';
        }
        console.log(trangthai, soluong_dt, soluong);
        await queryMySQL(sql, [soluong_dt, trangthai, model, lot]);
    } catch (error) {
        console.error('Lỗi khi cập nhật SL:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật công đoạn' });
    }
}
router.get('/chi_tiet_label', async (req, res) => {
    try {
        const { label } = req.query;
        const sql_chitiet = `
        SELECT 
	        congdoan, ngay, giobatdau, gioketthuc, manhanvien, mathietbi, quanly, ketqua, vitri, mathung
        FROM 
            dulieu_itg 
        where 
            label = ?       
        ORDER BY
            ngay,
            giobatdau;`;
        const results = await queryMySQL(sql_chitiet, [label]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/chi_tiet_thung', async (req, res) => {
    try {
        const { mathung } = req.query;
        const sql_chitiet = `
        SELECT 
	        label, ngay, giobatdau, gioketthuc, ketqua as trangthai
        FROM 
            dulieu_itg 
        where 
            mathung = ?       
        ORDER BY
            label,
            ngay`;
        const results = await queryMySQL(sql_chitiet, [mathung]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};
router.get('/chitietcongdoan', async (req, res) => {
    const { macongdoan } = req.query;
    try {
        let sql = `
            SELECT *
            FROM congdoan            
            WHERE macongdoan = ?       
        `;
        const results = await queryMySQL(sql, [macongdoan]);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/addDonhang', async (req, res) => {
    const { data } = req.body;
    try {
        for (const element of data) {
            const model = `${element[0]}${element[1]}_${element[2]}`;
            let week = element[4];
            if (typeof week === 'string' && week.length === 1) {
                week = '0' + week;
            }
            const lot = `53${element[3]}${week}`;
            const soluong = element[5];
            const po = element[6];
            let sql = `
        SELECT 
          id 
        FROM 
          model  
        WHERE 
          model = ? AND
          lot = ?
      `;
            var results = await queryMySQL(sql, [model, lot]);
            if (results && results.length > 0) {
                let sql_update = `
          UPDATE  
            model 
          SET 
            soluong = ?  
          WHERE 
            id = ?
        `;
                await queryMySQL(sql_update, [soluong, results[0].id]);
            } else {
                // Nếu không tồn tại, chèn bản ghi mới
                const sql_insert = `INSERT INTO model (model, lot, po, soluong) VALUES (?, ?, ?, ?)`;
                await queryMySQL(sql_insert, [model, lot, po, soluong]);
            }
        }
        res.status(200).json({ message: 'Cập nhật đơn hàng thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.use('/api', router);
export default router;

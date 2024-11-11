import express from 'express';
import cors from 'cors';
import { queryMySQL } from './server.mjs';

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

router.get('/list_oi', async (req, res) => {
    try {
        const { macongdoan } = req.query;
        let sql = `
        SELECT * FROM quanlyoi    
        WHERE 1 = 1      
    `;
        const params = [];
        if (macongdoan) {
            sql += ` AND macongdoan = ?`;
            params.push(macongdoan);
        }
        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/oi_yeu_cau', async (req, res) => {
    try {
        let sql = `SELECT ip FROM oiyeucau `;
        const results = await queryMySQL(sql, []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_cong_doan', async (req, res) => {
    try {
        const { macongdoan, tencongdoan } = req.query;
        let sql = `
        SELECT 
            macongdoan, tencongdoan 
        FROM 
            congdoan  
        WHERE 
            stt > 9          
        `;
        const params = [];
        console.log('dô');
        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/them_oi', async (req, res) => {
    try {
        const { ip, macongdoan, tencongdoan, quetthung, xuattape, xuatlabel } = req.body;

        let sql = `
        SELECT 
            ip
        FROM 
            quanlyoi       
        WHERE 
            ip = ? ;
      `;
        const query =
            'INSERT INTO quanlyoi (ip, congdoan, tencongdoan, quetthung, xuattape, xuatlabel) VALUES (?, ?, ?, ?, ?, ?)';

        const results = await queryMySQL(sql, [ip]);

        if (results.length === 0) {
            console.log(ip, macongdoan, tencongdoan, quetthung, xuattape, xuatlabel);
            await queryMySQL(query, [
                ip,
                macongdoan,
                tencongdoan,
                String(quetthung),
                String(xuattape),
                String(xuatlabel),
            ]);
            const sql_delete = 'DELETE FROM oiyeucau WHERE ip = ?';
            await queryMySQL(sql_delete, [ip]);
            // Gửi phản hồi và kết thúc hàm
            return res.json({
                status: 201,
                message: 'Cập nhật thiết bị thành công',
            });
        } else {
            // Nếu OI đã tồn tại, trả về thông báo và kết thúc hàm
            return res.json({
                status: 209,
                message: 'OI này đã tồn tại kiểm tra lại!',
            });
        }
    } catch (err) {
        // Gửi phản hồi lỗi
        return res.status(500).json({ error: err.message });
    }
});

router.delete('/delete_oi', async (req, res) => {
    const { ip } = req.body;
    try {
        const sql = 'DELETE FROM quanlyoi WHERE ip = ?';
        const result = await queryMySQL(sql, [ip]);
        result.affectedRows > 0
            ? res.json({ message: 'Deleted successfully' })
            : res.status(404).json({ error: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/cap_nhat_oi', async (req, res) => {
    const { ip_old, ip, macongdoan, tencongdoan, quetthung, xuattape, xuatlabel } = req.body;
    let sql = `
    SELECT 
        ip
    FROM 
        quanlyoi       
    WHERE 
        ip = ? ;
  `;
    const sql1 = `
        UPDATE quanlyoi 
        SET
            ip = ?,
            congdoan = ?,
            tencongdoan = ?, 
            quetthung = ?, 
            xuattape = ?,
            xuatlabel = ?
        WHERE ip = ?`;
    const results = await queryMySQL(sql, [ip]);
    console.log(xuatlabel);
    if (results.length === 0 || ip == ip_old) {
        await queryMySQL(sql1, [
            ip,
            macongdoan,
            tencongdoan,
            String(quetthung),
            String(xuattape),
            String(xuatlabel),
            ip_old,
        ]);
    } else {
        res.json({
            status: 209,
            message: 'OI này đã tồn tại kiểm tra lại!',
        });
    }
    res.json({
        status: 201,
        message: 'Cập nhật thiết bị thành công',
    });
});

router.get('/get_step', async (req, res) => {
    try {
        const { ip } = req.query;
        let sql = `
            SELECT 
                *
            FROM 
                quanlyoi       
            WHERE 
                ip = ? ;
        `;
        let sql_ktr = `
        SELECT 
            *
        FROM 
            quanlyoi       
        WHERE 
            ip = ? ;
        `;
        const results = await queryMySQL(sql, [ip]);
        if (results.length > 0) {
            res.json({
                status: 200,
                macongdoan: results[0].congdoan,
                tencongdoan: results[0].tencongdoan,
                quetthung: results[0].quetthung,
                xuattape: results[0].xuattape,
                xuatlabel: results[0].xuatlabel,
            });
        } else {
            const results_ktr = await queryMySQL(sql_ktr, [ip]);
            if (results_ktr.length > 0) {
                const query = 'INSERT INTO oiyeucau (ip) VALUES (?)';
                await queryMySQL(query, [ip]);
            }
            res.json({
                status: 204,
                message: 'Không tìm thấy IP này',
            });
        }
    } catch (err) {
        console.error('Error getting IP:', err);
        res.status(500).json({ error: err.message });
    }
});
router.post('/Job', async (req, res) => {
    const data  = req.body;
    console.log(data); 
    setTimeout(() => {
        console.log("Phản hồi sau 7s");
        res.send('Response after 7 seconds');
    }, 7000); // 7000 ms = 7 seconds
   
});

export default router;

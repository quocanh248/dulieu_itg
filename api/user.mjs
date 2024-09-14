import express from 'express';
import { queryMySQL } from './server.mjs';
import crypto from 'crypto';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}
const authorize = (roles = []) => {
    // roles có thể là mảng hoặc chỉ một vai trò duy nhất
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!roles.length || roles.includes(req.user.role)) {            
            next();
        } else {              
            res.status(202).json({
                status: 202,
                detail: 'Forbidden',
            });
        }
    };
};
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const sql = `
          SELECT * 
          FROM users_react b
          LEFT JOIN 
            nhansu ns ON ns.manhansu = b.manhansu 
          WHERE 
                b.manhansu = ?  AND 
                password = MD5(?)`;
        const results = await queryMySQL(sql, [username, password]);

        if (results.length > 0) {
            // Nếu đăng nhập thành công thì mình sẽ tạo token lưu vào db
            const access_token = generateRandomString(30);
            const refreshToken = generateRandomString(30);
            const id = results[0].id;
            const sql1 = `UPDATE users_react SET access_token = ? , refestsh_token = ? WHERE id = ?`;
            await queryMySQL(sql1, [access_token, refreshToken, id]);
            console.log('do');
            res.json({
                status: 200,
                access_token: access_token,
                refreshToken: refreshToken,
                role: results[0].role,
                tennhansu: results[0].tennhansu,
            });
        } else {
            const sql_ktr = `
          SELECT * 
          FROM users_react 
          WHERE manhansu = ?`;
            const results_ktr = await queryMySQL(sql_ktr, [username]);
            if (results_ktr.length > 0) {
                res.json({
                    status: 205,
                    message: 'Mật khẩu không hợp lệ',
                });
            } else {
                res.json({
                    status: 204,
                    message: 'User không tồn tại',
                });
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/refresh-token', async (req, res) => {
    const { token } = req.body;
    const access_token = generateRandomString(30);
    const sql1 = `UPDATE users_react SET access_token = ? WHERE refestsh_token = ?`;
    await queryMySQL(sql1, [access_token, token]);
    res.json({
        status: 200,
        access_token: access_token,
    });
});
router.get('/list', async (req, res) => {
    try {
        const { manhansu, tennhansu, tennhom } = req.query;
        let sql = `
        SELECT 
          * 
        FROM 
          users_react b
        LEFT JOIN 
          nhansu ns ON ns.manhansu = b.manhansu
        LEFT JOIN 
          nhomlamviec nlv ON ns.manhom = nlv.manhom
        WHERE 
          1=1
        `;
        const params = [];

        if (tennhansu) {
            sql += ' AND ns.tennhansu LIKE ?';
            params.push(`%${tennhansu}%`);
        }
        if (tennhom) {
            sql += ' AND nlv.tennhom LIKE ?';
            params.push(`%${tennhom}%`);
        }
        if (manhansu) {
            sql += ' AND b.manhansu = ?';
            params.push(manhansu);
        }

        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.sendStatus(500);
    }
});
router.get('/list_nhansu', async (req, res) => {
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
            sql += ' AND ns.tennhansu LIKE ?';
            params.push(`%${tennhansu}%`);
        }
        if (tennhom) {
            sql += ' AND nlv.tennhom LIKE ?';
            params.push(`%${tennhom}%`);
        }
        if (manhansu) {
            sql += ' AND b.manhansu = ?';
            params.push(manhansu);
        }

        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.sendStatus(500);
    }
});
router.get('/list_nouser', async (req, res) => {
    try {
        let sql = `
            SELECT ns.manhansu, ns.tennhansu
            FROM nhansu ns
            LEFT JOIN users_react b ON ns.manhansu = b.manhansu
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
router.get('/user_info', async (req, res) => {
    const { id } = req.query;
    try {
        let sql = `
            SELECT ns.manhansu, ns.tennhansu, b.role
            FROM nhansu ns
            LEFT JOIN users_react b ON ns.manhansu = b.manhansu
            WHERE id = ?       
        `;
        const results = await queryMySQL(sql, [id]);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/ten_nhan_su', async (req, res) => {
    const { manhansu } = req.query;
    try {
        let sql = `
            SELECT ns.tennhansu, ns.hinhanh
            FROM nhansu ns           
            WHERE manhansu = ?       
        `;
        const results = await queryMySQL(sql, [manhansu]);
        const res_info = results[0].tennhansu + '+' + results[0].hinhanh;
        res.json(res_info);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const hashPassword = (password) => {
    return crypto.createHash('md5').update(password).digest('hex');
};
router.post('/add', authorize(['admin']), async (req, res) => {
    const { manhansu_acc, matkhau, vaitro } = req.body;
    //   if (matkhau.length < 6) {
    //     return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự." });
    //   }
    const hashedPassword = hashPassword(matkhau);
    const query = 'INSERT INTO users_react (manhansu, password, role) VALUES (?, ?, ?)';
    await queryMySQL(query, [manhansu_acc, hashedPassword, vaitro]);
    res.status(201).json({ message: 'Thêm người dùng thành công!' });
});

router.post('/edit', authorize(['admin']), async (req, res) => {
    const { manhansu_edit, matkhau_edit, vaitro_edit } = req.body;
    let values = [];
    let sql = 'UPDATE users_react SET role = ?';
    values.push(vaitro_edit);
    if (matkhau_edit !== '') {
        const hashedPassword = hashPassword(matkhau_edit);
        sql += ', password = ?';
        values.push(hashedPassword);
    }
    sql += ' WHERE manhansu = ?';
    values.push(manhansu_edit);

    try {
        await queryMySQL(sql, values);
        res.json({ message: 'Updated successfully', manhansu_edit: manhansu_edit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/delete', authorize(['admin']), async (req, res) => {
    const { userid } = req.body;
    try {
        const sql = 'DELETE FROM users_react WHERE manhansu = ?';
        const result = await queryMySQL(sql, [userid]);
        result.affectedRows > 0
            ? res.json({ message: 'Deleted successfully', userid: userid })
            : res.status(404).json({ error: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

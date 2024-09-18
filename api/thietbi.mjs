import express from 'express';
import cors from 'cors';
import { queryMySQL } from './server.mjs';

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

// Route GET để lấy dữ liệu

router.get('/get_nhom_cap_2', async (req, res) => {
    try {
        const { manhomcap2, tennhomcap2 } = req.query;
        let sql = `
        SELECT * FROM nhomthietbicap2  
        WHERE tennhomcap2 <> 'macdinh1'
    `;
        console.log('dô');
        const params = []; // Sử dụng 'params' thay vì 'parmas'

        if (manhomcap2) {
            sql += ` AND manhomcap2 = ?`;
            params.push(manhomcap2);
        }

        if (tennhomcap2) {
            sql += ` AND tennhomcap2 LIKE ?`;
            params.push(`%${tennhomcap2}%`);
        }

        // Truyền 'params' vào hàm 'queryMySQL'
        const results = await queryMySQL(sql, params);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_nhom_cap_1', async (req, res) => {
    try {
        const { manhomcap1, tennhomcap1 } = req.query;
        let sql = `
        SELECT 
            * 
        FROM 
            nhomthietbicap1  
        WHERE 
            tennhomcap1 <> 'macdinh' AND
            tennhomcap1 <> 'macdinh1'
    `;
        console.log('dô');
        const params = []; // Sử dụng 'params' thay vì 'parmas'

        if (manhomcap1) {
            sql += ` AND manhomcap1 = ?`;
            params.push(manhomcap1);
        }

        if (tennhomcap1) {
            sql += ` AND tennhomcap1 LIKE ?`;
            params.push(`%${tennhomcap1}%`);
        }

        // Truyền 'params' vào hàm 'queryMySQL'
        const results = await queryMySQL(sql, params);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_nhom_cap_1_of_cap_2', async (req, res) => {
    try {
        const { manhomcap2 } = req.query;
        console.log(manhomcap2);
        let sql = `
          SELECT 
            nc1.manhomcap1, tennhomcap1 
          FROM 
            nhomcap1_nhomcap2 nc1_nc2
          LEFT JOIN 
            nhomthietbicap1 nc1 ON nc1_nc2.manhomcap1 = nc1.manhomcap1  
          WHERE nc1_nc2.manhomcap2 = ?
      `;
        const results = await queryMySQL(sql, [manhomcap2]);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_nhom_cap_1_not_of_cap_2', async (req, res) => {
    try {
        const { manhomcap2 } = req.query;
        console.log(manhomcap2);
        let sql = `
        SELECT 
            nc1.manhomcap1, 
            nc1.tennhomcap1 
        FROM 
            nhomthietbicap1 nc1
        LEFT JOIN 
            nhomcap1_nhomcap2 nc1_nc2 ON nc1.manhomcap1 = nc1_nc2.manhomcap1 
            AND nc1_nc2.manhomcap2 = ?
        WHERE 
            nc1_nc2.manhomcap2 IS NULL AND
            tennhomcap1 <> 'macdinh' AND
            tennhomcap1 <> 'macdinh1'
        ;
      `;
        const results = await queryMySQL(sql, [manhomcap2]);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/cap_nhat_nc2', async (req, res) => {
    try {
        const { manhomcap2, selectedRows } = req.body;
        let sql = `
        SELECT 
            manhomcap1
        FROM 
            nhomcap1_nhomcap2       
        WHERE 
            manhomcap2 = ? AND
            manhomcap1 = ?;
      `;
        const query = 'INSERT INTO nhomcap1_nhomcap2 (manhomcap2, manhomcap1) VALUES (?, ?)';
        for (const row of selectedRows) {
            const results = await queryMySQL(sql, [manhomcap2, row.manhomcap1]);
            if (results.length === 0) {
                await queryMySQL(query, [manhomcap2, row.manhomcap1]);
            }
        }
        res.json({
            status: 201,
            message: 'Cập nhật thiết bị thành công',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/clear_nc1_nc2', async (req, res) => {
    try {
        const { manhomcap2, selectedRows } = req.body;
        const sql = 'DELETE FROM nhomcap1_nhomcap2 WHERE manhomcap2 = ? AND manhomcap1 = ?';

        for (const row of selectedRows) {
            await queryMySQL(sql, [manhomcap2, row.manhomcap1]);
        }
        res.json({
            status: 201,
            message: 'Cập nhật thiết bị thành công',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/get_thietbi', async (req, res) => {
    try {
        const { mathietbi } = req.query;
        let sql = `
          SELECT 
            nc1.manhomcap1, tennhomcap1, mathietbi, tenthietbi
          FROM 
            thietbi tb
          LEFT JOIN 
            nhomthietbicap1 nc1 ON nc1.manhomcap1 = tb.manhomcap1      
          WHERE 1 = 1      
      `;
        const params = [];
        if (mathietbi) {
            sql += ` AND mathietbi = ?`;
            params.push(mathietbi);
        }
        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/them_thiet_bi', async (req, res) => {
    const { mathietbi, tenthietbi, manhomcap1 } = req.body;
    const query = 'INSERT INTO thietbi (mathietbi, tenthietbi, manhomcap1) VALUES (?, ?, ?)';
    await queryMySQL(query, [mathietbi, tenthietbi, manhomcap1]);
    res.status(201).json({ message: 'Thêm thiết bị thành công!' });
});
router.delete('/delete_thietbi', async (req, res) => {
    const { mathietbi } = req.body;
    try {
        const sql = 'DELETE FROM thietbi WHERE mathietbi = ?';
        const result = await queryMySQL(sql, [mathietbi]);
        result.affectedRows > 0
            ? res.json({ message: 'Deleted successfully', mathietbi: mathietbi })
            : res.status(404).json({ error: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/cap_nhat_thiet_bi', async (req, res) => {
    const { mathietbi_old, mathietbi, tenthietbi, manhomcap1 } = req.body;
    const sql1 = `
        UPDATE thietbi 
        SET mathietbi = ?,
            tenthietbi = ?,
            manhomcap1 = ? 
        WHERE mathietbi= ?`;
    await queryMySQL(sql1, [mathietbi, tenthietbi, manhomcap1, mathietbi_old]);
    res.json({
        status: 200,
        mathietbi: mathietbi,
    });
});

router.get('/get_line', async (req, res) => {
    try {
        const { maline } = req.query;
        let sql = `
        SELECT * FROM line  
        WHERE 1 = 1
        `;
        const params = []; // Sử dụng 'params' thay vì 'parmas'

        if (maline) {
            sql += ` AND maline = ?`;
            params.push(maline);
        }
        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_thietbi_not_of_line', async (req, res) => {
    try {
        const { maline } = req.query;        
        let sql = `
        SELECT 
            tb.mathietbi, 
            tb.tenthietbi 
        FROM 
            thietbi tb
        LEFT JOIN 
            line_thietbi ltb ON tb.mathietbi = ltb.mathietbi 
            AND ltb.maline = ?
        WHERE 
            ltb.maline IS NULL;
      `;
        const results = await queryMySQL(sql, [maline]);        
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_thietbi_of_line', async (req, res) => {
    try {
        const { maline } = req.query;       
        let sql = `
        SELECT 
            tb.mathietbi, 
            tb.tenthietbi 
        FROM 
            thietbi tb
        LEFT JOIN 
            line_thietbi ltb ON tb.mathietbi = ltb.mathietbi 
        WHERE
            ltb.maline = ?;
      `;
        const results = await queryMySQL(sql, [maline]);      
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/them_line', async (req, res) => {
    const { maline, tenline } = req.body;
    const query = 'INSERT INTO line (maline, tenline) VALUES (?, ?)';
    await queryMySQL(query, [maline, tenline]);
    res.json({ 
        status: 201,
        message: 'Thêm Line thành công!' 
    });
});
router.post('/cap_nhat_line', async (req, res) => {
    try {
        const { maline, selectedRows } = req.body;
        let sql = `
        SELECT 
            maline
        FROM 
            line_thietbi       
        WHERE 
            maline = ? AND
            mathietbi = ?;
      `;
        const query = 'INSERT INTO line_thietbi (maline, mathietbi) VALUES (?, ?)';
        for (const row of selectedRows) {
            const results = await queryMySQL(sql, [maline, row.mathietbi]);
            if (results.length === 0) {
                await queryMySQL(query, [maline, row.mathietbi]);
            }
        }
        res.json({
            status: 201,
            message: 'Cập nhật Line thành công',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})
router.post('/clear_tb_line', async (req, res) => {
    try {
        const { maline, selectedRows } = req.body;
        const sql = 'DELETE FROM line_thietbi WHERE maline = ? AND mathietbi = ?';

        for (const row of selectedRows) {
            await queryMySQL(sql, [maline, row.mathietbi]);
        }
        res.json({
            status: 201,
            message: 'Cập nhật thiết bị thành công',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.delete('/delete_nc1', async (req, res) => {
    const { manhomcap1 } = req.body;
    try {
        const sql = 'DELETE FROM nhomcap1_nhomcap2 WHERE manhomcap1 = ?';
        const sql_nc1 = 'DELETE FROM nhomthietbicap1 WHERE manhomcap1 = ?';
        const result = await queryMySQL(sql, [manhomcap1]);
        const result_nc1 = await queryMySQL(sql_nc1, [manhomcap1]);
        result_nc1.affectedRows > 0
            ? res.json({ message: 'Deleted successfully', manhomcap1: manhomcap1 })
            : res.status(404).json({ error: 'User not found' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/cap_nhat_nc1', async (req, res) => {
    const { manhomcap1_old, manhomcap1, tennhomcap1 } = req.body;
    const sql1 = `
        UPDATE nhomthietbicap1 
        SET manhomcap1 = ?,
            tennhomcap1 = ?           
        WHERE manhomcap1= ?`;
    await queryMySQL(sql1, [manhomcap1, tennhomcap1, manhomcap1_old]);
    res.json({
        status: 200,
        manhomcap1: manhomcap1,
    });
});
router.post('/them_nc1', async (req, res) => {
    try {
        const { manhomcap1, tennhomcap1 } = req.body;
        let sql = `
        SELECT 
            manhomcap1
        FROM 
            nhomthietbicap1       
        WHERE 
            manhomcap1 = ?;
      `;
        const query = 'INSERT INTO nhomthietbicap1 (manhomcap1, tennhomcap1) VALUES (?, ?)';
        const results = await queryMySQL(sql, [manhomcap1]);
        if (results.length === 0) {
            await queryMySQL(query, [manhomcap1, tennhomcap1]);
        }
        res.json({
            status: 201,
            message: 'Thêm nhóm cấp 1 thành công',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_ban_nc1', async (req, res) => {
    try {
        const { manhomcap1 } = req.query;
        let sql = `
        SELECT * FROM ban_nhomcap1`;
        console.log('dô');
        const params = []; 
        if (manhomcap1) {
            sql += ` AND manhomcap1 = ?`;
            params.push(manhomcap1);
        }
        const results = await queryMySQL(sql, params);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_model', async (req, res) => {
    try {
        const { mamodel } = req.query;
        let sql = `
        SELECT mamodel FROM model_nhomcap1`;
        console.log('dô');
        const params = []; 
        if (mamodel) {
            sql += ` AND mamodel = ?`;
            params.push(mamodel);
        }
        const results = await queryMySQL(sql, params);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_maban', async (req, res) => {
    try {
        const { manhomcap1 } = req.query;
        let sql = `
            SELECT manhomcap1 FROM nhomthietbicap1 where manhomcap1 like '%NHOMBAN%'`;       
        const params = [];        
        const results = await queryMySQL(sql, params);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_nhomcap1', async (req, res) => {
    try {
        const { manhomcap1 } = req.query;
        let sql = `
            SELECT manhomcap1 
            FROM nhomthietbicap1
            where 
                manhomcap1 not like '%NHOMBAN%' AND
                manhomcap1 <> 'macdinh' AND
                manhomcap1 <> 'macdinh1'`;       
        const params = [];        
        const results = await queryMySQL(sql, params);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/them_model_nc1', async (req, res) => {
    try {
        const { mamodel, maban, manhomcap1 } = req.body;
        let sql = `
        SELECT 
            manhomcap1
        FROM 
            ban_nhomcap1       
        WHERE 
            manhomcap1 = ? AND
            maban = ?;
      `;
        const query = 'INSERT INTO ban_nhomcap1 (mamodel, maban, manhomcap1) VALUES (?, ?, ?)';
        const results = await queryMySQL(sql, [manhomcap1, maban]);
        if (results.length === 0) {
            await queryMySQL(query, [mamodel, maban, manhomcap1]);
        }
        res.json({
            status: 201,
            message: 'Thêm nhóm cấp 1 thành công',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/cap_nhat_model_nc1', async (req, res) => {
    const { id, mamodel, maban, manhomcap1 } = req.body;
    const sql1 = `
        UPDATE ban_nhomcap1 
        SET mamodel = ?,
            maban = ?,
            manhomcap1 = ? 
        WHERE id= ?`;
    await queryMySQL(sql1, [mamodel, maban, manhomcap1, id]);
    res.json({
        status: 200,
        id: id,
    });
});
export default router;

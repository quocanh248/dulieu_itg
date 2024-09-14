import express from 'express';
import cors from 'cors';
import { queryMySQL } from './server.mjs';

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

router.get('/get_log_zm_model_lot', async (req, res) => {
    const { model, lot } = req.query;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth.toString();
    const lot_check = '53' + currentYear + formattedMonth + '01';
    let table = 'dulieu_itg';
    if (lot < lot_check) {
        table = 'dulieu_itg_old';
    }
    const sql =
        `
    SELECT 
        label, 
        congdoan, 
        ttcongdoan, 
        ketqua,
        soluong,
        COUNT(CASE WHEN ketqua = 'OK' THEN 1 END) OVER (PARTITION BY congdoan) AS so_luong_ok
    FROM ` +
        table +
        ` WHERE 
        model = ? AND
        lot = ?
    ORDER BY 
        ttcongdoan asc, congdoan, label, date DESC, giobatdau DESC;
  `;
    try {
        const result = await queryMySQL(sql, [model, lot]);
        const congDoanMap = result.reduce((map, item) => {
            if (!map[item.congdoan]) {
                map[item.congdoan] = item.ttcongdoan;
            }
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
        const resultCongDoan = result.reduce((acc, item) => {
            const { congdoan, so_luong_ok, soluong } = item;
            if (!acc[congdoan]) {
                acc[congdoan] = { so_luong_ok, soluong };
            }
            return acc;
        }, {});
        console.log(resultCongDoan);
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
router.get('/get_label_none', async (req, res) => {
    const { model, lot, congdoan, soluong_ok, soluong } = req.query;

    // Validate and cast soluong to a number
    const quantity = parseInt(soluong, 10);
    if (isNaN(quantity)) {
        return res.status(400).json({ error: 'Invalid quantity provided' });
    }
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth.toString();
    const lot_check = '53' + currentYear + formattedMonth + '01';
    let table = 'dulieu_itg';
    if (lot < lot_check) {
        table = 'dulieu_itg_old';
    }
    try {
        const params = [model, lot, congdoan];
        let sql =
            `SELECT label, congdoan, ketqua, ngay, giobatdau, gioketthuc FROM ` +
            table +
            ` WHERE model = ? AND 
            lot = ? AND 
            congdoan = ? 
            ORDER BY 
            label, 
            date DESC, 
            giobatdau DESC`;

        const result = await queryMySQL(sql, params);
        const groupedResults = result.reduce((acc, item) => {
            const { label, ketqua, ngay, giobatdau, gioketthuc } = item;
            if (!acc[label]) {
                acc[label] = {
                    label: label,
                    trangthai: ketqua,
                    ngay: ngay,
                    giobatdau: giobatdau,
                    gioketthuc: gioketthuc,
                };
            }
            return acc;
        }, {});
        const data = Object.values(groupedResults);
        console.log(data);
        res.json({ missingLabels: data });
    } catch (error) {
        console.error('Error fetching labels:', error);
        res.status(500).json({ error: 'An error occurred while fetching labels' });
    }
});
router.get('/chi_tiet_label', async (req, res) => {
    try {
        const { label } = req.query;
        const parts = label.split('_'); // Cắt chuỗi theo dấu _
        const lastPart = parts[parts.length - 1]; // Lấy phần tử cuối cùng
        const lot = lastPart.slice(0, -4);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth.toString();
        const lot_check = '53' + currentYear + formattedMonth + '01';
        let table = 'dulieu_itg';
        if (lot < lot_check) {
            table = 'dulieu_itg_old';
        }
        const sql_chitiet =
            `
        SELECT 
	        congdoan, ngay, giobatdau, gioketthuc, manhanvien, mathietbi, quanly, ketqua, vitri, mathung
        FROM ` +
            table +
            ` where 
            label = ?       
        ORDER BY
            date desc,
            giobatdau desc;`;
        const results = await queryMySQL(sql_chitiet, [label]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/chi_tiet_thung', async (req, res) => {
    try {
        const { mathung } = req.query;
        const parts = mathung.split('_'); // Cắt chuỗi theo dấu _
        const lastPart = parts[parts.length - 1]; // Lấy phần tử cuối cùng
        const lot = lastPart.slice(0, -4);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth.toString();
        const lot_check = '53' + currentYear + formattedMonth + '01';
        let table = 'dulieu_itg';
        if (lot < lot_check) {
            table = 'dulieu_itg_old';
        }
        const sql_chitiet =
            `
        SELECT 
	        label, ngay, giobatdau, gioketthuc, ketqua as trangthai
        FROM ` +
            table +
            ` where 
            mathung = ?       
        ORDER BY
            label,
            ngay desc`;
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
router.get('/get_data_line', async (req, res) => {
    const { vitri, date } = req.query;
    const date_c = new Date(date);
    const year = date_c.getFullYear();
    const month = date_c.getMonth();
    const fm = month < 10 ? `0${month}` : month.toString();
    const lot = '53' + year + fm + '20';

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const formattedMonth = currentMonth < 10 ? `0${currentMonth}` : currentMonth.toString();
    const lot_check = '53' + currentYear + formattedMonth + '01';
    let table = 'dulieu_itg';
    if (lot < lot_check) {
        table = 'dulieu_itg_old';
    }
    const ngay = formatDate(date);
    const sql = `
    SELECT 
        congdoan,
        model,
        soluong,
        ngay,
        lot,
        vitri,
        mathietbi,
        COUNT(*) as so_luong_du_lieu
    FROM 
        dulieu_itg
    WHERE 
        vitri LIKE CONCAT('%', ?, '%') 
        AND ngay = ?
    GROUP BY 
        congdoan, 
        model, 
        soluong, 
        ngay,
        lot,
        vitri, 
        mathietbi
    ORDER BY 
        model,
        congdoan;
    `;
    try {
        const result = await queryMySQL(sql, [vitri, ngay]);
        res.json(result);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
router.get('/get_line', async (req, res) => {
    const sql = `SELECT distinct  vitri  FROM   model`;
    try {
        const result = await queryMySQL(sql, []);
        res.json(result);
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.use('/api', router);
export default router;

import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { queryMySQL } from './server.mjs';

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

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
// Route GET để lấy dữ liệu
router.get('/get_don_hang', authorize(['nangxuat', 'admin']), async (req, res) => {
    try {
        const { model, lot } = req.query;
        let sql = `
              SELECT 
                distinct model, lot, soluong_dt, soluong, po, trangthai
              FROM model  
              WHERE 1 = 1              
          `;
        const parmas = [];
        if (model) {
            sql += `AND model = ?`;
            parmas.push(model);
        }
        if (lot) {
            sql += `AND lot = ?`;
            parmas.push(lot);
        }
        const results = await queryMySQL(sql, parmas);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_api_model_lot', authorize(['nangxuat', 'admin']), async (req, res) => {
    const url = 'http://30.1.1.2:8085/ServiceAPI/api/Device/GetJsonReportAPI/GetJsonReport';
    const token = 'f4ea1126-b5aa-4d8e-9e47-2851652b9056-Js8XeJgl4aq05cTQMDJz9H6GJIC7Ca';
    const { modelState, lotState } = req.query;
    console.log('model, lot' + modelState, lotState);
    try {
        const check = await checkDonHang(modelState, lotState);
        if (check === 0) {
            const response = await axios.post(
                url,
                {
                    JSON: {
                        searchDynamic: {
                            dfrom: '1900-01-01',
                            dto: '1900-01-01',
                            step_code: '',
                            product_code: modelState,
                            lot: lotState,
                            ma_nv: '',
                            machine_code: '',
                        },
                    },
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                }
            );
            await capNhatModelLot(response.data, res);
        } else {
            res.json(await thongTinModelLot(modelState, lotState));
        }
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.json({
            status: 500,
            message: 'Lỗi khi lấy dữ liệu:',
        });
    }
});
router.get('/get_label_none', authorize(['nangxuat', 'admin']), async (req, res) => {
    const { model, lot, congdoan, soluong_ok, soluong } = req.query;

    // Validate and cast soluong to a number
    const quantity = parseInt(soluong, 10);
    if (isNaN(quantity)) {
        return res.status(400).json({ error: 'Invalid quantity provided' });
    }

    try {
        if (congdoan == 'None') {
            const sql = `
        SELECT label
        FROM dulieu_itg_get_api
        WHERE model = ? AND lot = ?
      `;
            const result = await queryMySQL(sql, [model, lot]);
            const existingLabels = new Set(result.map((item) => item.label));
            console.log(existingLabels);
            const data = [];
            for (let i = 1; i <= quantity; i++) {
                let formattedIndex = i.toString().padStart(4, '0');
                let labelToCheck = `${model}_${lot}${formattedIndex}`;
                console.log(labelToCheck);
                if (!existingLabels.has(labelToCheck)) {
                    data.push({
                        label: labelToCheck,
                        trangthai: 'none',
                        ngay: '',
                        giobatdau: '',
                        gioketthuc: '',
                    });
                }
            }
            console.log(data);
            res.json({ missingLabels: data });
        } else {
            const params = [model, lot];
            let sql = `SELECT label, congdoan, ketqua, ngay, giobatdau, gioketthuc FROM dulieu_itg_get_api WHERE model = ? AND lot = ? `;
            if (congdoan === 'Sửa chữa') {
                sql += `AND ttcongdoan < 9 `;
            } else {
                sql += `AND congdoan = ? `;
                params.push(congdoan);
            }
            sql += `ORDER BY label, date DESC, giobatdau DESC`;
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
        }
    } catch (error) {
        console.error('Error fetching labels:', error);
        res.status(500).json({ error: 'An error occurred while fetching labels' });
    }
});

async function checkDonHang(model, lot) {
    const sql = `
    SELECT * FROM model 
    WHERE model = ? AND lot = ? AND trangthai = 'Hoàn tất'
  `;
    const result = await queryMySQL(sql, [model, lot]);
    return result.length > 0 ? 1 : 0;
}

async function capNhatModelLot(data, res) {
    await deleteModel(data[0].product_code, data[0].lot);
    var dem_dt = 0;
    var total = 0;
    const promises = data.map(async (item) => {
        const congDoan = await getCongDoan(item.step_code);
        if (item.id_package != '') {
            dem_dt++;
        }
        if (item.so_luong != 0) {
            total = item.so_luong;
        }
        const values = [
            'LSX: .......',
            item.so_ct,
            item.step_name,
            item.result,
            item.id_tem,
            0,
            item.product_code,
            item.so_luong,
            item.lot,
            formatDate(item.create_date),
            item.create_time,
            item.end_time,
            item.ma_nv,
            item.ten_nv,
            item.ma_nv_xn,
            item.id_package,
            item.stt_thung,
            item.machine_code,
            item.vi_tri,
            item.ghi_chu,
            congDoan?.stt ?? 99,
            8423001,
            congDoan?.thuoctinh ?? '{dandien: null,kichthuoc: null,ngoaiquan: null}',
            item.create_date,
        ];
        await addData(values);
    });
    await Promise.all(promises);
    await Update_soluong(dem_dt, total, data[0].product_code, data[0].lot);
    res.json(await thongTinModelLot(data[0].product_code, data[0].lot));
}

async function thongTinModelLot(model, lot) {
    const sql = `
    SELECT 
        label, 
        congdoan, 
        ttcongdoan,        
        ketqua,
        soluong,
        COUNT(CASE WHEN ketqua = 'OK' THEN 1 END) OVER (PARTITION BY congdoan) AS so_luong_ok
    FROM 
        dulieu_itg_get_api
    WHERE        
        model = ? AND
        lot = ?
    ORDER BY 
        ttcongdoan asc, date DESC, giobatdau DESC, congdoan, label;
  `;
    const result = await queryMySQL(sql, [model, lot]);
    console.log(result);
    // const resultCongDoan = await queryMySQL(sqlCongDoan, [model, lot]);
    // const ressldachay = await queryMySQL(sql_none, [model, lot]);    
    var soluong = 0;
    const congDoanMap = result.reduce((map, item) => {
        const cd = item.ttcongdoan < 10 ? 'Sửa chữa' : item.congdoan;
        if (!map[cd]) {
            if (item.soluong !== 0) {
                soluong = item.soluong;
            }
            map[cd] = {
                soluong: item.soluong,
                count_ok: item.so_luong_ok,
            };
        } else {
        }
        return map;
    }, {});
    // soluong: number;
    // soluong_da_chay: number;

    var dem = 0;
    var dem_sc = 0;
    const groupedResults = result.reduce((acc, item) => {
        const { label, congdoan, ketqua, ttcongdoan } = item;
        if (ttcongdoan < 10) {
            var cd = 'Sửa chữa';
        } else {
            var cd = congdoan;
        }
        if (!acc[label]) {
            acc[label] = { label };
            dem++;
        }
        if (!acc[label][cd]) {
            acc[label][cd] = ketqua;
            if (cd == 'Sửa chữa') {
                dem_sc++;
                congDoanMap[cd].count_ok = dem_sc;
            }
        }
        return acc;
    }, {});
    const ressldachay = {
        soluong: soluong,
        soluong_da_chay: dem,
    };
    return {
        results: Object.values(groupedResults),
        congdoan: Object.keys(congDoanMap),
        info: congDoanMap,
        none: ressldachay,
    };
}

async function getCongDoan(macongdoan) {
    const sql = 'SELECT * FROM congdoan WHERE macongdoan = ?';
    const result = await queryMySQL(sql, [macongdoan]);
    if (result.length === 0) {
        throw new Error('No matching record found');
    }
    return result[0];
}
async function deleteModel(model, lot) {
    const sql = 'DELETE FROM dulieu_itg_get_api WHERE model = ? AND lot = ?';
    await queryMySQL(sql, [model, lot]);
}
async function addData(values) {
    const sql = `
    INSERT INTO dulieu_itg_get_api (
      lenhsanxuat, sochungtu, congdoan, ketqua, label, sanphammoi, model,
      soluong, lot, ngay, giobatdau, gioketthuc, manhanvien, tennhanvien,
      quanly, mathung, sttthung, mathietbi, vitri, noidungloi, ttcongdoan,
      user, thuoctinh, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    await queryMySQL(sql, values);
}
async function Update_soluong(soluong_dt, soluong, model, lot) {
    try {
        const sql = `
      UPDATE 
        model 
      SET 
        soluong = ?,
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
        await queryMySQL(sql, [soluong, soluong_dt, trangthai, model, lot]);
    } catch (error) {
        console.error('Lỗi khi cập nhật SL:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật công đoạn' });
    }
}
router.put('/capnhatcongdoan', authorize(['admin']), async (req, res) => {
    const { macongdoan, thuoctinh } = req.body;
    console.log(macongdoan, thuoctinh);
    try {
        const sql = `
      UPDATE 
        congdoan 
      SET 
        thuoctinh = ? 
      WHERE 
        macongdoan = ?
    `;
        await queryMySQL(sql, [thuoctinh, macongdoan]);
        res.status(200).json({ message: 'Cập nhật công đoạn thành công' });
    } catch (error) {
        console.error('Lỗi khi cập nhật công đoạn:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật công đoạn' });
    }
});
router.get('/list_model', authorize(['nangxuat', 'admin']), async (req, res) => {
    try {
        const { lot_change } = req.query;
        let sql = `
            SELECT distinct model FROM model  
            WHERE 1 = 1
        `;
        const params = [];
        if (lot_change) {
            sql += `AND lot = ?`;
            params.push(lot_change);
        }
        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/list_lot', authorize(['nangxuat', 'admin']), async (req, res) => {
    try {
        const { model_change } = req.query;
        let sql = `
              SELECT distinct lot FROM model  
              WHERE 1 = 1              
          `;
        const parmas = [];
        if (model_change) {
            sql += `AND model = ?`;
            parmas.push(model_change);
        }
        sql += `ORDER BY lot desc`;
        const results = await queryMySQL(sql, parmas);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/chi_tiet_label', authorize(['nangxuat', 'admin']), async (req, res) => {
    try {
        const { label } = req.query;
        let sql_thongtin = `
        SELECT DISTINCT 
            congdoan, 
            ketqua, 
            label, 
            model, 
            vitri, 
            mathung, 
            lenhsanxuat, 
            soluong, 
            sochungtu,
            mathung,
            ngay,
            date,
            giobatdau
        FROM 
            dulieu_itg_get_api
        WHERE 
            label = ?
        ORDER BY 
            mathung DESC,
            date DESC,
            giobatdau DESC
        LIMIT 1;`;
        const sql_chitiet = `
        SELECT 
	        congdoan, ngay, date, giobatdau, gioketthuc, manhanvien, mathietbi, quanly, ketqua, thuoctinh, vitri, mathung
        FROM 
            dulieu_itg_get_api 
        where 
               label = ?       
        ORDER BY
            date asc,
            giobatdau asc;`;
        try {
            const [thongtin, chitiet] = await Promise.all([
                queryMySQL(sql_thongtin, [label]),
                queryMySQL(sql_chitiet, [label]),
            ]);
            console.log(thongtin);
            res.json({
                thongtin,
                chitiet,
            });
        } catch (error) {
            console.error('Lỗi khi thực hiện truy vấn:', error);
            res.status(500).json({ error: 'Lỗi khi thực hiện truy vấn.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/chi_tiet_thung', authorize(['nangxuat', 'admin']), async (req, res) => {
    try {
        const { mathung } = req.query;
        const sql_chitiet = `
        SELECT 
	        label, ngay, giobatdau, gioketthuc, ketqua as trangthai
        FROM 
            dulieu_itg_get_api 
        where 
            mathung = ?       
        ORDER BY
            label,
            date`;
        const results = await queryMySQL(sql_chitiet, [mathung]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/listcongdoan', authorize(['nangxuat', 'admin']), async (req, res) => {
    try {
        const { macongdoan, tencongdoan } = req.query;
        let sql = `
            SELECT * FROM congdoan
            WHERE 1 = 1
        `;
        const params = [];
        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
};

router.get('/chitietcongdoan', authorize(['nangxuat', 'admin']), async (req, res) => {
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
router.get('/get_api_mnv', authorize(['nangxuat', 'admin']), async (req, res) => {
    const url = 'http://30.1.1.2:8085/ServiceAPI/api/Device/GetJsonReportAPI/GetJsonReport';
    const token = 'f4ea1126-b5aa-4d8e-9e47-2851652b9056-Js8XeJgl4aq05cTQMDJz9H6GJIC7Ca';
    const { manhansu, date } = req.query;
    console.log(manhansu, date);
    try {
        const response = await axios.post(
            url,
            {
                JSON: {
                    searchDynamic: {
                        dfrom: date,
                        dto: date,
                        step_code: '',
                        product_code: '',
                        lot: '',
                        ma_nv: manhansu,
                        machine_code: '',
                    },
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(response.data);
        await Get_data_nv(response.data, res);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        res.json({
            status: 500,
            message: 'Lỗi khi lấy dữ liệu:',
        });
    }
});
async function Get_data_nv(data, res) {    
    // ma_nv: '8410119',
    // ten_nv: 'NGUYỄN THỊ CẨM CHI',
    const promises = data.map(async (item) => {
        return {
            ma_nv: item.ma_nv,
            ten_nv: item.ten_nv,
            congdoan: item.step_code,
            model: item.product_code,
            lot: item.lot,
            ngay: formatDate(item.create_date),
            giobatdau: item.create_time,
            gioketthuc: item.end_time,
            label: item.id_tem,
            ketqua: item.result,
        };
    });
    const results = await Promise.all(promises);
    res.json(results);
}
router.post('/addDonhang', authorize(['admin']), async (req, res) => {
    const { data } = req.body;
    try {
        const sql_insert = `INSERT INTO model (model, lot, po, soluong) VALUES (?, ?, ?, ?)`;
        let sql_update = `UPDATE  model SET soluong = ?  WHERE model = ? AND lot = ?`;
        let sql = `SELECT  id  FROM model WHERE model = ? AND lot = ?`;
        for (const element of data) {
            if(element[1] != undefined)
            {
                var model = `${element[1]}${element[2]}_${element[3]}`;
                console.log(element[1], element[2], element[3]);
                let week = element[5];
                if (typeof week === 'string' && week.length === 1) {
                    week = '0' + week;
                }
                var lot = `53${element[4]}${week}`;
                var soluong = element[6];
                var po = element[7];            
                var results = await queryMySQL(sql, [model, lot]);
                if (results && results.length > 0)
                {          
                    await queryMySQL(sql_update, [soluong, model, lot]);
                } else {               
                    await queryMySQL(sql_insert, [model, lot, po, soluong]);
                }
            }
            
        }
        res.status(200).json({ message: 'Cập nhật đơn hàng thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.use('/api', router);
export default router;

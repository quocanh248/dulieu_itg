import express from 'express';
import { queryMySQL } from './server.mjs';
const router = express.Router();
import dotenv from 'dotenv';
dotenv.config();
import { Client } from '@elastic/elasticsearch';

const client = new Client({
    node: 'http://30.0.33.15:9200/',
    auth: {
        username: 'elastic',
        password: '123456',
    },
    ssl: {
        rejectUnauthorized: false,
    },
});

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
router.get('/cap_nhat_nhan_su', async (req, res) => {
    try {
        const query = {
            size: 1800,
            query: {
                bool: {
                    filter: [{ term: { status: 'active' } }],
                },
            },
            sort: [{ workgroup: { order: 'asc' } }, { _id: { order: 'asc' } }],
        };
        const result = await client.search({
            index: 'vtc-personnel-v1',
            body: query,
        });
        let sql = `
        SELECT 
          manhom
        FROM 
          nhomlamviec           
        WHERE 
          tennhom = ?
        `;
        let sql_ktr = `
        SELECT 
          manhansu
        FROM 
          nhansu           
        WHERE 
          manhansu = ?
        `;
        result.hits.hits.forEach(async (hit) => {
            var source = hit._source;
            var nhom_lv = source.workgroup;            
            var manhansu = source.id;
            if(manhansu == 8424544)
            {
              console.log(manhansu);
            }
            var ktr_nhansu = await queryMySQL(sql_ktr, [manhansu]);
            if(ktr_nhansu.length > 0)
            {
                return;
            }
            var get_ma_nhom = await queryMySQL(sql, [nhom_lv]);
           
            const values = [
                 manhansu,
                 source.name,
                 get_ma_nhom.length > 0 ? get_ma_nhom[0].manhom : 2,
                 source.tag,
                 formatTimestampToDate(source.birthday) || '1900-01-01',
                 'mặc định',
                 source.idNo,
                 source.address,
                 source.educationalBackground,
                 source.ethnicGroup,           
                 formatTimestampToDate(source.issuedDate) || '1900-01-01',
                 source.issuedPlace,
                 formatTimestampToDate(source.startingDate) || '1900-01-01',
                 formatTimestampToDate(source.contractDate) || '1900-01-01',
                 source.gender,
                 source.phones && source.phones.length > 0 ? source.phones[0] : 0,
                 source.religion || '',
                 '',
                 source.labels && source.labels.length > 0 ? source.labels[0] : '',
                 '0',
            ];
            addData(values);
        });
        res.json({
            status: 200,
            message: 'Cập nhật thành công',
        });
    } catch (error) {
        console.error('Elasticsearch query error:', error);
    }
});
async function addData(values) {
    const sql = `
    INSERT INTO nhansu (
      manhansu, tennhansu, manhom, tag, ngaysinh, calamviec, sochungminh,
      diachi, trinhdo, dantoc, ngaycap, noicap, ngaybatdaulam, ngaykyhopdong,
      gioitinh, sdt, tongiao, ghichu, nhom, ttnhancom
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
    await queryMySQL(sql, values);
}
router.get('/danh_sach_nhan_su', async (req, res) => {
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
        console.error('Elasticsearch query error:', error);
    }
});
router.get('/nhansu_info', async (req, res) => {
    try {
        const { manhansu } = req.query;
        let sql = `
        SELECT 
          *
        FROM 
          nhansu ns        
        LEFT JOIN 
          nhomlamviec nlv ON ns.manhom = nlv.manhom
        WHERE 
          1=1
        `;
        const params = [];
        if (manhansu) {
            sql += ' AND b.manhansu = ?';
            params.push(manhansu);
        }
        const results = await queryMySQL(sql, params);
        res.json(results);
    } catch (error) {
        console.error('Elasticsearch query error:', error);
    }
});
function formatTimestampToDate(timestamp) {
    if(timestamp)
    {
        const date = new Date(timestamp * 1000); // Chuyển từ giây sang milliseconds
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // Định dạng YYYY-MM-DD
    } 
    return `1900-01-01`; // Định dạng YYYY-MM-DD
    
}

export default router;

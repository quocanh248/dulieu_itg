import express from 'express';
import cors from 'cors';
import { queryMySQL } from './server.mjs';

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

// Route GET để lấy dữ liệu
router.get('/get_ten_ke_hoach', async (req, res) => {
    try {
        let sql_map_ngay = `
        SELECT 
           distinct tenkehoach     
        FROM
            kehoach_laprap      
        ORDER BY
            tenkehoach desc
       `;
        const result = await queryMySQL(sql_map_ngay, []);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get('/get_po', async (req, res) => {
    try {
        let sql = `
        SELECT 
           distinct po, giotomay, ngay,  check_chunhat    
        FROM
            kehoach_laprap      
        ORDER BY
            ngay desc
       `;
        const result = await queryMySQL(sql, []);
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/cap_nhat_giotm', async (req, res) => {
    const { po, ngay, giotomay, check_chunhat } = req.body;
    try {
        let sql_update = `UPDATE  kehoach_laprap SET giotomay = ? WHERE ngay = ? AND po = ?`;
        let sql_update_cn = `UPDATE  kehoach_laprap SET check_chunhat = ? WHERE po = ?`;
        await queryMySQL(sql_update, [giotomay, ngay, po]);
        await queryMySQL(sql_update_cn, [check_chunhat, po]);
        res.status(200).json({ message: 'Cập nhật thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/themkehoach', async (req, res) => {
    const { tenkehoach, data } = req.body;
    try {
        const sql_insert = `
            INSERT INTO 
                kehoach_laprap (
                    model, 
                    lotcatday1, 
                    line, 
                    version,
                    nhomban, 
                    ngay, 
                    po, 
                    nangluclaprap, 
                    soluong, 
                    giobatdau, 
                    giotomay, 
                    tenkehoach, 
                    check_chunhat) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let sql_update = `UPDATE  kehoach_laprap SET soluong = ?, nangluclaprap = ?  WHERE id = ?`;
        let sql = `SELECT  id  FROM kehoach_laprap  WHERE model = ? AND line = ? AND po = ? AND ngay = ?`;
        const giotomay = '15:00:00';
        for (const [index, element] of data.entries()) {
            console.log(element[0], element[7], data[0][7]);
            if (element[0] != undefined) {
                var model = element[0];
                var line = element[1];
                var version = element[2];
                var nangluclaprap = element[3];
                var nhomban = element[4];
                var lotcatday1 = element[5];
                let po = element[6];
                let giobatdau = element[7];
                for (var i = 8; i < 18; i++) {
                    if (element[i] != undefined && element[i] != '' && index != 0) {
                        var ngay = formatdate_addKH(data[0][i]);
                        var results = await queryMySQL(sql, [model, line, po, ngay]);
                        if (results && results.length > 0) {
                            await queryMySQL(sql_update, [soluong, nangluclaprap, results[0].id]);
                        } else {
                            await queryMySQL(sql_insert, [
                                model,
                                lotcatday1,
                                line,
                                version,
                                nhomban,
                                ngay,
                                po,
                                nangluclaprap,
                                element[i],
                                giobatdau,
                                giotomay,
                                tenkehoach,
                                'K',
                            ]);
                        }
                    }
                }
            }
        }
        res.status(200).json({ message: 'Cập nhật đơn hàng thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
function formatdate_addKH(dateStr) {
    const [day, month] = dateStr.split('-');
    const currentYear = new Date().getFullYear();
    const date = new Date(`${currentYear}-${month}-${day}`);
    const formattedDate = date.toISOString().split('T')[0];
    return formattedDate;
}
router.get('/xem_ke_hoach', async (req, res) => {
    try {
        const { tenkehoach, ngay_check } = req.query;
        const date = new Date(ngay_check);
        let t2 = date.getDay() === 1;
        let t3 = date.getDay() === 2;
        let sql_map_ngay = `
        SELECT 
           DISTINCT DATE_FORMAT(ngay, '%Y-%m-%d') AS ngay       
        FROM
            kehoach_laprap
        WHERE
            tenkehoach = ?  ORDER BY  ngay`;
        let sql = `
        SELECT 
            model,
            lotcatday1,
            giobatdau,
            giotomay,
            version,
            line,
            nhomban,
            po,
            nangluclaprap,
            check_chunhat,
            MIN(ngay) AS min_giobatdau,
            MAX(ngay) AS max_giotomay,
            COUNT(*) AS dem,
            GROUP_CONCAT(DISTINCT CONCAT(ngay, "+", soluong) SEPARATOR ", ") AS list_ngay_sl
        FROM
            kehoach_laprap
        WHERE
            tenkehoach = ?
        GROUP BY 
            line, 
            po, 
            model, 
            version,
            lotcatday1, 
            giobatdau, 
            giotomay, 
            nhomban, 
            nangluclaprap, 
            check_chunhat
        ORDER BY
            line, 
            min_giobatdau, 
            po, 
            max_giotomay, 
            nhomban, 
            dem;
        `;

        const results_ngay = await queryMySQL(sql_map_ngay, [tenkehoach]);
        const results = await queryMySQL(sql, [tenkehoach]);
        const sortedResults = groupNhomBan(results);
        let line_check = '';
        let giobatdau = '';
        sortedResults.forEach((item) => {
            if (line_check == '' || line_check != item.line) {
                line_check = item.line;
                giobatdau = item.giobatdau.slice(0, 5);
            }
            const parts = item.list_ngay_sl.split(', ');
            const data = [];
            parts.forEach((part) => {
                const date_sls = part.split('+');
                if (date_sls.length === 2) {
                    if (date_sls[0] == ngay_check) {
                        const [giobatdauHour, giobatdauMinute] = giobatdau.split(':').map(Number);
                        let giobatdauDate = new Date();
                        let date_sub = new Date(ngay_check);
                        giobatdauDate.setHours(giobatdauHour);
                        giobatdauDate.setMinutes(giobatdauMinute);
                        giobatdauDate.setSeconds(0);
                        giobatdauDate.setMilliseconds(0);
                        giobatdauDate.setHours(giobatdauDate.getHours() - 6); // Trừ đi 6 giờ
                        const giotd = giobatdauDate.toTimeString().slice(0, 5);
                        const giotdHour = giobatdauDate.getHours();
                        const giotdMinutes = giobatdauDate.getMinutes();

                        if (giotdHour < 6) {
                            let ngay_sub = new Date(date_sub.setDate(date_sub.getDate() - 1));
                            if (item.line.startsWith('LR5')) {
                                ngay_sub = new Date(date_sub.setDate(date_sub.getDate() - 2));
                            }
                            if ((t2 || t3) && item.check_chunhat == 'K') {
                                let ngay_sub = new Date(date_sub.setDate(date_sub.getDate() - 2));
                                if (item.line.startsWith('LR5')) {
                                    ngay_sub = new Date(date_sub.setDate(date_sub.getDate() - 3));
                                }
                            }
                            const hieu_gio = 6 - giotdHour;
                            const hieu_phut = 0 - giotdMinutes;
                            //giờ nghỉ tổ máy ngày soạn dây (trước ngày LR)

                            ngay_sub.setHours(item.giotomay.slice(0, 2) - hieu_gio); // Cộng phần giờ chênh lệch vào 15:30
                            ngay_sub.setMinutes(item.giotomay.slice(3, 5) - hieu_phut); // Điều chỉnh phút

                            const giotd = ngay_sub.toTimeString().slice(0, 5); // Chuyển lại định dạng 'HH:mm'
                            const ngaytd = ngay_sub.toISOString().slice(0, 10);

                            data.push({
                                ngay: date_sls[0], // Ngày ban đầu
                                soluong: date_sls[1], // Số lượng
                                giobatdau: giobatdau, // Giờ bắt đầu gốc
                                ngaytd: formatNgay(ngaytd, giotd), // Ngày được trừ đi 1
                                giotd: giotd, // Giờ sau khi điều chỉnh
                            });
                        } else {
                            let ngay_sub = new Date(date_sub.setDate(date_sub.getDate()))
                                .toISOString()
                                .slice(0, 10);
                            if (item.line.startsWith('LR5')) {
                                ngay_sub = new Date(date_sub.setDate(date_sub.getDate() - 1))
                                    .toISOString()
                                    .slice(0, 10);
                            }
                            console.log(giobatdau, ngay_sub, giotd);
                            data.push({
                                ngay: date_sls[0],
                                soluong: date_sls[1],
                                giobatdau: giobatdau,
                                ngaytd: formatNgay(ngay_sub, giotd),
                                giotd: giotd,
                            });
                        }
                        let nllr = item.nangluclaprap;
                        if (nllr) {
                            const tg_tmp = Math.round((date_sls[1] / (nllr / 8)) * 100) / 100;
                            const gio = Math.floor(tg_tmp);
                            const phut = Math.round((tg_tmp - gio) * 60);
                            let thoi_gian_lap_rap = new Date(`${date_sls[0]}T${giobatdau}`);

                            // Thêm số giờ và phút vào thoi_gian_lap_rap
                            thoi_gian_lap_rap.setHours(thoi_gian_lap_rap.getHours() + gio);
                            thoi_gian_lap_rap.setMinutes(thoi_gian_lap_rap.getMinutes() + phut);

                            // Kiểm tra xem có qua ngày mới không
                            if (new Date(date_sls[0]) < thoi_gian_lap_rap) {
                                const updatedTodayLine = thoi_gian_lap_rap
                                    .toISOString()
                                    .slice(0, 10);
                            }

                            giobatdau = thoi_gian_lap_rap.toTimeString().slice(0, 5); // Cập nhật giờ
                        }
                    } else {
                        data.push({
                            ngay: date_sls[0],
                            soluong: date_sls[1],
                            giobatdau: null,
                            ngaytd: null,
                            giotd: null,
                        });
                    }
                }
            });
            item.parsed_data = data;
        });
        res.json({
            data: sortedResults,
            map_ngay: results_ngay,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
function formatNgay(ngay, gio) {
    // Tách ngày và giờ thành các phần
    const [year, month, day] = ngay.split('-').map(Number);
    const [hours, minutes] = gio.split(':').map(Number);
    console.log('Chưa làm tròn ' + minutes);
    // Làm tròn phút theo yêu cầu
    let roundedMinutes = minutes;
    let roundedHours = hours;

    if (roundedMinutes < 15) {
        roundedMinutes = 0;
    } else if (roundedMinutes >= 15 && roundedMinutes < 45) {
        roundedMinutes = 30;
    } else {
        roundedMinutes = 0;
        roundedHours += 1; // Tăng giờ lên 1 nếu phút >= 45
        if (roundedHours === 24) {
            roundedHours = 0; // Nếu giờ vượt quá 23, quay lại 0
            // Tăng ngày lên 1 nếu cần
            day += 1;
        }
    }

    console.log('Làm tròn phút: ' + roundedMinutes);

    // Tạo lại đối tượng Date với giờ và phút đã được làm tròn
    const updatedDate = new Date(year, month - 1, day, roundedHours, roundedMinutes);

    // Định dạng lại thành YYYY/MM/DD HH:mm
    const formattedDate =
        `${updatedDate.getDate().toString().padStart(2, '0')}/${(updatedDate.getMonth() + 1)
            .toString()
            .padStart(2, '0')}/${updatedDate.getFullYear()} ` +
        `${(roundedHours % 12 || 12).toString()}:${roundedMinutes
            .toString().padStart(2, '0')}:00 ` +
        `${roundedHours >= 12 ? 'PM' : 'AM'}`;

    return formattedDate;
}

const groupNhomBan = (data) => {
    if (data.length === 0) {
        return [];
    }
    data.sort((a, b) => a.line - b.line);
    const groupedByLine = data.reduce((acc, item) => {
        (acc[item.line] = acc[item.line] || []).push(item);
        return acc;
    }, {});
    const result = [];
    Object.values(groupedByLine).forEach((lineGroup) => {
        const groupedByPo = lineGroup.reduce((acc, item) => {
            (acc[item.po] = acc[item.po] || []).push(item);
            return acc;
        }, {});
        Object.values(groupedByPo).forEach((poGroup) => {
            const groupedByNhomban = poGroup.reduce((acc, item) => {
                (acc[item.nhomban] = acc[item.nhomban] || []).push(item);
                return acc;
            }, {});
            Object.values(groupedByNhomban).forEach((nhombanGroup) => {
                result.push(nhombanGroup[0]); // Thêm dòng đầu tiên
                result.push(...nhombanGroup.slice(1).sort((a, b) => a.line - b.line)); // Thêm các dòng còn lại đã sắp xếp
            });
        });
    });
    return result.sort((a, b) => a.line - b.line);
};

export default router;

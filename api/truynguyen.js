import express from "express";
import axios from "axios"; // Import axios để gửi yêu cầu HTTP
import cors from "cors"; // Import cors để xử lý vấn đề CORS
import { queryMySQL } from "./server.js";

const app = express();
const router = express.Router();

// Middleware để parse JSON
app.use(express.json());
app.use(cors()); // Cài đặt CORS cho toàn bộ ứng dụng

// Định nghĩa route POST để lấy dữ liệu
router.get("/get_api_model_lot", async (req, res) => {
  try {
    const url =
      "http://30.1.1.2:8085/ServiceAPI/api/Device/GetJsonReportAPI/GetJsonReport";
    const token =
      "f4ea1126-b5aa-4d8e-9e47-2851652b9056-Js8XeJgl4aq05cTQMDJz9H6GJIC7Ca";
    const { model, lot } = req.query;
    const body = {
      JSON: {
        searchDynamic: {
          dfrom: "1900-01-01",
          dto: "1900-01-01",
          step_code: "",
          product_code: model,
          lot: lot,
          ma_nv: "",
          machine_code: "",
        },
      },
    };
    // Gửi yêu cầu POST đến API bên ngoài
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    cap_nhat_model_lot(response.data, res);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/list_model", async (req, res) => {
  try {
    let sql = `
            SELECT distinct model FROM model  
            WHERE 1 = 1
        `;
    const params = [];
    const results = await queryMySQL(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/list_lot", async (req, res) => {
  try {
    const { model } = req.query;
    let sql = `
              SELECT distinct lot FROM model  
              WHERE 1 = 1
          `;
    const params = [];
    if (model) {
      sql += " AND model = ?";
      params.push(model);
    }
    const results = await queryMySQL(sql, params);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function cap_nhat_model_lot(data, res) {
  delete_model(data[0].product_code, data[0].lot);
  for (let i = 0; i < data.length; i++) {
    var tt_congdoan = await get_cong_doan(data[i].step_code);
    var lenhsanxuat = data[i].stt_rec_dkv;
    var sochungtu = data[i].so_ct;
    var congdoan = data[i].step_name;
    var ketqua = data[i].result;
    var label = data[i].id_tem;
    var sanphammoi = 0;
    var model = data[i].product_code;
    var soluong = data[i].total;
    var lot = data[i].lot;
    var ngay = formatDate(data[i].create_date);
    var giobatdau = data[i].create_time;
    var gioketthuc = data[i].end_time;
    var manhanvien = data[i].ma_nv;
    var tennhanvien = data[i].ten_nv;
    var quanly = data[i].ma_nv_xn;
    var mathung = data[i].id_package;
    var sttthung = data[i].stt_thung;
    var mathietbi = data[i].machine_code;
    var vitri = data[i].vi_tri;
    var thuoctinh =
      tt_congdoan.thuoctinh ??
      "{dandien: null,kichthuoc: null,ngoaiquan: null}";
    var noidungloi = data[i].ghi_chu;
    var ttcongdoan = tt_congdoan.stt ?? 99;
    var user = 8423001;
    var values = [
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
      tennhanvien,
      quanly,
      mathung,
      sttthung,
      mathietbi,
      vitri,
      noidungloi,
      ttcongdoan,
      user,
      thuoctinh,
    ];
    add_data(values);
  }
  try {
    const sql = `
        SELECT 
	        t1.label, t1.congdoan, t1.ttcongdoan, t1.ketqua 
        FROM 
            dulieu_itg_get_api t1 
        JOIN 
            ( 
            SELECT 
                label, congdoan, ttcongdoan, MAX(ngay) AS max_ngay, MAX(giobatdau) AS max_giobatdau 
            FROM 
                dulieu_itg_get_api 
            where 
                model = ? and 
                lot = ?
            GROUP BY 
                label, congdoan, ttcongdoan 
            ) t2 ON t1.label = t2.label 
            AND t1.congdoan = t2.congdoan 
            AND t1.ttcongdoan = t2.ttcongdoan 
            AND t1.ngay = t2.max_ngay 
            AND t1.giobatdau = t2.max_giobatdau 
        GROUP BY 
            t1.label, t1.congdoan, t1.ttcongdoan
        ORDER BY
            t1.label,
            t1.ttcongdoan;`;
    const sql_congdoan = `
        SELECT 
	        distinct congdoan, ttcongdoan
        FROM 
            dulieu_itg_get_api  
        where 
            model = ? and 
            lot = ? 
        ORDER BY           
            ttcongdoan;`;
    const result = await queryMySQL(sql, [data[0].product_code, data[0].lot]);
    const result_congdoan = await queryMySQL(sql_congdoan, [
      data[0].product_code,
      data[0].lot,
    ]);
    const congdoanMap = result_congdoan.reduce((map, item) => {
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
    console.log(groupedResults);
    const finalResults = Object.values(groupedResults);
    res.json({
      results: finalResults,
      congdoan: Object.keys(congdoanMap), // Danh sách công đoạn để hiển thị tiêu đề cột
    });
    // Giả sử `result` là một mảng, bạn có thể cần kiểm tra kết quả
    if (result.length === 0) {
      throw new Error("No matching record found");
    }

    return result[0]; // Hoặc trả về kết quả phù hợp
  } catch (err) {
    // Xử lý lỗi, có thể cần phải ném lại lỗi để hàm gọi bên ngoài biết
    throw new Error(err.message);
  }
}
async function get_cong_doan(macongdoan) {
  try {
    const sql = "SELECT * FROM congdoan WHERE macongdoan = ?";
    const result = await queryMySQL(sql, [macongdoan]);

    // Giả sử `result` là một mảng, bạn có thể cần kiểm tra kết quả
    if (result.length === 0) {
      throw new Error("No matching record found");
    }

    return result[0]; // Hoặc trả về kết quả phù hợp
  } catch (err) {
    // Xử lý lỗi, có thể cần phải ném lại lỗi để hàm gọi bên ngoài biết
    throw new Error(err.message);
  }
}
async function delete_model(model, lot) {
  try {
    const sql = "DELETE FROM dulieu_itg_get_api WHERE model = ? AND lot = ?";
    await queryMySQL(sql, [model, lot]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function add_data(values) {
  try {
    const sql = `
        INSERT INTO dulieu_itg_get_api (
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
            tennhanvien,
            quanly,
            mathung,
            sttthung,
            mathietbi,
            vitri,
            noidungloi,
            ttcongdoan,
            user,
            thuoctinh
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    queryMySQL(sql, values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
router.get("/chi_tiet_label", async (req, res) => {
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
            sochungtu
        FROM 
            dulieu_itg_get_api
        WHERE 
            label = ?
        ORDER BY 
            mathung DESC,
            ngay DESC,
            giobatdau DESC
        LIMIT 1;`;
    const sql_chitiet = `
        SELECT 
	        congdoan, ngay, giobatdau, gioketthuc, manhanvien, mathietbi, quanly, ketqua, thuoctinh, vitri, mathung
        FROM 
            dulieu_itg_get_api 
        where 
               label = ?       
        ORDER BY
            ngay,
            giobatdau;`;
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
      console.error("Lỗi khi thực hiện truy vấn:", error);
      res.status(500).json({ error: "Lỗi khi thực hiện truy vấn." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/listcongdoan", async (req, res) => {
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
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
};
router.get("/chitietcongdoan", async (req, res) => {
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
app.use("/api", router);
export default router;

import express from "express";
import axios from "axios";
import cors from "cors";
import { queryMySQL } from "./server.mjs";

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

// Route GET để lấy dữ liệu
router.get("/get_don_hang", async (req, res) => {
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
router.get("/get_api_model_lot", async (req, res) => {
  const url =
    "http://30.1.1.2:8085/ServiceAPI/api/Device/GetJsonReportAPI/GetJsonReport";
  const token =
    "f4ea1126-b5aa-4d8e-9e47-2851652b9056-Js8XeJgl4aq05cTQMDJz9H6GJIC7Ca";
  const { modelState, lotState } = req.query;
  console.log("model, lot" + modelState, lotState);
  try {
    const check = await checkDonHang(modelState, lotState);
    if (check === 0) {
      const response = await axios.post(
        url,
        {
          JSON: {
            searchDynamic: {
              dfrom: "1900-01-01",
              dto: "1900-01-01",
              step_code: "",
              product_code: modelState,
              lot: lotState,
              ma_nv: "",
              machine_code: "",
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      await capNhatModelLot(response.data, res);
    } else {
      res.json(await thongTinModelLot(modelState, lotState));
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get("/get_label_none", async (req, res) => {
  const { model, lot, congdoan, soluong_ok, soluong } = req.query;

  // Validate and cast soluong to a number
  const quantity = parseInt(soluong, 10);
  if (isNaN(quantity)) {
    return res.status(400).json({ error: "Invalid quantity provided" });
  }

  try {
    if (congdoan == "None") {
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
        let formattedIndex = i.toString().padStart(4, "0");
        let labelToCheck = `${model}_${lot}${formattedIndex}`;
        console.log(labelToCheck);
        if (!existingLabels.has(labelToCheck)) {
          data.push({
            label: labelToCheck,
            trangthai: "none",
            ngay: "",
            giobatdau: "",
            gioketthuc: "",
          });
        }
      }
      console.log(data);
      res.json({ missingLabels: data });
    } else {
      const params = [model, lot];
      let sql = `SELECT label, congdoan, ketqua, ngay, giobatdau, gioketthuc FROM dulieu_itg_get_api WHERE model = ? AND lot = ? `;
      if (congdoan === "Sửa chữa") {
        sql += `AND ttcongdoan < 9 `;
      } else {
        sql += `AND congdoan = ? `;
        params.push(congdoan);
      }
      sql += `ORDER BY label, ngay DESC, giobatdau DESC`;
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
    console.error("Error fetching labels:", error);
    res.status(500).json({ error: "An error occurred while fetching labels" });
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
    if (item.id_package != "") {
      dem_dt++;
    }
    if (item.so_luong != 0) {
      total = item.so_luong;
    }
    console.log(" item.stt_rec_dkv:" + item.stt_rec_dkv);
    const values = [
      "LSX: .......",
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
      congDoan?.thuoctinh ?? "{dandien: null,kichthuoc: null,ngoaiquan: null}",
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
	    label, congdoan, ketqua, ttcongdoan
    FROM 
	    dulieu_itg_get_api 
    WHERE 
	    model = ? AND
      lot = ?
    ORDER BY	
	    label, ngay DESC, giobatdau DESC
  `;
  const sqlCongDoan = `
    SELECT 
      DISTINCT congdoan, 
      ttcongdoan, 
      soluong,
      COUNT(CASE WHEN ketqua = 'OK' THEN 1 ELSE NULL END) AS count_ok,
      COUNT(DISTINCT CASE WHEN ttcongdoan < 9 THEN label END) AS count_sc 
    FROM 
      dulieu_itg_get_api  
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
  const sql_none = `
    SELECT  
      soluong,  
      COUNT(DISTINCT label) AS soluong_da_chay
    FROM 
      dulieu_itg_get_api  
    WHERE 
      model = ? AND 
      lot = ? AND
      ttcongdoan > 9
    GROUP BY
      soluong`;
  const result = await queryMySQL(sql, [model, lot]);
  const resultCongDoan = await queryMySQL(sqlCongDoan, [model, lot]);
  const ressldachay = await queryMySQL(sql_none, [model, lot]);
  console.log(ressldachay);
  const congDoanMap = resultCongDoan.reduce((map, item) => {
    const cd = item.ttcongdoan < 10 ? "Sửa chữa" : item.congdoan;
    const sl = item.ttcongdoan < 10 ? item.count_sc : item.count_ok;

    if (!map[cd]) {
      map[cd] = {
        soluong: item.soluong,
        count_ok: sl,
      };
    } else {
      map[cd].count_ok =
        item.ttcongdoan > 9
          ? map[cd].count_ok + sl
          : Math.max(map[cd].count_ok, sl);
    }

    return map;
  }, {});
  console.log(congDoanMap);
  const groupedResults = result.reduce((acc, item) => {
    const { label, congdoan, ketqua, ttcongdoan } = item;
    if (ttcongdoan < 10) {
      var cd = "Sửa chữa";
    } else {
      var cd = congdoan;
    }
    if (!acc[label]) {
      acc[label] = { label };
    }
    if (!acc[label][cd]) {
      acc[label][cd] = ketqua;
    }
    return acc;
  }, {});
  return {
    results: Object.values(groupedResults),
    congdoan: Object.keys(congDoanMap),
    info: congDoanMap,
    none: ressldachay,
  };
}

async function getCongDoan(macongdoan) {
  const sql = "SELECT * FROM congdoan WHERE macongdoan = ?";
  const result = await queryMySQL(sql, [macongdoan]);
  if (result.length === 0) {
    throw new Error("No matching record found");
  }
  return result[0];
}
async function deleteModel(model, lot) {
  const sql = "DELETE FROM dulieu_itg_get_api WHERE model = ? AND lot = ?";
  await queryMySQL(sql, [model, lot]);
}
async function addData(values) {
  const sql = `
    INSERT INTO dulieu_itg_get_api (
      lenhsanxuat, sochungtu, congdoan, ketqua, label, sanphammoi, model,
      soluong, lot, ngay, giobatdau, gioketthuc, manhanvien, tennhanvien,
      quanly, mathung, sttthung, mathietbi, vitri, noidungloi, ttcongdoan,
      user, thuoctinh
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    var trangthai = "";
    if (soluong == soluong_dt) {
      trangthai = "Hoàn tất";
    }
    console.log(trangthai, soluong_dt, soluong);
    await queryMySQL(sql, [soluong, soluong_dt, trangthai, model, lot]);
  } catch (error) {
    console.error("Lỗi khi cập nhật SL:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật công đoạn" });
  }
}
router.put("/capnhatcongdoan", async (req, res) => {
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
    res.status(200).json({ message: "Cập nhật công đoạn thành công" });
  } catch (error) {
    console.error("Lỗi khi cập nhật công đoạn:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật công đoạn" });
  }
});
router.get("/list_model", async (req, res) => {
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
router.get("/list_lot", async (req, res) => {
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
            sochungtu,
            mathung,
            ngay,
            giobatdau
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
router.get("/chi_tiet_thung", async (req, res) => {
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
            ngay`;
    const results = await queryMySQL(sql_chitiet, [mathung]);
    res.json(results);    
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
router.post("/addDonhang", async (req, res) => {
  const { data } = req.body;
  try {
    for (const element of data) {
      const model = `${element[0]}${element[1]}_${element[2]}`;
      let week = element[4];
      if (typeof week === "string" && week.length === 1) {
        week = "0" + week;
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
    res.status(200).json({ message: "Cập nhật đơn hàng thành công!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use("/api", router);
export default router;

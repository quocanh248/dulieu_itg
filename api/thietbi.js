import express from "express";
import axios from "axios";
import cors from "cors";
import { queryMySQL } from "./server.js";

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

// Route GET để lấy dữ liệu
router.get("/get_nhom_cap_2", async (req, res) => {
  try {
    const { manhomcap2, tennhomcap2 } = req.query;
    let sql = `
        SELECT * FROM nhomthietbicap2  
        WHERE tennhomcap2 <> 'macdinh1'
    `;

    const params = []; // Đổi 'parmas' thành 'params'

    if (manhomcap2) {
      sql += ` AND manhomcap2 = ?`;
      params.push(manhomcap2);
    }

    if (tennhomcap2) {
      sql += ` AND tennhomcap2 LIKE ?`;
      params.push(`%${tennhomcap2}%`);
    }
    const results = await queryMySQL(sql, parmas);
    console.log(results);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/get_nhom_cap_1_of_cap_2", async (req, res) => {
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

export default router;

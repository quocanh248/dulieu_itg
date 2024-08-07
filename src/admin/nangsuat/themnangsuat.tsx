import React, { useState } from "react";
import axios from "axios";
import MenuComponent from "../../Menu";
import ExcelJS from "exceljs";

function AdminPage() {
  const [result, setResult] = useState([]); // Khởi tạo là mảng để dễ xử lý
  const [file, setFile] = useState(null); // Thêm state để lưu tệp
  // Xử lý sự kiện thay đổi giá trị của input file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Lưu tệp vào state
  };
  const handle_import = async () => {
    try {
      let rows = [];
      // Xử lý tệp Excel nếu có
      if (file) {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file);
        const worksheet = workbook.worksheets[0];
        let startRow = 12;
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          if (rowNumber >= startRow) {
            rows.push(row.values);
          }
        });
        setResult(rows);
      } 
      // Gửi dữ liệu đến API để lưu vào cơ sở dữ liệu
      if (rows.length > 0) {
        await axios.post("http://localhost:3000/nang_suat/upload", rows);
        alert("Dữ liệu đã được lưu thành công");
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu hoặc xử lý tệp:", error);
    }
  };

  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Thêm Dữ liệu năng suất ITG <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">
                Chọn file năng suất
              </label>
              <input
                type="file"
                className="form-control"
                onChange={handleFileChange} // Sửa để gọi đúng hàm xử lý
              />
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center p-2">
            <button className="btn btn-primary" onClick={handle_import}>
              <i className="fas fa-search"></i> Thêm
            </button>
          </div>
        </div>
      </div>
      <div className="p-3"></div>
    </MenuComponent>
  );
}

export default AdminPage;

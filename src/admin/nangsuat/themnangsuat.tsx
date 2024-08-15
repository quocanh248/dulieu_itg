import { useState, ChangeEvent, MouseEvent } from "react";
import MenuComponent from "../../Menu";
import ExcelJS from "exceljs";
import { sendAPIRequest } from "../../utils/util";

// Định nghĩa kiểu cho dữ liệu hàng trong file Excel
interface RowData {
  [key: number]: any;
}

function AdminPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của nút bấm
    try {
      let rows: RowData[][] = []; // Đổi thành mảng hai chiều

      // Xử lý tệp Excel nếu có
      if (file) {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);

        fileReader.onload = async () => {
          const buffer = fileReader.result as ArrayBuffer;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer); // Sử dụng buffer thay vì file
          const worksheet = workbook.worksheets[0];
          let startRow = 12;
          worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
            if (rowNumber >= startRow) {             
              rows.push(row.values as RowData[]); // Chuyển đổi thành mảng hai chiều
            }
          });
          // Gửi dữ liệu đến API để lưu vào cơ sở dữ liệu
          if (rows.length > 0) {
            await sendAPIRequest("/nang_suat/upload", "POST", rows);           
            alert("Dữ liệu đã được lưu thành công");
          }
        };

        fileReader.onerror = (error) => {
          console.error("Lỗi khi đọc tệp:", error);
        };
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
            <button className="btn btn-primary" onClick={handleImport}>
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

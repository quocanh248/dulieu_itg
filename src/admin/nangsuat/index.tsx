import React, { useState } from "react";
import axios from "axios";
import exportToExcel from "../../utils/exportToExcel";
import MenuComponent from "../../Menu";

function AdminPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [result, setResult] = useState([]); // Khởi tạo là mảng để dễ xử lý
  const [check, setCheck] = useState(0);
  // Xử lý sự kiện thay đổi giá trị của input
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };
  const handleExport = async () => {
    try {
      // Gọi fetchnangsuat và đợi kết quả
      const res = await fetchexcel({ date });
      if (res && res.length > 0) {
        const filename = `Dữ liệu năng suất ngày ${date}.xlsx`;
        await exportToExcel(res, filename);
      } else {
        console.log("Không có dữ liệu để xuất");
      }
    } catch (error) {
      console.error("Đã xảy ra lỗi:", error);
    }
  };
  const fetchexcel = async (filters = {}) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/nang_suat/search",
        {
          params: filters,
        }
      );
      return response.data; // Trả về dữ liệu nhận được từ API
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu năng suất:", error);
      return []; // Trả về mảng rỗng nếu có lỗi
    }
  };
  const fetchnangsuat = async (filters = {}) => {
    try {
      const response = await axios.get(
        "http://localhost:3000/nang_suat/search",
        {
          params: filters,
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu năng suất:", error);
    }
  };

  // Hàm xử lý khi nhấn nút "Tìm"
  const handleSearch = () => {
    fetchnangsuat({ date });
  };

  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Dữ liệu năng suất <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Ngày</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={handleDateChange}
              />
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-center p-2">
            <button className="btn btn-primary" onClick={handleSearch}>
              <i className="fas fa-search"></i> Tìm
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-center p-2">
            <button className="btn btn-success" onClick={handleExport}>
              <i className="fas fa-download"></i> Excel
            </button>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white">
          <table
            className="table table-bordered text-center"
            style={{ width: "100%", fontSize: "14px" }}
          >
            <thead>
              <tr>
                <th>Mã nhân viên</th>
                <th style={{ minWidth: "220px"}}>Tên nhân viên</th>
                <th>Bộ phận</th>
                <th>Model</th>
                <th>Lot</th>
                <th>Ngày</th>
                <th style={{ minWidth: "220px"}}>Công đoạn</th>
                <th>Vị trí</th>
                <th>Số lượng</th>
                <th>Thời gian thực hiện</th>
                <th>Thời gian quy đổi</th>
                <th>Thời gian làm việc</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index + 1}>
                  <td>{item.manhansu}</td>
                  <td>{item.tennhansu}</td>
                  <td>{item.tennhom}</td>
                  <td>{item.model}</td>
                  <td>{item.lot}</td>
                  <td>{date}</td>
                  <td>{item.congdoan}</td>
                  <td>{item.vitri}</td>
                  <td>{item.soluong}</td>
                  <td>{(parseFloat(item.thoigianthuchien) || 0).toFixed(2)}</td>
                  <td>
                    {item.sum_time !== 0
                      ? (
                          (item.thoigianthuchien / item.sum_time) *
                          item.thoigianlamviec
                        ).toFixed(2)
                      : "0.00"}
                  </td>
                  <td>{item.thoigianlamviec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MenuComponent>
  );
}

export default AdminPage;

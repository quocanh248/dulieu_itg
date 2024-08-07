import React, { useState } from "react";
import axios from "axios";
import MenuComponent from "../../Menu";

function AdminPage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [result, setResult] = useState([]); // Khởi tạo là mảng để dễ xử lý

  // Xử lý sự kiện thay đổi giá trị của input
  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  // Hàm xử lý khi nhấn nút "Tìm"
  const handleSearch = async () => {
    try {
      // Gửi yêu cầu đến API Express
      const response = await axios.get("http://localhost:3000/nang_suat/search", {
        params: { date },
      });
      setResult(response.data); // Lưu trữ kết quả trả về từ API
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu:", error);
    }
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
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white p-3">
          <table className="table table-bordered" style={{ width: "100%", fontSize: "14px" }}>
            <thead>
              <tr>
                <th>Mã nhân viên</th>
                <th>Tên nhân viên</th>
                <th>Bộ phận</th>
                <th>Model</th>
                <th>Lot</th>
                <th>Ngày</th>
                <th>Công đoạn</th>
                <th>Vị trí</th>
                <th>Số lượng</th>
                <th>Thời gian thực hiện</th>
                <th>Thời gian quy đổi</th>
                <th>Thời gian làm việc</th>
              </tr>
            </thead>
            <tbody>             
              {result.map((item, index) => (
                <tr key={index +1}>                  
                  <td>{item.manhansu}</td>
                  <td>{item.tennhansu}</td>
                  <td>{item.tennhom}</td>
                  <td>{item.model}</td>
                  <td>{item.lot}</td>
                  <td>{date}</td>
                  <td>{item.congdoan}</td>
                  <td>{item.vitri}</td>
                  <td>{item.soluong}</td>
                  <td>{item.thoigianthuchien}</td>
                  <td>
                    {item.sum_time !== 0
                      ? (
                          (item.thoigianthuchien / item.sum_time) * item.thoigianlamviec
                        ).toFixed(2)
                      : '0.00'}
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

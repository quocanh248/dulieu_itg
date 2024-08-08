import { useEffect, useState } from "react";
import axios from "axios";
import MenuComponent from "../../Menu";
import { useParams } from "react-router-dom";

function AdminPage() {
  const [result_thongtin, setrResthongtin] = useState([]);
  const [result_chitiet, setrReschitiet] = useState([]); // Khởi tạo là mảng để dễ xử lý
  const { label } = useParams<{ label: string }>();
  const decodedLabel = decodeURIComponent(label || "");

  useEffect(() => {
    const decodedLabel = decodeURIComponent(label || "");
    const fetchlabel = async () => {
      try {
        // Gọi API với tham số label đã giải mã
        const response = await axios.get(
          "http://localhost:3000/truynguyen/chi_tiet_label",
          {
            params: { label: decodedLabel },
          }
        );
        const data = response.data;
        console.log(data);
        // Cập nhật trạng thái với dữ liệu nhận được
        setrResthongtin(data.thongtin);
        setrReschitiet(data.chitiet);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    };

    // Gọi hàm tải dữ liệu
    if (decodedLabel) {
      fetchlabel();
    }
  }, [label]);
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Chi tiết label <b style={{ color: "red" }}>{decodedLabel}</b>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2" style={{ visibility: "hidden" }}>
            <div>
              <label className="form-label text-secondary">Model</label>
            </div>
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="bg-white"></div>
      </div>
    </MenuComponent>
  );
}

export default AdminPage;

import { useEffect, useState } from "react";
import MenuComponent from "../../Menu";
import { sendAPIRequest } from "../../utils/util";
import { Link } from "react-router-dom";

function AdminPage() {
  const [model, setModel] = useState("");
  const [lot, setLot] = useState("");
  const [loading, setLoading] = useState(false);
  const [result_model, setrResModel] = useState([]);
  const [result_lot, setrResLot] = useState([]);
  const [result_congdoan, setrRescongdoan] = useState([]);
  const [result_label, setrReslabel] = useState<RowData[]>([]);
  interface RowData {
    label: string;
  }
  // Xử lý sự kiện thay đổi giá trị của input
  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const model_change = e.target.value;
    setModel(model_change);
    if (model_change !== "") {
      fetchlot({ model_change });
    }
  };

  const fetchmodel = async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/truynguyen/list_model?" + queryString,
        "GET",
        undefined
      );
      setrResModel(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu năng suất:", error);
    }
  };
  const fetchlot = async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/truynguyen/list_lot?" + queryString,
        "GET",
        undefined
      );
      setrResLot(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu năng suất:", error);
    }
  };
  const get_api_itg = async (filters = {}) => {
    setLoading(true); // Bắt đầu loading
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/truynguyen/get_api_model_lot?" + queryString,
        "GET",
        undefined
      );
      setrRescongdoan(response.congdoan);
      setrReslabel(response.results);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };
  const handleSearch = () => {
    get_api_itg({ model, lot });
  };
  useEffect(() => {
    fetchmodel();
  }, []);
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Dữ liệu năng suất <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Model</label>
              <input
                type="search"
                className="form-control"
                list="list_model"
                value={model}
                onChange={handleModelChange}
              />
              <datalist id="list_model">
                {result_model.map((item) => (
                  <option
                    key={(item as { model: string }).model}
                    value={(item as { model: string }).model}
                  ></option>
                ))}
              </datalist>
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Lot</label>
              <input
                type="search"
                className="form-control"
                value={lot}
                list="list_lot"
                onChange={(e) => setLot(e.target.value)}
              />
              <datalist id="list_lot">
                {result_lot.map((item) => (
                  <option
                    key={(item as { lot: string }).lot}
                    value={(item as { lot: string }).lot}
                  ></option>
                ))}
              </datalist>
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
        {loading ? (
          <div
            className="d-flex align-items-center justify-content-center"
            style={{ minHeight: "400px" }}
          >
            <div className="loader"></div>
          </div>
        ) : (
          <div className="bg-white">
            <table
              className="table table-bordered text-center"
              style={{ width: "100%", fontSize: "14px" }}
            >
              <thead>
                <tr>
                  <th>Label</th>
                  {result_congdoan.map((congdoanItem) => (
                    <th key={congdoanItem}>{congdoanItem}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result_label.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <Link                     
                        to={`/chi_tiet_label/${encodeURIComponent(row.label)}`}
                      >
                        {row.label}
                      </Link>
                    </td>
                    {result_congdoan.map((congdoanItem) => (
                      <td key={congdoanItem}>
                        {row[congdoanItem] || " "}{" "}
                        {/* Hiển thị giá trị hoặc ' ' nếu không có */}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MenuComponent>
  );
}

export default AdminPage;

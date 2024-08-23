import { useEffect, useState } from "react";
import MenuComponent from "../../Menu";
import { sendAPIRequest } from "../../utils/util";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
interface RowData {
  label: string;
  [key: string]: any; // Để có thể chứa các giá trị khác không biết trước
}
interface Datatt {
  congdoan: string;
  soluong: number;
  count_ok: number;
}
function Modelot_zm_Page() {
  const [model, setModel] = useState("");
  const [lot, setLot] = useState("");
  const [loading, setLoading] = useState(false);
  const [result_model, setrResModel] = useState([]);
  const [result_lot, setrResLot] = useState([]);
  const [result_congdoan, setrRescongdoan] = useState([]);
  const [result_label, setrReslabel] = useState<RowData[]>([]);
  const [thongtin, setrResthongtin] = useState<Datatt[]>([]);
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
      // const token = localStorage.getItem('token');
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
        "/logzm/get_log_zm_model_lot?" + queryString,
        "GET",
        undefined
      );
      setrRescongdoan(response.congdoan);
      setrReslabel(response.results);
      setrResthongtin(response.info);
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
  const columns = [
    {
      name: "Label",
      selector: (row: RowData) => row.label,
      cell: (row: RowData) => (
        <Link to={`/chi_tiet_label_zm/${encodeURIComponent(row.label)}`}>
          {row.label}
        </Link>
      ),
      sortable: true,
    },
    ...result_congdoan.map((congdoanItem) => ({
      name: congdoanItem,
      selector: (row: RowData) => row[congdoanItem] || " ",
      cell: (row: RowData) => row[congdoanItem] || " ",
      sortable: true,
    })),
  ];
  const row_md_1 = result_congdoan.length;
  let col =
    row_md_1 < 3
      ? 12
      : row_md_1 < 5
      ? 6
      : row_md_1 < 7
      ? 4
      : row_md_1 < 9
      ? 3
      : 2;

  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h5 className="fw-normal text-primary m-0">
          Dữ liệu log Zenmom <i className="far fa-question-circle"></i>
        </h5>
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
          <>
            <div className="bg-white body-table-top">
              <div className="row px-2">
                {thongtin.map((it, index) => (
                  <div key={index} className={`col-md-${col} p-3`}>
                    <div className="bg-xanh btn-mh d-flex flex-column align-items-center justify-content-center text-center">
                      <div style={{ fontWeight: "bold" }}>
                        {it.count_ok}/{it.soluong}
                      </div>
                      <div style={{ fontSize: "16px", marginTop: "4px" }}>
                        {it.congdoan}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white body-table-bt">
              <DataTable
                columns={columns}
                data={result_label}
                pagination
                paginationPerPage={10}
                fixedHeader
                fixedHeaderScrollHeight="calc(100vh - 398px)"
                responsive
                style={{ fontSize: "14px" }}
              />
            </div>
          </>
        )}
      </div>
    </MenuComponent>
  );
}

export default Modelot_zm_Page;

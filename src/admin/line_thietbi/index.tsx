import { useEffect, useState } from "react";
import MenuComponent from "../../Menu";
import { sendAPIRequest } from "../../utils/util";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { DataNC2 } from '../../utils/modelAPI';

function AdminPage() {  
  const [manhomcap2, setManhomcap2] = useState("");
  const [tennhomcap2, setTennhomcap2] = useState("");
  const [result_Nc2, setrResNc2] = useState<DataNC2[]>([]);
  // Xử lý sự kiện thay đổi giá trị của input 
  const get_nhom_cap_2 = async (filters = {}) => {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await sendAPIRequest(
        "/thietbi/get_nhom_cap_2?" + queryString,
        "GET",
        undefined
      );
      setrResNc2(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };
  const handleSearch = () => {
    get_nhom_cap_2({ manhomcap2, tennhomcap2 });
  };
  
  useEffect(() => {
    get_nhom_cap_2();
  }, []);

  const columns = [
    {
      name: "Mã nhóm cấp 2",
      selector: (row: DataNC2) => row.manhomcap2,
      sortable: true,
    },
    {
      name: "Tên nhóm cấp 2",
      selector: (row: DataNC2) => row.tennhomcap2,
      sortable: true,
    },
    {
      name: "",
      selector: (row: DataNC2) => row.manhomcap2,      
      cell: (row: DataNC2) => (
        <Link to={`/danh_sach_nc1_nc2/${encodeURIComponent(row.manhomcap2)}`}>
           <label htmlFor="" className="btn btn-info">Chi tiết</label>
        </Link>
      ),
      sortable: true,
    },
  ];
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h4 className="fw-normal text-primary m-0">
          Danh sách nhóm cấp 2 <i className="far fa-question-circle"></i>
        </h4>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Mã nhóm cấp 2</label>
              <input
                type="search"
                className="form-control"               
                value={manhomcap2}
                onChange={(e) => setManhomcap2(e.target.value)}
              />             
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Tên nhóm cấp 2</label>
              <input
                type="search"
                className="form-control"
                value={tennhomcap2}              
                onChange={(e) => setTennhomcap2(e.target.value)}
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
        <div className="bg-white body-table">
          <DataTable
            columns={columns}
            data={result_Nc2}
            pagination
            paginationPerPage={15}
            fixedHeader
            fixedHeaderScrollHeight="calc(100vh - 202px)"
            responsive
            style={{ fontSize: "16px" }}
          />
        </div>
      </div>
    </MenuComponent>
  );
}

export default AdminPage;

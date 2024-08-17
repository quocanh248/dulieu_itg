import { useEffect, useState } from "react";
import MenuComponent from "../../Menu";
import { sendAPIRequest } from "../../utils/util";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { DataNC2_NC1 } from '../../utils/modelAPI';
import { useParams } from "react-router-dom";

function AdminPage() {   
  const [result_Nc2, setrResNc2_Nc1] = useState<DataNC2_NC1[]>([]);
  const { manhomcap2 } = useParams<{ manhomcap2: string }>();
  const decodedmaNC2 = decodeURIComponent(manhomcap2 || "");
  // Xử lý sự kiện thay đổi giá trị của input 
  const get_nhom_cap_2_cap_1 = async () => {
    try {      
      const response = await sendAPIRequest(
        "/thietbi/get_nhom_cap_1_of_cap_2?manhomcap2="+decodedmaNC2,
        "GET",
        undefined
      );
      
      setrResNc2_Nc1(response);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };
   
  useEffect(() => {
    if (decodedmaNC2) {
        get_nhom_cap_2_cap_1();
    }
  }, [decodedmaNC2]);

  const columns = [
    {
      name: "Mã nhóm cấp 2",
      selector: (row: DataNC2_NC1) => row.manhomcap1,
      sortable: true,
    },
    {
      name: "Tên nhóm cấp 2",
      selector: (row: DataNC2_NC1) => row.tennhomcap1,
      sortable: true,
    },
    {
      name: "",
      selector: (row: DataNC2_NC1) => row.manhomcap1,      
      cell: (row: DataNC2_NC1) => (
        <Link to={`/danh_sach_nc1_nc2/${encodeURIComponent(row.manhomcap1)}`}>
           <label htmlFor="" className="btn btn-info">Chi tiết</label>
        </Link>
      ),
      sortable: true,
    },
  ];
  return (
    <MenuComponent>
      <div className="d-flex align-items-center bg-white px-4 py-1">
        <h5 className="fw-normal text-primary m-0">
          Danh sách nhóm cấp 1 <i className="far fa-question-circle"></i>
        </h5>
        <div className="d-flex ms-auto">
          <div className="input-custom ms-2" style={{visibility: "hidden"}}>
            <div>
              <label className="form-label text-secondary">Mã nhóm cấp 2</label>
              <input
                type="search"
                className="form-control"          
              />             
            </div>
          </div>
          <div className="input-custom ms-2">
            <div>
              <label className="form-label text-secondary">Tên nhóm cấp 2</label>
              <input
                type="search"
                className="form-control"               
              />             
            </div>
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
            selectableRows 
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

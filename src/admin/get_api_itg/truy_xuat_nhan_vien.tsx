import { useCallback, useEffect, useRef, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import React from 'react';

interface Data_API_mnv {
    model: string;
    lot: string;
    label: string;
    ngay: string;
    giobatdau: string;
    gioketthuc: string;
    ketqua: string;
    congdoan: string;
}
const Get_data_nv: React.FC = () => {
    const yesterday = new Date();
    const formattedDate = yesterday.toISOString().split('T')[0];
    const [date, setDate] = useState<string>(formattedDate);
    const [loading, setLoading] = useState(false);
    const [result_nhansu, setrResNhansu] = useState([]);
    const [manhansu, setManhansu] = useState('');
    const [resnone, setrRes] = useState<Data_API_mnv[]>([]);
    const gridRef = useRef<AgGridReact<Data_API_mnv> | null>(null);

    const clearFilters = useCallback(() => {
        if (gridRef.current) {
            const api = gridRef.current.api;
            if (api) {
                api.setFilterModel(null);
            }
        }
    }, []);
    const fetchmodel = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/nhansu/danh_sach_nhan_su?' + queryString,
                'GET',
                undefined
            );
            setrResNhansu(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
        }
    };
    const get_api_itg_mnv = async (filters = {}) => {
        setLoading(true); // Bắt đầu loading
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/truynguyen/get_api_mnv?' + queryString,
                'GET',
                undefined
            );
            console.log(response);
            if (response.status == 500) {
                alert('Lấy dữ liệu không thành công!');
            } else {
                setrRes(response);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        } finally {
            setLoading(false); // Kết thúc loading
        }
    };
    const handleSearch = () => {
        get_api_itg_mnv({ manhansu, date });
    };
    useEffect(() => {
        fetchmodel();
    }, []);
    const columnDefs1: ColDef<Data_API_mnv>[] = [
        {
            headerName: 'Model',
            field: 'model',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Lot',
            field: 'lot',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Label',
            field: 'label',
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            headerName: 'Công đoạn',
            field: 'congdoan',
            sortable: true,
        },
        {
            headerName: 'Ngày',
            field: 'ngay',
            sortable: true,
        },
        {
            headerName: 'Giờ bắt đầu',
            field: 'giobatdau',
            sortable: true,
        },
        {
            headerName: 'Giờ kết thúc',
            field: 'gioketthuc',
            sortable: true,
        },
        {
            headerName: 'Kết quả',
            field: 'ketqua',
            sortable: true,
            filter: true,
        },
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Truy xuất nhân viên <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Nhân viên</label>
                            <input
                                type="search"
                                className="form-control"
                                list="list_nhan_vien"
                                value={manhansu}
                                onChange={(e) => setManhansu(e.target.value)}
                            />
                            <datalist id="list_nhan_vien">
                                {result_nhansu.map((item) => (
                                    <option
                                        key={(item as { manhansu: string }).manhansu}
                                        value={(item as { manhansu: string }).manhansu}
                                    >
                                        {(item as { tennhansu: string }).tennhansu}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleSearch}>
                            <i className="fas fa-search"></i> Tìm
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2 border-start">
                        <button className="btn" onClick={() => clearFilters()}>
                            <i className="fas fa-redo"></i>
                        </button>
                    </div>
                </div>
            </div>
            {loading ? (
                <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ minHeight: '400px' }}
                >
                    <div className="loader"></div>
                </div>
            ) : (
                <>
                    <div className="p-3">
                        <div
                            className="ag-theme-quartz"
                            style={{ height: 'calc(100vh - 150px)', width: '100%' }}
                        >
                            <AgGridReact
                                ref={gridRef}
                                rowData={resnone}
                                columnDefs={columnDefs1}
                                defaultColDef={{
                                    resizable: true,
                                    flex: 1,
                                    minWidth: 100,
                                }}
                                pagination={true}
                                paginationPageSize={20}
                                rowDragManaged={true}
                                rowDragEntireRow={true}
                            />
                        </div>
                    </div>
                </>
            )}            
        </MenuComponent>
    );
};
export default Get_data_nv;

import React, { ChangeEvent, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import exportToExcel from '../../utils/exportToExcel';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';

// Định nghĩa kiểu cho dữ liệu hàng trong bảng
interface ItemData {
    manhansu: string;
    tennhansu: string;
    tennhom: string;
    model: string;
    lot: string;
    ngay: string;
    congdoan: string;
    vitri: string;
    soluong: number;
    thoigianthuchien: number;
    thoigianquydoi: number;
    sum_time: number;
    thoigianlamviec: number;
}

interface Data_tonghop {
    manhansu: string;
    tennhansu: string;
    tennhom: string;
    ngay: string;
    vitri: string;
    sum_soluong: number;
    sum_time: number;
}

const Admin_nang_suat: React.FC = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formattedDate = yesterday.toISOString().split('T')[0];
    const [date, setDate] = useState<string>(formattedDate);
    const [result, setResult] = useState<ItemData[]>([]);
    const [resultth, setResultTH] = useState<Data_tonghop[]>([]);
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);

    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        setDate(e.target.value);
    };

    const handleExport = async () => {
        try {
            const res = await fetchexcel({ date });
            if (res && res.length > 0) {
                const filename = `Dữ liệu năng suất ngày ${date}.xlsx`;
                await exportToExcel(res, filename);
            } else {
                console.log('Không có dữ liệu để xuất');
            }
        } catch (error) {
            console.error('Đã xảy ra lỗi:', error);
        }
    };

    const fetchexcel = async (filters: Record<string, any>): Promise<ItemData[]> => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/nang_suat/search?' + queryString,
                'GET',
                undefined
            );
            return response;
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
            return [];
        }
    };

    const fetchnangsuat = async (filters: Record<string, any>): Promise<void> => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/nang_suat/search_nhansu?' + queryString,
                'GET',
                undefined
            );
            setResultTH(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
        }
    };

    const columnDefs1: ColDef<Data_tonghop>[] = [
        {
            headerName: 'Mã nhân viên',
            field: 'manhansu',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên nhân viên',
            field: 'tennhansu',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Bộ phận',
            field: 'tennhom',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Ngày',
            field: 'ngay',
            sortable: true,
            filter: true,
            valueFormatter: (params: any) => format(new Date(params.value), 'dd/MM/yyyy'),
        },
        {
            headerName: 'Số lượng',
            field: 'sum_soluong',
            editable: true,
            sortable: true,
            filter: true,
            valueFormatter: (params: any) => {
                const value = Number(params.value);
                return isNaN(value) ? 'N/A' : value.toFixed(2);
            },
        },
        {
            headerName: 'Thời gian thực hiện',
            field: 'sum_time',
            sortable: true,
            filter: true,
            valueFormatter: (params: any) => {
                const value = Number(params.value);
                return isNaN(value) ? 'N/A' : value.toFixed(2);
            },
        },
    ];

    const columns_detail: ColDef<ItemData>[] = [
        {
            headerName: 'Tên nhân viên',
            field: 'tennhansu',
            sortable: true,
            filter: true,
            flex: 3,
        },
        {
            headerName: 'Model',
            field: 'model',
            sortable: true,
            filter: true,
            flex: 3,
        },
        {
            headerName: 'Lot',
            field: 'lot',
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            headerName: 'Công đoạn',
            field: 'congdoan',
            sortable: true,
            filter: true,
            flex: 3,
        },
        {
            headerName: 'Số lượng',
            field: 'soluong',
            editable: true,
            sortable: true,
            filter: true,
            flex: 2,
        },
        {
            headerName: 'TGTH',
            valueGetter: (params: any) => {
                const value = Number(params.data.thoigianthuchien);
                return isNaN(value) ? 'N/A' : value.toFixed(2);
            },
            sortable: true,
            flex: 1,
        },
        {
            headerName: 'TGQĐ',
            valueGetter: (params: any) => {
                const { thoigianthuchien, sum_time, thoigianlamviec } = params.data;
                return sum_time !== 0
                    ? ((thoigianthuchien / sum_time) * thoigianlamviec).toFixed(2)
                    : '0.00';
            },
            sortable: true,
            flex: 1,
        },
        {
            headerName: 'TGLV',
            field: 'thoigianlamviec',
            sortable: true,
            flex: 1,
        },
    ];

    const handleSearch = () => {
        fetchnangsuat({ date });
    };

    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            const n = format(new Date(data.ngay), 'yyyy-MM-dd');
            const response = await sendAPIRequest(
                `/nang_suat/search?manhansu=${encodeURIComponent(
                    data.manhansu
                )}&date=${encodeURIComponent(n)}`,
                'GET',
                undefined
            );
            setResult(response);
            toggleScrollAndModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };

    useEffect(() => {}, []);
    const toggleScrollAndModal = (isOpen: boolean) => {
        document.body.classList.toggle('no-scroll', isOpen);
        setIsFormEdit(isOpen);
    };

    const htmlDetailForm = (): React.ReactNode => (
        <div className={`modal-overlay ${isFormEdit ? 'd-block' : 'd-none'}`}>
            <div className={`modal ${isFormEdit ? 'd-block' : 'd-none'}`}>
                <div className="modal-dialog" style={{ width: '80%', maxWidth: 'none' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Chi tiết năng suất nhân sự</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => toggleScrollAndModal(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div id="basic" className="tab-pane fade show active">
                                <div className="row">
                                    <div
                                        className="ag-theme-quartz"
                                        style={{ height: 'calc(100vh - 308px)', width: '100%' }}
                                    >
                                        <AgGridReact
                                            rowData={result}
                                            columnDefs={columns_detail}
                                            defaultColDef={{
                                                sortable: true,
                                                filter: true,
                                                resizable: true,
                                                minWidth: 100,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <div className="ms-auto">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    data-bs-dismiss="modal"
                                    onClick={() => toggleScrollAndModal(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h4 className="fw-normal text-primary m-0">
                    Dữ liệu năng suất <i className="far fa-question-circle"></i>
                </h4>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <input
                            type="date"
                            className="form-control"
                            value={date}
                            onChange={handleDateChange}
                        />
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleSearch}>
                            <i className="fas fa-search"></i> Tìm
                        </button>
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                        <button className="btn btn-success" onClick={handleExport}>
                            <i className="fas fa-download"></i> Excel
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div
                    className="ag-theme-quartz"
                    style={{ height: 'calc(100vh - 150px)', width: '100%' }}
                >
                    <AgGridReact
                        rowData={resultth}
                        columnDefs={columnDefs1}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        pagination={true}
                        paginationPageSize={11}
                        rowDragManaged={true}
                        rowDragEntireRow={true}
                        onRowClicked={handleRowClicked}
                       
                    />
                </div>
            </div>
            {htmlDetailForm()}
        </MenuComponent>
    );
};

export default Admin_nang_suat;

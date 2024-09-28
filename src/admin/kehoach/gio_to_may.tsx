import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import React from 'react';
import { format } from 'date-fns';

interface Datapo {
    ngay: string;
    giotomay: string;
    po: string;
    check_chunhat: string;
}
function formatDate(dateString: string) {
    const date = new Date(dateString); // Tạo đối tượng Date từ chuỗi ngày
    return format(date, 'yyyy-MM-dd'); // Định dạng ngày thành YYYY-MM-DD
}
const Gio_TM_Page: React.FC = () => {
    const [po, setpo] = useState('');
    const [check_chunhat, setcheckchunhat] = useState<string>('K');
    const [ngay, setngay] = useState('');
    const [giotomay, setgiotomay] = useState('');
    const [result_PO, setrResPO] = useState<Datapo[]>([]);
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);

    const get_po = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/kehoach/get_po?' + queryString,
                'GET',
                undefined
            );
            setrResPO(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            setpo(data.po);
            const ngay = formatDate(data.ngay);
            setngay(ngay);
            setcheckchunhat(data.check_chunhat);
            setgiotomay(data.giotomay);
            toggleScrollAndModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };
    const toggleScrollAndModal = (isOpen: boolean) => {
        document.body.classList.toggle('no-scroll', isOpen);
        setIsFormEdit(isOpen);
    };
    const handleEditform = async () => {     
        if (!check_chunhat || !giotomay) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {
                po: po,
                ngay: ngay,
                giotomay: giotomay,
                check_chunhat: check_chunhat,
            };
            await sendAPIRequest('/kehoach/cap_nhat_giotm', 'POST', data);
            get_po();
            alert('Cập nhật thành công');
            toggleScrollAndModal(false);
        } catch (error) {
            console.error('Lỗi khi thêm tài khoản:', error);
            alert('Có lỗi xảy ra khi thêm tài khoản.');
        }
    };
    const htmlDetailForm = (): React.ReactNode => (
        <div className={`modal-overlay ${isFormEdit ? 'd-block' : 'd-none'}`}>
            <div className={`modal ${isFormEdit ? 'd-block' : 'd-none'}`}>
                <div className="modal-dialog" style={{ width: '80%', maxWidth: 'none' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Thông tin chi tiết</h5>
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
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">PO (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                value={po}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Ngày (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                value={ngay}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Giờ tổ máy(*)</label>
                                            <input
                                                type="time"
                                                className="form-control"
                                                autoComplete="off"
                                                value={giotomay}
                                                onChange={(e) => setgiotomay(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Chủ nhật (*)</label>
                                            <select
                                                className="form-select"
                                                value={check_chunhat}
                                                onChange={(e) => setcheckchunhat(e.target.value)}
                                            >
                                                <option value="K">Không</option>
                                                <option value="C">Có</option>
                                            </select>                                          
                                        </div>
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
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleEditform}
                                >
                                    Cập nhật
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    useEffect(() => {
        get_po();
    }, []);

    const columnDefs1: ColDef<Datapo>[] = [
        {
            headerName: 'PO',
            field: 'po',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Ngày',
            field: 'ngay',
            sortable: true,
            filter: true,
            valueFormatter: (params: any) => formatDate(params.value),
        },
        {
            headerName: 'Giờ tổ máy',
            field: 'giotomay',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Chủ nhật',
            field: 'check_chunhat',
            sortable: true,
            filter: true,
        },
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Cập nhật giờ tổ máy <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto" style={{ visibility: 'hidden' }}>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã thiết bị</label>
                            <input type="search" className="form-control" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div
                    className="ag-theme-alpine"
                    style={{ height: 'calc(100vh - 150px)', width: '100%' }}
                >
                    <AgGridReact
                        columnDefs={columnDefs1}
                        defaultColDef={{
                            resizable: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        rowData={result_PO}
                        rowSelection="multiple"
                        pagination={true}
                        paginationPageSize={20}
                        onRowClicked={handleRowClicked}
                    />
                </div>
            </div>
            {htmlDetailForm()}
        </MenuComponent>
    );
};

export default Gio_TM_Page;

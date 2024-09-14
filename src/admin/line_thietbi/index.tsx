import { ChangeEvent, useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { Link } from 'react-router-dom';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import { DataNC1, DataTB } from '../../utils/modelAPI';
import React from 'react';

const ThietbiPage: React.FC = () => {
    const [mathietbi, setMathietbi] = useState('');
    const [manhomcap1, setManhomcap1] = useState('');
    const [tenthietbi, setTenthietbi] = useState('');
    const [mathietbi_old, setMathietbi_old] = useState('');
    const [mathietbi_f, setMathietbi_f] = useState('');
    const [manhomcap1_f, setManhomcap1_f] = useState('');
    const [tenthietbi_f, setTenthietbi_f] = useState('');
    const [tennhomcap1_f, setTennhomcap1_f] = useState('');
    const [result_TB, setrResTB] = useState<DataTB[]>([]);
    const [result_NC1, setrResNC1] = useState<DataNC1[]>([]);
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);

    const handleManhansuChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedMnc1 = e.target.value;
        setManhomcap1_f(selectedMnc1);
        const selectedTenc1 =
            result_NC1.find((item) => item.manhomcap1 === selectedMnc1)?.tennhomcap1 || '';
        setTennhomcap1_f(selectedTenc1);
    };
    const get_thietbi = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/thietbi/get_thietbi?' + queryString,
                'GET',
                undefined
            );
            setrResTB(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    //get_nhom_cap_1
    const get_nhom_cap_1 = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/thietbi/get_nhom_cap_1?' + queryString,
                'GET',
                undefined
            );
            setrResNC1(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const handlesubmit = async () => {
        if (!manhomcap1 || !tenthietbi || !mathietbi) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {
                mathietbi: mathietbi,
                tenthietbi: tenthietbi,
                manhomcap1: manhomcap1,
            };
            await sendAPIRequest('/thietbi/them_thiet_bi', 'POST', data);
            alert('Thêm thiết bị thành công');
            get_thietbi();
            setManhomcap1('');
            setMathietbi('');
            setTenthietbi('');
        } catch (error) {
            console.error('Lỗi khi thêm tài khoản:', error);
            alert('Có lỗi xảy ra khi thêm tài khoản.');
        }
    };
    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            setMathietbi_old(data.mathietbi);
            setMathietbi_f(data.mathietbi);
            setManhomcap1_f(data.manhomcap1);
            setTenthietbi_f(data.tenthietbi);
            setTennhomcap1_f(data.tennhomcap1);
            toggleScrollAndModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };
    const toggleScrollAndModal = (isOpen: boolean) => {
        document.body.classList.toggle('no-scroll', isOpen);
        setIsFormEdit(isOpen);
    };
    const handleTrash = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const mathietbi = event.currentTarget.value;
        if (window.confirm('Bạn có chắc chắn muốn xóa thiết bị này?')) {          
            await sendAPIRequest('/thietbi/delete_thietbi', 'DELETE', { mathietbi });
            get_thietbi();
            alert('Xóa thiết bị thành công');
            toggleScrollAndModal(false);
        }
    };
    const handleEditform = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const mathietbi = event.currentTarget.value;
        if (!mathietbi_f || !tennhomcap1_f || !manhomcap1_f) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {
                mathietbi_old: mathietbi,
                mathietbi: mathietbi_f,
                tenthietbi: tenthietbi_f,
                manhomcap1: manhomcap1_f,
            };
            await sendAPIRequest('/thietbi/cap_nhat_thiet_bi', 'POST', data);
            alert('Cập nhật thiết bị thành công');
            get_thietbi();
            setManhomcap1('');
            setMathietbi('');
            setTenthietbi('');
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
                            <h5 className="modal-title">Thông tin thiết bị</h5>
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
                                            <label className="form-label">Mã thiết bị (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                value={mathietbi_f}
                                                onChange={(e) => setMathietbi_f(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Tên thiết bị (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                value={tenthietbi_f}
                                                onChange={(e) => setTenthietbi_f(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Mã nhóm cấp 1 (*)</label>
                                            <input
                                                type="text"
                                                list="list_nhan_su"
                                                className="form-control"
                                                autoComplete="off"
                                                value={manhomcap1_f}
                                                onChange={handleManhansuChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Tên nhóm cấp 1 (*)</label>
                                            <input
                                                type="text"
                                                readOnly
                                                className="form-control"
                                                autoComplete="off"
                                                value={tennhomcap1_f}
                                                onChange={(e) => setTennhomcap1_f(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-danger"
                                value={mathietbi_old}
                                onClick={handleTrash}
                            >
                                Xóa
                            </button>
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
                                    value={mathietbi_old}
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
        get_thietbi();
        get_nhom_cap_1();
    }, []);

    const columnDefs1: ColDef<DataTB>[] = [
        {
            headerName: 'Mã thiết bị',
            field: 'mathietbi',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên thiết bị',
            field: 'tenthietbi',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Mã nhóm cấp 1',
            field: 'manhomcap1',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên nhóm cấp 1',
            field: 'tennhomcap1',
            sortable: true,
            filter: true,
        },
        {
            headerName: '',
            field: 'mathietbi',
            sortable: true,
            cellRenderer: (params: any) => (
                <Link to={`http://30.0.2.8:8002/bar_code_thiebi/${encodeURIComponent(params.value)}`} target='_blank'>
                    In bar code
                </Link>
            ),
        },
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách thiết bị<i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã thiết bị</label>
                            <input
                                type="search"
                                className="form-control"
                                value={mathietbi}
                                onChange={(e) => setMathietbi(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Tên thiết bị</label>
                            <input
                                type="search"
                                className="form-control"
                                value={tenthietbi}
                                onChange={(e) => setTenthietbi(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã nhóm cấp 1</label>
                            <input
                                type="search"
                                className="form-control"
                                list="list_nhan_su"
                                value={manhomcap1}
                                onChange={(e) => setManhomcap1(e.target.value)}
                            />
                            <datalist id="list_nhan_su">
                                {result_NC1.map((item) => (
                                    <option key={item.manhomcap1} value={item.manhomcap1}>
                                        {item.tennhomcap1}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handlesubmit}>
                            <i className="fas fa-plus"></i> Thêm
                        </button>
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
                        rowData={result_TB}
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

export default ThietbiPage;

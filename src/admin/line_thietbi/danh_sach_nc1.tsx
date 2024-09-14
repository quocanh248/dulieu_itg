import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import { DataNC1 } from '../../utils/modelAPI';
import React from 'react';
import { Link } from 'react-router-dom';

const NC1Page: React.FC = () => {
    const [tennhomcap1, setTennhomcap1] = useState('');    
    const [manhomcap1, setManhomcap1] = useState('');    
    const [manhomcap1_old, setManhomcap1_old] = useState('');  
    const [manhomcap1_f, setManhomcap1_f] = useState('');   
    const [tennhomcap1_f, setTennhomcap1_f] = useState('');    
    const [result_NC1, setrResNC1] = useState<DataNC1[]>([]);
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
     
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
        if (!manhomcap1 || !tennhomcap1) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {                
                manhomcap1: manhomcap1,
                tennhomcap1: tennhomcap1,
            };
            await sendAPIRequest('/thietbi/them_nc1', 'POST', data);
            alert('Thêm nhóm cấp 1 thành công');
            get_nhom_cap_1();
            setManhomcap1('');
            setTennhomcap1('');          
        } catch (error) {
            console.error('Lỗi khi thêm tài khoản:', error);
            alert('Có lỗi xảy ra khi thêm tài khoản.');
        }
    };
    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            setManhomcap1_old(data.manhomcap1);            
            setManhomcap1_f(data.manhomcap1);           
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
        const manhomcap1 = event.currentTarget.value;
        if (window.confirm('Bạn có chắc chắn muốn xóa nhóm cấp 1 này?')) {          
            await sendAPIRequest('/thietbi/delete_nc1', 'DELETE', { manhomcap1 });
            get_nhom_cap_1();
            alert('Xóa nhóm cấp 1 thành công');
            toggleScrollAndModal(false);
        }
    };
    const handleEditform = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const manhomcap1 = event.currentTarget.value;
        if (!manhomcap1_f || !tennhomcap1_f) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {
                manhomcap1_old: manhomcap1,             
                tennhomcap1: tennhomcap1_f,
                manhomcap1: manhomcap1_f,
            };
            await sendAPIRequest('/thietbi/cap_nhat_nc1', 'POST', data);
            alert('Cập nhật nhóm cấp 1 thành công');
            get_nhom_cap_1();
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
                            <h5 className="modal-title">Thông tin nhóm cấp 1</h5>
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
                                            <label className="form-label">Mã nhóm cấp 1 (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                value={manhomcap1_f}
                                                onChange={(e) => setManhomcap1_f(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label">Tên nhóm cấp 1 (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                autoComplete="off"
                                                value={tennhomcap1_f}
                                                onChange={(e) => setManhomcap1_f(e.target.value)}
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
                                value={manhomcap1_old}
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
                                    value={manhomcap1_old}
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
        get_nhom_cap_1();
    }, []);

    const columnDefs1: ColDef<DataNC1>[] = [        
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
            field: 'manhomcap1',
            sortable: true,
            cellRenderer: (params: any) => (
                <Link to={`http://30.0.2.8:8002/in_qr_code/${encodeURIComponent(params.value)}`} target="_blank">
                    In bar code
                </Link>
            ),
        },    
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách nhóm cấp 1 <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã nhóm cấp 1</label>
                            <input
                                type="text"
                                className="form-control"
                                value={manhomcap1}
                                onChange={(e) => setManhomcap1(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Tên nhóm cấp 1</label>
                            <input
                                type="text"
                                className="form-control"
                                value={tennhomcap1}
                                onChange={(e) => setTennhomcap1(e.target.value)}
                            />
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
                        rowData={result_NC1}
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

export default NC1Page;

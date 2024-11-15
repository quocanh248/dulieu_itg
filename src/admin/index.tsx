import { useEffect, useState, ChangeEvent } from 'react';
import MenuComponent from '../Menu';
import { sendAPIRequest } from '../utils/util';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import React from 'react';

// Định nghĩa kiểu dữ liệu cho tài khoản
interface Account {
    manhansu: string;
    tennhansu: string;
    tennhom: string;
    role: string;
    id: string;
}

// Định nghĩa kiểu dữ liệu cho người dùng không có tài khoản
interface NoAccount {
    manhansu: string;
    tennhansu: string;
}

// Định nghĩa kiểu dữ liệu cho component
const AdminPage: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [noAccounts, setNoAccounts] = useState<NoAccount[]>([]);
    const [matkhau, setMatkhau] = useState<string>('');
    const [xacnhanmatkhau, setXacnhanMatkhau] = useState<string>('');
    const [vaitro, setVaitro] = useState<string>('admin');
    const [manhansuAcc, setManhansuAcc] = useState<string>('');
    const [tennhansuAcc, setTennhansuAcc] = useState<string>('');
    const [isFormAdd, setIsFormAdd] = useState<boolean>(false);
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
    const [matkhau_edit, setMatkhau_edit] = useState<string>('');
    const [xacnhanmatkhau_edit, setXacnhanMatkhau_edit] = useState<string>('');
    const [vaitro_edit, setVaitro_edit] = useState<string>('');
    const [manhansu_edit, setManhansu_edit] = useState<string>('');
    const [tennhansu_edit, setTennhansu_edit] = useState<string>('');

    const handleManhansuChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedManhansu = e.target.value;
        setManhansuAcc(selectedManhansu);
        const selectedTennhansu =
            noAccounts.find((item) => item.manhansu === selectedManhansu)?.tennhansu || '';
        setTennhansuAcc(selectedTennhansu);
    };
    // Fetch accounts with optional filters
    const fetchAccounts = async (filters: Record<string, string> = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest('/users/list?' + queryString, 'GET', undefined);
            setAccounts(response);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tài khoản:', error);
        }
    };
    const fetchNoAccounts = async (filters: Record<string, string> = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/users/list_nouser?' + queryString,
                'GET',
                undefined
            );
            setNoAccounts(response);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách tài khoản không có người dùng:', error);
        }
    };
    // Fetch accounts when component mounts
    useEffect(() => {
        fetchAccounts();
    }, []);
    const toggleScrollAndModal = (isOpen: boolean, formadd: boolean, formedit: boolean) => {
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        if (isOpen && formadd) {
            setIsFormAdd(true);
        } else if (isOpen && formedit) {
            setIsFormEdit(true);
        } else {
            setIsFormAdd(false);
            setIsFormEdit(false);
        }
    };
    const openAddForm = () => {
        fetchNoAccounts();
        setMatkhau('');
        setXacnhanMatkhau('');
        setVaitro('admin');
        setManhansuAcc('');
        setTennhansuAcc('');
        toggleScrollAndModal(true, true, false);
    };
    const handleSubmit = async () => {
        if (!manhansuAcc || !tennhansuAcc || !matkhau || !xacnhanmatkhau || !vaitro) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }

        if (matkhau !== xacnhanmatkhau) {
            alert('Mật khẩu và xác nhận mật khẩu không khớp.');
            return;
        }
        try {
            const data = {
                manhansu_acc: manhansuAcc,
                matkhau: matkhau,
                vaitro: vaitro,
            };

            await sendAPIRequest('/users/add', 'POST', data);
            alert('Thêm tài khoản thành công!');
            fetchAccounts();
            setIsFormAdd(false);
        } catch (error) {
            console.error('Lỗi khi thêm tài khoản:', error);
            alert('Có lỗi xảy ra khi thêm tài khoản.');
        }
    };
    const htmlAddForm = (): JSX.Element => {
        return (
            <div className={`modal-overlay ${isFormAdd ? 'd-block' : 'd-none'}`}>
                <div className={`modal ${isFormAdd ? 'd-block' : 'd-none'}`}>
                    <div className="modal-dialog" style={{ width: '80%', maxWidth: 'none' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Thêm tài khoản</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => toggleScrollAndModal(false, false, false)}
                                ></button>
                            </div>
                            <div className="modal-body">                               
                                <div id="basic" className="tab-pane fade show active">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Mã nhân sự (*)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    autoComplete="off"
                                                    list="list_nhan_su"
                                                    id="manhansu"
                                                    value={manhansuAcc}
                                                    onChange={handleManhansuChange}
                                                />
                                                <datalist id="list_nhan_su">
                                                    {noAccounts.map((item) => (
                                                        <option
                                                            key={item.manhansu}
                                                            value={item.manhansu}
                                                        >
                                                            {item.tennhansu}
                                                        </option>
                                                    ))}
                                                </datalist>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Tên nhân sự</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    readOnly
                                                    value={tennhansuAcc}
                                                />
                                            </div>
                                        </div>
                                    </div>                             
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Mật khẩu (*)</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    autoComplete="off"
                                                    value={matkhau}
                                                    onChange={(e) => setMatkhau(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Xác nhận mật khẩu (*)
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    autoComplete="off"
                                                    value={xacnhanmatkhau}
                                                    onChange={(e) =>
                                                        setXacnhanMatkhau(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>                                   
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Vai trò (*)</label>
                                                <select
                                                    className="form-select"
                                                    id="vaitro"
                                                    value={vaitro}
                                                    onChange={(e) => setVaitro(e.target.value)}
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="thietbi">
                                                        Quản lý thiết bị
                                                    </option>
                                                    <option value="oi">Quản lý màn hình</option>
                                                    <option value="nangxuat">Xem năng xuất</option>
                                                    <option value="kehoach">Kế hoạch</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => toggleScrollAndModal(false, false, false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
                                >
                                    Thêm tài khoản
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            const response = await sendAPIRequest(
                '/users/user_info?id=' + data.id,
                'GET',
                undefined
            );
            const userData = response[0];
            // console.log(userData);
            setXacnhanMatkhau_edit('');
            setMatkhau_edit('');
            setVaitro_edit(userData.role || 'admin');
            setManhansu_edit(userData.manhansu || '');
            setTennhansu_edit(userData.tennhansu || '');
            toggleScrollAndModal(true, false, true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            // Xử lý lỗi nếu cần thiết
        }
    };
    const handle_Edit_Submit = async () => {
        if (matkhau != '') {
            if (matkhau !== xacnhanmatkhau) {
                alert('Mật khẩu và xác nhận mật khẩu không khớp.');
                return;
            }
        }
        try {
            const data = {
                manhansu_edit: manhansu_edit,
                matkhau_edit: matkhau_edit,
                vaitro_edit: vaitro_edit,
            };
            await sendAPIRequest('/users/edit', 'POST', data);
            alert('Cập nhật tài khoản thành công!');
            toggleScrollAndModal(true, false, false);
        } catch (error) {
            console.error('Lỗi khi thêm tài khoản:', error);
            alert('Có lỗi xảy ra khi thêm tài khoản.');
        }
    };
    const htmlEditForm = (): React.ReactNode => {
        return (
            <div className={`modal-overlay ${isFormEdit ? 'd-block' : 'd-none'}`}>
                <div className={`modal ${isFormEdit ? 'd-block' : 'd-none'}`}>
                    <div className="modal-dialog" style={{ width: '80%', maxWidth: 'none' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Cập nhật tài khoản</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => toggleScrollAndModal(false, false, false)}
                                ></button>
                            </div>
                            <div className="modal-body">                               
                                <div id="basic" className="tab-pane fade show active">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Mã nhân sự (*)</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    readOnly
                                                    value={manhansu_edit}
                                                    onChange={(e) =>
                                                        setMatkhau_edit(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Tên nhân sự</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    readOnly
                                                    value={tennhansu_edit}
                                                    onChange={(e) =>
                                                        setTennhansu_edit(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>                                   
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">Mật khẩu (*)</label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    autoComplete="off"
                                                    value={matkhau_edit}
                                                    onChange={(e) =>
                                                        setMatkhau_edit(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Xác nhận mật khẩu (*)
                                                </label>
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    autoComplete="off"
                                                    value={xacnhanmatkhau_edit}
                                                    onChange={(e) =>
                                                        setXacnhanMatkhau_edit(e.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>                                
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="mb-3">
                                                <label className="form-label">Vai trò (*)</label>
                                                <select
                                                    className="form-select"
                                                    id="vaitro"
                                                    value={vaitro_edit}
                                                    onChange={(e) => setVaitro_edit(e.target.value)}
                                                >
                                                    <option value="admin">Admin</option>
                                                    <option value="thietbi">
                                                        Quản lý thiết bị
                                                    </option>
                                                    <option value="oi">Quản lý màn hình</option>
                                                    <option value="nangxuat">Xem năng xuất</option>
                                                    <option value="kehoach">Kế hoạch</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleTrash}
                                >
                                    Xóa
                                </button>
                                <div className="ms-auto">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        data-bs-dismiss="modal"
                                        onClick={() => toggleScrollAndModal(false, false, false)}
                                    >
                                        Đóng
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handle_Edit_Submit}
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
    };
    const handleTrash = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa user này không?')) {
            var userid = manhansu_edit;
            await sendAPIRequest('/users/delete', 'DELETE', { userid });
            fetchAccounts();
            alert('Xóa user thành công');
            toggleScrollAndModal(false, false, false);
        }
    };   
    const columnDefs1: ColDef<Account>[] = [
        {
            headerName: 'Mã nhân sự',
            field: 'manhansu',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên nhân sự',
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
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách tài khoản <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2" style={{ visibility: 'hidden' }}>
                        <div>
                            <label className="form-label text-secondary">Model</label>
                            <input type="search" />
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center">
                        <button className="btn btn-primary" onClick={openAddForm}>
                            Thêm
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
                        rowData={accounts}
                        columnDefs={columnDefs1}
                        defaultColDef={{
                            sortable: true,
                            filter: true,
                            resizable: true,
                            flex: 1,
                            minWidth: 100,
                        }}
                        pagination={true}
                        paginationPageSize={20}
                        rowDragManaged={true}
                        rowDragEntireRow={true}
                        onRowClicked={handleRowClicked}
                    />
                </div>
                {htmlAddForm()}
                {htmlEditForm()}
            </div>
        </MenuComponent>
    );
};

export default AdminPage;

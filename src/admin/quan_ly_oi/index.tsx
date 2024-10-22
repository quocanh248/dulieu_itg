import { ChangeEvent, useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import React from 'react';

interface List_OI {
    ip: string;
    congdoan: string;
    tencongdoan: string;
    xuattape: string;
    quetthung: string;
    xuatlabel: string;
}

interface List_congdoan {
    macongdoan: string;
    tencongdoan: string;
}
const ThietbiPage: React.FC = () => {
    const [ip_old, setip_old] = useState('');
    const [ip_edit, setip_edit] = useState('');
    const [macongdoan_edit, setmacongdoan_edit] = useState('');
    const [tencongdoan_edit, settencongdoan_edit] = useState('');
    const [quetthung_edit, setquetthung_edit] = useState(false);
    const [xuattape_edit, setxuattape_edit] = useState(false);
    const [xuatlabel_edit, setxuatlabel_edit] = useState(false);
    const [ip_add, setip_add] = useState('');
    const [macongdoan_add, setmacongdoan_add] = useState('');
    const [tencongdoan_add, settencongdoan_add] = useState('');
    const [quetthung_add, setquetthung_add] = useState(false);
    const [xuattape_add, setxuattape_add] = useState(false);
    const [xuatlabel_add, setxuatlabel_add] = useState(false);
    const [result_OI, setrResOI] = useState<List_OI[]>([]);
    const [result_CD, setrResCD] = useState<List_congdoan[]>([]);
    const [result_OIYC, setresOIyeucau] = useState<List_OI[]>([]);
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
    const [isFormAdd, setIsFormAdd] = useState<boolean>(false);

    const handlemacdChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedMcd = e.target.value;
        setmacongdoan_edit(selectedMcd);
        const tencongdoan =
            result_CD.find((item) => item.macongdoan === selectedMcd)?.tencongdoan || '';
        settencongdoan_edit(tencongdoan);
    };
    const handlemacdaddChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedMcd = e.target.value;
        setmacongdoan_add(selectedMcd);
        const tencongdoan =
            result_CD.find((item) => item.macongdoan === selectedMcd)?.tencongdoan || '';
        settencongdoan_add(tencongdoan);
    };
    const get_data = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/device/list_oi?' + queryString,
                'GET',
                undefined
            );
            setrResOI(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const get_cong_doan = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/device/get_cong_doan?' + queryString,
                'GET',
                undefined
            );
            setrResCD(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const oi_yeu_cau = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/device/oi_yeu_cau?' + queryString,
                'GET',
                undefined
            );
            setresOIyeucau(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    let isSubmitting = false;

    const handlesubmit = async () => {
        if (isSubmitting) return; // Nếu đang gửi request, không cho phép gọi lại
        isSubmitting = true; // Đánh dấu là đang gửi request

        if (!ip_add || !macongdoan_add) {
            alert('Vui lòng điền đầy đủ thông tin.');
            isSubmitting = false; // Mở lại sau khi kiểm tra lỗi
            return;
        }

        try {
            const data = {
                ip: ip_add,
                macongdoan: macongdoan_add,
                tencongdoan: tencongdoan_add,
                quetthung: quetthung_add,
                xuattape: xuattape_add,
                xuatlabel: xuatlabel_add,
            };

            const res = await sendAPIRequest('/device/them_oi', 'POST', data);
            if (res.status === 209) {
                alert('OI này đã tồn tại, kiểm tra lại!');
            } else if (res.status === 201) {
                alert('Thêm OI thành công');
                get_data();
                toggleScrollAndModal_add(false);
                oi_yeu_cau();
                setip_add('');
                setmacongdoan_add('');
                settencongdoan_add('');
                setxuattape_add(false);
                setquetthung_add(false);
                setxuatlabel_add(false);
            } else {
                alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error('Lỗi khi thêm OI:', error);
            alert('Có lỗi xảy ra khi thêm công đoạn.');
        } finally {
            isSubmitting = false; // Đảm bảo mở khóa sau khi hoàn thành request
        }
    };

    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            setip_edit(data.ip);
            setip_old(data.ip);
            setmacongdoan_edit(data.congdoan);
            settencongdoan_edit(data.tencongdoan);
            setquetthung_edit(data.quetthung == 'true' ? true : false);
            setxuattape_edit(data.xuattape == 'true' ? true : false);
            setxuatlabel_edit(data.xuatlabel == 'true' ? true : false);
            toggleScrollAndModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };
    const toggleScrollAndModal = (isOpen: boolean) => {
        document.body.classList.toggle('no-scroll', isOpen);
        setIsFormEdit(isOpen);
    };
    const toggleScrollAndModal_add = (isOpen: boolean) => {
        document.body.classList.toggle('no-scroll', isOpen);
        setIsFormAdd(isOpen);
    };
    const handleTrash = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const ip = event.currentTarget.value;
        if (window.confirm('Bạn có chắc chắn muốn xóa IP?')) {
            await sendAPIRequest('/device/delete_oi', 'DELETE', { ip });
            get_data();
            alert('Xóa thành công');
            toggleScrollAndModal(false);
        }
    };
    const handleEditform = async (event: React.MouseEvent<HTMLButtonElement>) => {
        const ip = event.currentTarget.value;
        if (!ip_edit || !macongdoan_edit) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {
                ip_old: ip,
                ip: ip_edit,
                macongdoan: macongdoan_edit,
                tencongdoan: tencongdoan_edit,
                quetthung: quetthung_edit,
                xuattape: xuattape_edit,
                xuatlabel: xuatlabel_edit,
            };
            const res = await sendAPIRequest('/device/cap_nhat_oi', 'POST', data);
            if (res.status === 209) {
                alert('OI này đã tồn tại kiểm tra lại!');
            } else {
                alert('cập nhật OI thành công');
                get_data();
                toggleScrollAndModal(false);
                setip_edit('');
                setmacongdoan_edit('');
                settencongdoan_edit('');
                setxuattape_edit(false);
                setquetthung_edit(false);
                setxuatlabel_edit(false);
            }
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
                            <h5 className="modal-title">Thông tin</h5>
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
                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <label className="form-label">IP (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                list='list_oi'
                                                autoComplete="off"
                                                value={ip_edit}
                                                onChange={(e) => setip_edit(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-5">
                                        <div className="mb-3">
                                            <label className="form-label">Mã công đoạn (*)</label>
                                            <input
                                                type="text"
                                                list="list_cd"
                                                className="form-control"
                                                autoComplete="off"
                                                value={macongdoan_edit}
                                                onChange={handlemacdChange}
                                            />
                                            <datalist id="list_cd">
                                                {result_CD.map((item) => (
                                                    <option
                                                        key={item.macongdoan}
                                                        value={item.macongdoan}
                                                    >
                                                        {item.tencongdoan}
                                                    </option>
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>
                                    <div className="col-md-5">
                                        <div className="mb-3">
                                            <label className="form-label">Tên công đoạn (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={tencongdoan_edit}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    Quét thùng
                                                </label>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={quetthung_edit}
                                                    onChange={(e) =>
                                                        setquetthung_edit(e.target.checked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    Xuất tape
                                                </label>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={xuattape_edit}
                                                    onChange={(e) =>
                                                        setxuattape_edit(e.target.checked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    Xuất sản phẩm
                                                </label>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={xuatlabel_edit}
                                                    onChange={(e) =>
                                                        setxuatlabel_edit(e.target.checked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-danger"
                                value={ip_old}
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
                                    value={ip_old}
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
    const htmlAddForm = (): React.ReactNode => (
        <div className={`modal-overlay ${isFormAdd ? 'd-block' : 'd-none'}`}>
            <div className={`modal ${isFormAdd ? 'd-block' : 'd-none'}`}>
                <div className="modal-dialog" style={{ width: '80%', maxWidth: 'none' }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Thông tin</h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => toggleScrollAndModal_add(false)}
                            ></button>
                        </div>
                        <div className="modal-body">
                            <div id="basic" className="tab-pane fade show active">
                                <div className="row">
                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <label className="form-label">IP (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                list='list_oi'
                                                autoComplete="off"
                                                value={ip_add}
                                                onChange={(e) => setip_add(e.target.value)}
                                            />
                                            <datalist id="list_oi">
                                                {result_OIYC.map((item) => (
                                                    <option
                                                        key={item.ip}
                                                        value={item.ip}
                                                    >
                                                        {item.ip}
                                                    </option>
                                                ))}
                                            </datalist>
                                        </div>
                                    </div>
                                    <div className="col-md-5">
                                        <div className="mb-3">
                                            <label className="form-label">Mã công đoạn (*)</label>
                                            <input
                                                type="text"
                                                list="list_cd"
                                                className="form-control"
                                                autoComplete="off"
                                                value={macongdoan_add}
                                                onChange={handlemacdaddChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-5">
                                        <div className="mb-3">
                                            <label className="form-label">Tên công đoạn (*)</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={tencongdoan_add}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    Quét thùng
                                                </label>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={quetthung_add}
                                                    onChange={(e) =>
                                                        setquetthung_add(e.target.checked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    Xuất tape
                                                </label>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={xuattape_add}
                                                    onChange={(e) =>
                                                        setxuattape_add(e.target.checked)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-2">
                                        <div className="mb-3">
                                            <div className="form-check">
                                                <label className="form-check-label">
                                                    Xuất sản phẩm
                                                </label>
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={xuatlabel_add}
                                                    onChange={(e) =>
                                                        setxuatlabel_add(e.target.checked)
                                                    }
                                                />
                                            </div>
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
                                    onClick={() => toggleScrollAndModal_add(false)}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    value={ip_edit}
                                    className="btn btn-primary"
                                    onClick={handlesubmit}
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
        get_data();
        get_cong_doan();
        oi_yeu_cau();
    }, []);

    const columnDefs1: ColDef<List_OI>[] = [
        {
            headerName: 'IP',
            field: 'ip',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Mã công đoạn',
            field: 'congdoan',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Tên công đoạn',
            field: 'tencongdoan',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Quét thùng',
            field: 'quetthung',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Xuất tape',
            field: 'xuattape',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Xuất sản phẩm',
            field: 'xuatlabel',
            sortable: true,
            filter: true,
        },
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách màn hình <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => toggleScrollAndModal_add(true)}
                        >
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
                        rowData={result_OI}
                        rowSelection="multiple"
                        pagination={true}
                        paginationPageSize={20}
                        onRowClicked={handleRowClicked}
                    />
                </div>
            </div>
            {htmlDetailForm()}
            {htmlAddForm()}
        </MenuComponent>
    );
};

export default ThietbiPage;

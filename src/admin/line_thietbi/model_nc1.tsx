import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { Ban_NC1 } from '../../utils/modelAPI';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ColDef } from 'ag-grid-community';
import React from 'react';

interface List_Model {
    mamodel: string;
}
interface Ban_data {
    manhomcap1: string;
}
interface BNC1_data {
    manhomcap1: string;
}
const Model_nc1_Page = () => {
    const [result_Ban_NC1, setResultBan_NC1] = useState<Ban_NC1[]>([]);
    const [result_Model, setResultModel] = useState<List_Model[]>([]);
    const [result_Ban, setResultBan] = useState<Ban_data[]>([]);
    const [result_NC1, setResultNC1] = useState<BNC1_data[]>([]);
    const [id, setid] = useState<string>('');
    const [mamodel, setMamodel] = useState<string>('');
    const [maban, setmaban] = useState<string>('');
    const [manhomcap1, setmanhomcap1] = useState<string>('');
    const [maban_edit, setmaban_edit] = useState<string>('');
    const [manc1_edit, setmanc1_edit] = useState<string>('');
    const [mamodel_edit, setmodel_edit] = useState<string>('');
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);

    const get_ban_nc1 = async () => {
        try {
            const response = await sendAPIRequest('/thietbi/get_ban_nc1', 'GET');
            setResultBan_NC1(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const get_model = async () => {
        try {
            const response = await sendAPIRequest('/thietbi/get_model', 'GET');
            setResultModel(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const get_maban = async () => {
        try {
            const response = await sendAPIRequest('/thietbi/get_maban', 'GET');
            setResultBan(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const get_nhomcap1 = async () => {
        try {
            const response = await sendAPIRequest('/thietbi/get_nhomcap1', 'GET');
            setResultNC1(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            setmaban_edit(data.maban);
            setmanc1_edit(data.manhomcap1);
            setmodel_edit(data.mamodel);
            setid(data.id);
            toggleScrollAndModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
        }
    };

    useEffect(() => {
        get_ban_nc1();
        get_nhomcap1();
        get_maban();
        get_model();
    }, []);
    const handleSubmit = async () => {
        if (!mamodel_edit || !maban_edit || !manc1_edit) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {
                id: id,
                mamodel: mamodel,
                maban: maban,
                manhomcap1: manhomcap1,
            };
            await sendAPIRequest('/thietbi/cap_nhat_model_nc1', 'POST', data);
            alert('Cập nhật thành công');

            toggleScrollAndModal(false);
        } catch (error) {
            console.error('Lỗi khi thêm tài khoản:', error);
            alert('Có lỗi xảy ra khi thêm tài khoản.');
        }
    };
    const handleAddline = async () => {
        if (!mamodel || !maban || !manhomcap1) {
            alert('Vui lòng điền đầy đủ thông tin.');
            return;
        }
        try {
            const data = {
                mamodel: mamodel,
                maban: maban,
                manhomcap1: manhomcap1,
            };
            await sendAPIRequest('/thietbi/them_model_nc1', 'POST', data);
            alert('Thêm thành công');
            setMamodel('');
            setmaban('');
            setmanhomcap1('');
            get_ban_nc1();
        } catch (error) {
            console.error('Lỗi khi thêm tài khoản:', error);
            alert('Có lỗi xảy ra khi thêm tài khoản.');
        }
    };
    // Define column definitions for AG Grid
    const columnDefs1: ColDef<Ban_NC1>[] = [
        {
            headerName: 'ID',
            field: 'id',
            hide: true,
        },
        {
            headerName: 'Model',
            field: 'mamodel',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Bàn',
            field: 'maban',
            sortable: true,
            filter: true,
        },
        {
            headerName: 'Mã nhóm cấp 1',
            field: 'manhomcap1',
            sortable: true,
            filter: true,
        },
    ];

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
                            <h5 className="modal-title">Chi tiết</h5>
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
                                    <div className="col-md-4">
                                        <label className="form-label text-secondary">
                                            Mã model
                                        </label>
                                        <input
                                            type="search"
                                            className="form-control"
                                            value={mamodel_edit}
                                            list="list_model"
                                            onChange={(e) => setmodel_edit(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-secondary">Mã bàn</label>
                                        <input
                                            type="search"
                                            className="form-control"
                                            value={maban_edit}
                                            list="list_ban"
                                            onChange={(e) => setmaban_edit(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label text-secondary">
                                            Mã nhóm cấp 1
                                        </label>
                                        <input
                                            type="search"
                                            className="form-control"
                                            value={manc1_edit}
                                            list="listnc1"
                                            onChange={(e) => setmanc1_edit(e.target.value)}
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
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    value={id}
                                    className="btn btn-primary"
                                    onClick={handleSubmit}
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

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Model - nhóm cấp 1 <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã model</label>
                            <input
                                type="search"
                                className="form-control"
                                value={mamodel}
                                list="list_model"
                                onChange={(e) => setMamodel(e.target.value)}
                            />
                            <datalist id="list_model">
                                {result_Model.map((item) => (
                                    <option key={item.mamodel} value={item.mamodel}>
                                        {item.mamodel}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã bàn</label>
                            <input
                                type="search"
                                className="form-control"
                                value={maban}
                                list="list_ban"
                                onChange={(e) => setmaban(e.target.value)}
                            />
                            <datalist id="list_ban">
                                {result_Ban.map((item) => (
                                    <option key={item.manhomcap1} value={item.manhomcap1}>
                                        {item.manhomcap1}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã nhóm cấp 1</label>
                            <input
                                type="search"
                                className="form-control"
                                value={manhomcap1}
                                list="listnc1"
                                onChange={(e) => setmanhomcap1(e.target.value)}
                            />
                            <datalist id="listnc1">
                                {result_NC1.map((item) => (
                                    <option key={item.manhomcap1} value={item.manhomcap1}>
                                        {item.manhomcap1}
                                    </option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleAddline}>
                            <i className="fas fa-plus"></i> Thêm
                        </button>
                    </div>
                </div>
            </div>

            {/* Hiển thị danh sách nhóm cấp 1 */}
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
                        rowData={result_Ban_NC1}
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

export default Model_nc1_Page;

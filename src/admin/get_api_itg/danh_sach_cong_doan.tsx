import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ColDef } from 'ag-grid-community';
import { CongDoan, TableKetquaProps, Thuoctinh } from '../../utils/modelAPI';
import React from 'react';

const Admin_danh_sach_cong_doan: React.FC = () => {
    const [congdoans, setCongdoans] = useState<CongDoan[]>([]);
    const [macongdoanEdit, setMacongdoanEdit] = useState<string>('');
    const [tencongdoanEdit, setTencongdoanEdit] = useState<string>('');
    const [sttEdit, setSttEdit] = useState<string>('');   
    const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
    const [thuoctinhEdit, setThuoctinhEdit] = useState<string>('');
    const [thuoctinhIp, setThuoctinhIp] = useState<string>('');

    const fetchCongdoan = async (filters: Record<string, any> = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/truynguyen/listcongdoan?' + queryString,
                'GET',
                undefined
            );
            setCongdoans(response);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách công đoạn:', error);
        }
    };

    useEffect(() => {
        fetchCongdoan();
    }, []);
    
    const columnDefs1: ColDef<CongDoan>[] = [
        {
            headerName: 'Mã công đoạn',
            field: 'macongdoan',
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
            headerName: 'STT',
            field: 'stt',
            sortable: true,
            filter: true,
        },
    ];
    const handleRowClicked = async (row: any) => {
        try {
            const data = row.data;
            const response = await sendAPIRequest(
                '/truynguyen/chitietcongdoan?macongdoan=' + data.macongdoan,
                'GET',
                undefined
            );
            const congdoanData = response[0];
            setThuoctinhIp('');
            setMacongdoanEdit(congdoanData.macongdoan);
            setTencongdoanEdit(congdoanData.tencongdoan);
            setSttEdit(congdoanData.stt);
            setThuoctinhEdit(congdoanData.thuoctinh);
            toggleScrollAndModal(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin người dùng:', error);
            // Xử lý lỗi nếu cần thiết
        }
    };
    const toggleScrollAndModal = (isOpen: boolean) => {
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            // document.body.classList.remove("no-scroll");
        }
        setIsFormEdit(true);
    };
    const TableKetqua: React.FC<TableKetquaProps> = ({ item, macongdoan }) => {
        // Phân tích chuỗi JSON item thành đối tượng
        const thuoctinhs: Thuoctinh = JSON.parse(item);

        // Kiểm tra nếu thuoctinhs là null hoặc không có thuộc tính
        if (!thuoctinhs || Object.keys(thuoctinhs).length === 0) {
            return <div className="row"></div>;
        }

        return (
            <table className="table table-bordered text-center">
                <thead>
                    <tr>
                        <th>Thuộc tính</th>
                        <th>Giá trị</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(thuoctinhs).map(([key, value]) =>
                        value !== null ? (
                            <tr key={key}>
                                <td>{key}</td>
                                <td>{value}</td> {/* Hiển thị giá trị thực tế */}
                                <td>
                                    <button
                                        className="btn btn-danger"
                                        style={{ marginLeft: '5px' }}
                                        role="button"
                                        onClick={() =>
                                            handleTrashThuoctinhCd(macongdoan, key, thuoctinhs)
                                        }
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ) : null
                    )}
                    {Object.keys(thuoctinhs).length === 0 && (
                        <tr>
                            <td colSpan={3}>
                                <label style={{ marginLeft: '120px' }}>
                                    Công đoạn không có thuộc tính
                                </label>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    };
    const handleTrashThuoctinhCd = async (
        macongdoan: string,
        key: string,
        thuoctinhs: Thuoctinh
    ) => {
        try {
            if (window.confirm('Bạn có chắc chắn muốn xóa thuộc tính này không?')) {
                delete thuoctinhs[key];
                const data = {
                    macongdoan: macongdoan,
                    thuoctinh: JSON.stringify(thuoctinhs),
                };
                await sendAPIRequest('/truynguyen/capnhatcongdoan', 'PUT', data);
                showEditForm(macongdoan);
            }
        } catch (error) {
            console.error('Lỗi khi xóa thuộc tính công đoạn:', error);
        }
    };
    const showEditForm = async (macongdoan: string) => {
        try {
            const response = await sendAPIRequest(
                '/truynguyen/chitietcongdoan?macongdoan=' + macongdoan,
                'GET',
                undefined
            );
            const congdoanData = response[0];
            setThuoctinhIp('');
            setMacongdoanEdit(congdoanData.macongdoan);
            setTencongdoanEdit(congdoanData.tencongdoan);
            setSttEdit(congdoanData.stt);
            setThuoctinhEdit(congdoanData.thuoctinh);
            setIsFormEdit(true);
        } catch (error) {
            console.error('Lỗi khi lấy thông tin công đoạn:', error);
        }
    };

    const htmlEditForm = () => {
        return (
            <div className={`modal-overlay ${isFormEdit ? 'd-block' : 'd-none'}`}>
                <div className={`modal ${isFormEdit ? 'd-block' : 'd-none'}`}>
                    <div className="modal-dialog" style={{ width: '80%', maxWidth: 'none' }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Cập nhật công đoạn</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={() => setIsFormEdit(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div id="basic" className="tab-pane fade show active">
                                    <div className="row">
                                        <div className="col-md-5">
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Mã công đoạn (*)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            readOnly
                                                            value={macongdoanEdit}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Tên công đoạn (*)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            readOnly
                                                            value={tencongdoanEdit}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            STT (*)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            readOnly
                                                            value={sttEdit}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-7 border-start">
                                            <div className="row">
                                                <div className="col-md-10">
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Thuộc tính
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Thuộc tính"
                                                            value={thuoctinhIp}
                                                            onChange={(e) =>
                                                                setThuoctinhIp(e.target.value)
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="mb-3">
                                                        <label
                                                            className="form-label"
                                                            style={{ color: 'white' }}
                                                        >
                                                            Thêm
                                                        </label>
                                                        <button
                                                            type="button"
                                                            className="btn btn-success"
                                                            role="button"
                                                            onClick={() =>
                                                                handleAddThuoctinhCd(
                                                                    macongdoanEdit,
                                                                    thuoctinhEdit
                                                                )
                                                            }
                                                        >
                                                            Thêm
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row p-3">
                                                <TableKetqua
                                                    item={thuoctinhEdit}
                                                    macongdoan={macongdoanEdit}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-danger">
                                    Xóa
                                </button>
                                <div className="ms-auto">
                                    <button
                                        type="button"
                                        className="btn btn-light"
                                        data-bs-dismiss="modal"
                                        onClick={() => setIsFormEdit(false)}
                                    >
                                        Đóng
                                    </button>
                                    <button type="button" className="btn btn-primary">
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

    const handleAddThuoctinhCd = async (macongdoanEdit: string, thuoctinhEdit: string) => {
        try {
            if (thuoctinhIp && typeof thuoctinhIp === 'string') {
                if (thuoctinhIp.trim() !== '') {
                    let thuoctinhObj: Thuoctinh = {};

                    if (thuoctinhEdit != null && thuoctinhEdit.trim() !== '') {
                        thuoctinhObj = JSON.parse(thuoctinhEdit);
                    }

                    thuoctinhObj[thuoctinhIp] = 'OK';
                    console.log(thuoctinhObj);
                    const data = {
                        macongdoan: macongdoanEdit,
                        thuoctinh: JSON.stringify(thuoctinhObj),
                    };
                    await sendAPIRequest('/truynguyen/capnhatcongdoan', 'PUT', data);
                    showEditForm(macongdoanEdit);
                }
            } else {
                console.error('Giá trị không hợp lệ hoặc là null');
            }
        } catch (error) {
            console.error('Lỗi khi thêm thuộc tính công đoạn:', error);
        }
    };

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách công đoạn <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2" style={{visibility: "hidden"}}>
                        <div>
                            <label className="form-label text-secondary">Mã công đoạn</label>
                            <input
                                type="text"
                                className="form-control"                               
                            />
                        </div>
                    </div>                  
                </div>
            </div>           
            <div className="p-3">
                <div
                    className="ag-theme-quartz"
                    style={{ height: 'calc(100vh - 150px)', width: '100%' }}
                >
                    <AgGridReact
                        rowData={congdoans}
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
                {isFormEdit && htmlEditForm()}
            </div>           
        </MenuComponent>
    );
};

export default Admin_danh_sach_cong_doan;

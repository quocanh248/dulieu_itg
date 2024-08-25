import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { Datadonhang } from '../../utils/modelAPI';
import React from 'react';

const DSdonhangPage: React.FC = () => {
    const [model, setModel] = useState('');
    const [lot, setLot] = useState('');
    const [result_model, setrResModel] = useState([]);
    const [result_lot, setrResLot] = useState([]);
    const [result_donhang, setrResdonhang] = useState<Datadonhang[]>([]);
    // Xử lý sự kiện thay đổi giá trị của input
    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const model_change = e.target.value;
        setModel(model_change);
        if (model_change !== '') {
            fetchlot({ model_change });
        }
    };
    const handleLotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const lot_change = e.target.value;
        setLot(lot_change);
        if (lot_change !== '') {
            fetchmodel({ lot_change });
        }
    };
    const fetchmodel = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/truynguyen/list_model?' + queryString,
                'GET',
                undefined
            );
            setrResModel(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
        }
    };
    const fetchlot = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/truynguyen/list_lot?' + queryString,
                'GET',
                undefined
            );
            setrResLot(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu năng suất:', error);
        }
    };
    const get_don_hang = async (filters = {}) => {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await sendAPIRequest(
                '/truynguyen/get_don_hang?' + queryString,
                'GET',
                undefined
            );
            setrResdonhang(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const handleSearch = () => {
        if (lot == '') {
            alert('Vui lòng chọn lot để tìm');
        } else {
            get_don_hang({ model, lot });
        }
    };

    useEffect(() => {
        fetchmodel();
        fetchlot();
    }, []);

    const columns = [
        {
            name: 'Model',
            selector: (row: Datadonhang) => row.model,
            sortable: true,
        },
        {
            name: 'Lot',
            selector: (row: Datadonhang) => row.lot,
            sortable: true,
        },
        {
            name: 'Po',
            selector: (row: Datadonhang) => row.po,
            sortable: true,
        },
        {
            name: 'Số lượng ĐT',
            selector: (row: Datadonhang) => row.soluong_dt,
            sortable: true,
        },
        {
            name: 'Số lượng PO',
            selector: (row: Datadonhang) => row.soluong,
            sortable: true,
        },
        {
            name: '% Hoàn thành',
            selector: (row: Datadonhang) => {
                const soluong = Number(row.soluong);
                const soluong_dt = Number(row.soluong_dt);

                if (isNaN(soluong) || isNaN(soluong_dt) || soluong_dt === 0) {
                    return '';
                }

                const percentage = soluong != 0 ? (soluong_dt / soluong) * 100 : 0;
                const string = percentage.toFixed(2) + '%';
                return string;
            },
            sortable: true,
        },
        {
            name: 'Trạng thái',
            selector: (row: Datadonhang) => row.trangthai,
            sortable: true,
        },
        {
            selector: (row: Datadonhang) => row.model,
            cell: (row: Datadonhang) => (
                <Link
                    target="_blank"
                    to={`/get_model_lot_api/${encodeURIComponent(row.model)}/${encodeURIComponent(row.lot)}`}
                >
                    Chi tiết
                </Link>
            ),
        },
    ];
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h4 className="fw-normal text-primary m-0">
                    Danh sách đơn hàng <i className="far fa-question-circle"></i>
                </h4>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Model</label>
                            <input
                                type="search"
                                className="form-control"
                                list="list_model"
                                value={model}
                                onChange={handleModelChange}
                            />
                            <datalist id="list_model">
                                {result_model.map((item) => (
                                    <option
                                        key={(item as { model: string }).model}
                                        value={(item as { model: string }).model}
                                    ></option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Lot</label>
                            <input
                                type="search"
                                className="form-control"
                                value={lot}
                                list="list_lot"
                                onChange={handleLotChange}
                            />
                            <datalist id="list_lot">
                                {result_lot.map((item) => (
                                    <option
                                        key={(item as { lot: string }).lot}
                                        value={(item as { lot: string }).lot}
                                    ></option>
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleSearch}>
                            <i className="fas fa-search"></i> Tìm
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div className="bg-white body-table">
                    <DataTable
                        columns={columns}
                        data={result_donhang}
                        responsive
                        pagination
                        paginationPerPage={15}
                        fixedHeader
                        fixedHeaderScrollHeight="calc(100vh - 202px)"
                        style={{ fontSize: '16px' }}
                    />
                </div>
            </div>
        </MenuComponent>
    );
};

export default DSdonhangPage;

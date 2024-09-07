import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import React from 'react';

const AddDonhangPage: React.FC = () => {
    const [data, setData] = useState('');
    const handleAddDonhang = async () => {
        const rows = data.split('\n');
        const formattedData = rows.map((row) => row.split('\t'));
        const response = await sendAPIRequest('/truynguyen/addDonhang', 'POST', {
            data: formattedData,
        });
        console.log(response);
        alert('Cập nhật đơn hàng thành công!');
        setData('');
    };

    useEffect(() => {}, []);

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Thêm đơn hàng <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Nhập dữ liệu</label>
                            <textarea
                                className="form-control"
                                rows={1}
                                cols={30}
                                style={{
                                    backgroundColor: '#f5f5f5',
                                    height: '30px',
                                    border: 'none',
                                    fontSize: '0.7em',
                                }}
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center p-2">
                        <button className="btn btn-primary" onClick={handleAddDonhang}>
                            <i className="fas fa-plus"></i> Thêm
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div className="bg-white body-table"></div>
            </div>
        </MenuComponent>
    );
};

export default AddDonhangPage;

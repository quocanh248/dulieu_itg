import { useEffect, useState } from 'react';
import MenuComponent from '../../Menu';
import { sendAPIRequest } from '../../utils/util';
import { DataNC1, DataNC2, DataNC2_NC1 } from '../../utils/modelAPI';
// @ts-ignore
import React from 'react';

const NC1_NC2Page = () => {
    const [result_NC1_NC2, setResultNc2_Nc1] = useState<DataNC2_NC1[]>([]);
    const [result_NC1_Remaining, setResultNc1Remaining] = useState<DataNC1[]>([]);
    const [result_NC2, setResultNc2] =useState<DataNC2[]>([]);
    

    // Lấy danh sách nhóm cấp 2
    const getNhomCap2 = async () => {
        try {
            const response = await sendAPIRequest('/thietbi/get_nhom_cap_2', 'GET');
            setResultNc2(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };

    // Lấy danh sách nhóm cấp 1 thuộc nhóm cấp 2 và các nhóm cấp 1 còn lại
    const handleNhomCap2Change = async (id: string) => {
        
        try {
            const responseNC1_NC2 = await sendAPIRequest(`/thietbi/get_nhom_cap_1_of_cap_2?manhomcap2=${id}`, 'GET');
            setResultNc2_Nc1(responseNC1_NC2); // Nhóm cấp 1 thuộc nhóm cấp 2

            const responseNC1Remaining = await sendAPIRequest('/thietbi/get_nhom_cap_1', 'GET');
            setResultNc1Remaining(responseNC1Remaining); // Nhóm cấp 1 còn lại
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };

    useEffect(() => {
        getNhomCap2();
    }, []);

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Danh sách nhóm cấp 1 <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2">
                        <div>
                            <label className="form-label text-secondary">Mã nhóm cấp 2</label>
                            <select
                                className="form-select"
                                onChange={(e) => handleNhomCap2Change(e.target.value)}
                            >
                                <option value="">Chọn nhóm cấp 2</option>
                                {result_NC2.map((nhom) => (
                                    <option key={nhom.manhomcap2} value={nhom.manhomcap2}>
                                        {nhom.tennhomcap2}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hiển thị danh sách nhóm cấp 1 */}
            <div className="p-3">
                <div className="bg-white">
                    <table className='table table-bordered'>
                        <thead>
                            <tr>
                                <th><input type="checkbox" id='check-all' /></th>
                                <th>Tên nhóm cấp 1</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Danh sách nhóm cấp 1 thuộc nhóm cấp 2 */}
                            {result_NC1_NC2.map((nhom) => (
                                <tr key={nhom.manhomcap1}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            checked 
                                            onChange={() => {}} 
                                        />
                                    </td>
                                    <td>{nhom.tennhomcap1}</td>
                                </tr>
                            ))}
                            {/* Danh sách các nhóm cấp 1 còn lại */}
                            {result_NC1_Remaining.map((nhom) => (
                                <tr key={nhom.manhomcap1}>
                                    <td>
                                        <input 
                                            type="checkbox" 
                                            onChange={() => {}} 
                                        />
                                    </td>
                                    <td>{nhom.tennhomcap1}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MenuComponent>
    );
};

export default NC1_NC2Page;

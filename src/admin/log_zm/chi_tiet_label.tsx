import React, { useEffect, useState } from 'react';
import { sendAPIRequest } from '../../utils/util';
import MenuComponent from '../../Menu';
import { Link, useParams } from 'react-router-dom';
import { Chitietlabel, NhanVien, TableProps } from '../../utils/modelAPI';

const ChitietLabel: React.FC = () => {
    const [resultChitiet, setResultChitiet] = useState<Chitietlabel[]>([]);
    const { label } = useParams<{ label: string }>();
    const decodedLabel = decodeURIComponent(label || '');

    const fetchData = async () => {
        try {
            const response = await sendAPIRequest(
                '/logzm/chi_tiet_label?label=' + decodedLabel,
                'GET'
            );
            setResultChitiet(response);
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu:', error);
        }
    };
    const get_ten_nhan_su = async (chuoi: string): Promise<NhanVien[]> => {
        const manhanviens = chuoi.split(',');
        const results = await Promise.all(
            manhanviens.map(async (mnv) => {
                try {
                    const response = await sendAPIRequest(
                        '/users/ten_nhan_su?manhansu=' + mnv,
                        'GET'
                    );
                    const parts = response.split('+');
                    return {
                        mnv,
                        ten_nv: parts[0] !== 'Chưa cập nhật' ? parts[0] : 'Chưa cập nhật',
                        img_nv: parts[1] || '',
                    };
                } catch (error) {
                    console.error('Lỗi khi lấy dữ liệu:', error);
                    return { mnv, ten_nv: 'Chưa cập nhật', img_nv: '' };
                }
            })
        );
        return results;
    };

    useEffect(() => {
        if (decodedLabel) {
            fetchData();
        }
    }, [decodedLabel]);

    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Chi tiết label <b style={{ color: 'red' }}>{decodedLabel}</b>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2" style={{ visibility: 'hidden' }}>
                        <div>
                            <label className="form-label text-secondary">Model</label>
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div className="bg-white">
                    {resultChitiet.map((item, index) => (
                        <table
                            className="table table-bordered text-center align-middle"
                            key={`${index}+row`}
                        >
                            <thead>
                                <tr>
                                    <th style={{ backgroundColor: 'blue' }} colSpan={7}>
                                        {item.congdoan} - {item.ngay} - [{item.giobatdau} &rarr;{' '}
                                        {item.gioketthuc}]{' '}
                                    </th>
                                </tr>
                                <tr>
                                    <th>Mã nhân viên</th>
                                    <th>Tên nhân viên</th>
                                    <th>Công cụ dụng cụ</th>
                                    <th>Mã thùng</th>
                                    <th>Quản lý</th>
                                    <th>Vị trí</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr key={`${index}-row`}>
                                    <td>
                                        <Tablemanhansu item={item} />
                                    </td>
                                    <td>
                                        <TableNhanVien
                                            item={item}
                                            get_ten_nhan_su={get_ten_nhan_su}
                                        />
                                    </td>
                                    <td>
                                        <Tablethietbi item={item} />
                                    </td>
                                    <td>
                                        <Link
                                            target="_blank"
                                            to={`/chi_tiet_thung_zm/${encodeURIComponent(item.mathung)}`}
                                        >
                                            {item.mathung}
                                        </Link>
                                    </td>
                                    <td>
                                        <TableQuanLy
                                            item={item}
                                            get_ten_nhan_su={get_ten_nhan_su}
                                        />
                                    </td>
                                    <td>{item.vitri}</td>
                                    <td>{item.ketqua}</td>
                                </tr>
                            </tbody>
                        </table>
                    ))}
                </div>
            </div>
        </MenuComponent>
    );
};
const Tablethietbi: React.FC<{ item: Chitietlabel }> = ({ item }) => {
    const chuoi = item.mathietbi;
    const mathietbis = chuoi.split(',');
    return (
        <div className="text-center">
            {mathietbis.length > 1 ? (
                mathietbis.map((mtb, index) => (
                    <React.Fragment key={index}>
                        <label>{mtb}</label>
                        <hr />
                    </React.Fragment>
                ))
            ) : (
                <label>Công đoạn không có sử dụng thiết bị</label>
            )}
        </div>
    );
};

const Tablemanhansu: React.FC<{ item: Chitietlabel }> = ({ item }) => {
    const chuoi = item.manhanvien;
    const manhanviens = chuoi.split(',');

    return (
        <div className="text-center">
            {manhanviens.length > 0 ? (
                manhanviens.map((mnv, index) => (
                    <div key={index}>
                        <label>{mnv}</label>
                        <hr />
                    </div>
                ))
            ) : (
                <label>Không có mã nhân viên</label>
            )}
        </div>
    );
};

const TableNhanVien: React.FC<TableProps> = ({ item, get_ten_nhan_su }) => {
    const [tenNhanVien, setTenNhanVien] = useState<NhanVien[]>([]);
    useEffect(() => {
        if (item.manhanvien) {
            get_ten_nhan_su(item.manhanvien).then((data) => setTenNhanVien(data));
        }
    }, [item.manhanvien, get_ten_nhan_su]);

    return (
        <div className="text-center">
            {tenNhanVien.length > 0 ? (
                tenNhanVien.map((nv, index) => (
                    <React.Fragment key={index}>
                        <label>{nv.ten_nv}</label>
                        <hr />
                    </React.Fragment>
                ))
            ) : (
                <label>Không có mã nhân viên</label>
            )}
        </div>
    );
};

const TableQuanLy: React.FC<TableProps> = ({ item, get_ten_nhan_su }) => {
    const [tenNhanVien, setTenNhanVien] = useState<NhanVien[]>([]);
    useEffect(() => {
        if (item.quanly) {
            get_ten_nhan_su(item.quanly).then((data) => setTenNhanVien(data));
        }
    }, [item.quanly, get_ten_nhan_su]);
    return (
        <div className="text-center">
            {tenNhanVien.length > 0 ? (
                tenNhanVien.map((nv, index) => (
                    <React.Fragment key={index}>
                        <label>{nv.ten_nv}</label>
                    </React.Fragment>
                ))
            ) : (
                <label>Không có mã nhân viên</label>
            )}
        </div>
    );
};

export default ChitietLabel;

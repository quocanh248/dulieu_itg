import MenuComponent from './Menu';
import React from 'react';
const Default: React.FC = () => {
    return (
        <MenuComponent>
            <div className="d-flex align-items-center bg-white px-4 py-1">
                <h5 className="fw-normal text-primary m-0">
                    Trang chủ <i className="far fa-question-circle"></i>
                </h5>
                <div className="d-flex ms-auto">
                    <div className="input-custom ms-2" style={{ visibility: 'hidden' }}>
                        <div>
                            <label className="form-label text-secondary">Mã nhân sự</label>
                            <input type="search" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="p-3">
                <div className="bg-white"></div>
            </div>
        </MenuComponent>
    );
};

export default Default;

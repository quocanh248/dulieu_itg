export interface UserModel {
    id: string;
    manhansu: string;
    // password: string;
    role: string;
}

//ĐƠn hàng
export interface Datadonhang {
    model: string;
    lot: string;
    soluong_dt: number;
    soluong: number;
    po: string;
    trangthai: string;
}

//Get APi
export interface CongDoan {
    macongdoan: string;
    stt: string;
    tencongdoan: string;
}

export interface Thuoctinh {
    [key: string]: string;
}

export interface TableKetquaProps {
    item: string;
    macongdoan: string;
}

//Line - thiết bị
export interface DataTB {
    mathietbi: string;
    tenthietbi: string;
    manhomcap1: string;
    tennhomcap1: string;
}
export interface DataNC2 {
    manhomcap2: string;
    tennhomcap2: string;
    manhomcap1: string;
    tennhomcap1: string;
}
export interface DataNC1 {
    manhomcap1: string;
    tennhomcap1: string;
}
export interface DataLine {
    maline: string;
    tenline: string;
}
export interface DataNC2_NC1 {
    manhomcap1: string;
    tennhomcap1: string;
}
export interface DataNC2ofNC1 {
    manhomcap1: string;
    tennhomcap1: string;
}
export interface Datatb_not_line {
    mathietbi: string;
    tenthietbi: string;
}
export interface Datatb_of_line {
    mathietbi: string;
    tenthietbi: string;
}
//Label None
export interface DataNone {
    label: string;
    ngay: string;
    giobatdau: string;
    gioketthuc: string;
    trangthai: string;
}

//Label None

//Chi tiết label
export interface ChitietItem {
    thuoctinh: string;
    ketqua: string;
    congdoan: string;
    vitri: string;
    ngay: string;
    giobatdau: string;
    gioketthuc: string;
    manhanvien: string;
    quanly: string;
    mathietbi: string;
}
export interface ThongtinItem {
    model: string;
    vitri: string;
    label: string;
    mathung: string;
    sochungtu: string;
}

export interface NhanVien {
    mnv: string;
    ten_nv: string;
    img_nv: string;
}

export interface Chitietlabel {
    congdoan: string;
    ketqua: string;
    ngay: string;
    giobatdau: string;
    gioketthuc: string;
    mathietbi: string;
    manhanvien: string;
    quanly: string;
    mathung: string;
    vitri: string;
}
export interface TableProps {
    item: Chitietlabel;
    get_ten_nhan_su: (chuoi: string) => Promise<NhanVien[]>;
}
//Chi tiết label
export interface CustomCSSProperties extends React.CSSProperties {
    '--p'?: number; // Thêm các thuộc tính CSS tùy chỉnh khác nếu cần
}


export interface Ban_NC1 {
    id: string,
    mamodel: string;
    maban: string;
    manhomcap1: string;   
}
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
export interface DataNC2 {
  manhomcap2: string;
  tennhomcap2: string;  
}
export interface DataNC2_NC1 {
  manhomcap1: string;
  tennhomcap1: string;  
}
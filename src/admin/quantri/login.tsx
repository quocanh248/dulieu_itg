import { useState } from "react";
import "../../../public/assets/css/table_data.css";
import { sendAPIRequest } from "../../utils/util";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [tbuser, setTbuser] = useState("");
  const [tbpass, setTbpass] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    const data = {
      username: username,
      password: password,
    };
    const res = await sendAPIRequest("/users/login", "POST", data);
    console.log(res.status);
    if (res.status === 200) {
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("role", res.role);
      localStorage.setItem("username", res.tennhansu);
      var tmp_path = localStorage.getItem("tmp_path");
      if (!tmp_path) {
        navigate("/default");
      }else{
        navigate(tmp_path);
      }
    } else if (res.status === 204) {
      setTbuser("User không tồn tại!");      
      setPassword("");
      setUsername("");
    } else if (res.status === 205) {
      setTbpass("Mật khẩu không hợp lệ!");     
      setPassword("");
      setUsername(""); 
    }

    // if (res.length > 0) {
    //   signIn(res[0]);
    //   navigate("/");
    // } else {
    //   console.error("Tài khoản hoặc mật khẩu không hợp lệ");
    // }
  };
  //d-flex align-items-center justify-content-center
  return (
    <div className="body">
      <div className="container" id="container">
        <div className="form-container sign-in-container">
          <div className="form">
            <h1 className="text-center">Đăng nhập</h1>
            <div className="social-container">
              <a className="social" style={{ backgroundColor: "#FF4B2B" }}></a>
              <a className="social" style={{ backgroundColor: "#c8e814" }}></a>
              <a className="social" style={{ backgroundColor: "#2bff59" }}></a>
            </div>
            <span className="span">
              Nhập tài khoản và mật khẩu để truy cập vào trang web
            </span>
            <input
              type="text"
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tài khoản"
            />            
            <label className="color-red-login" htmlFor="">{tbuser}</label>
            <input
              type="password"
              className="input"
              value={password}
              placeholder="Nhập mật khẩu"
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="color-red-login" htmlFor="">{tbpass}</label>
            <button type="button" className="button" onClick={handleLogin}>
              Đăng nhập
            </button>
          </div>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Việt Trần</h1>
              <p className="p">
                Đường số 1, Kcn Long Đức, Tp Trà Vinh, Trà Vinh
              </p>
              <button className="ghost">Click</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Việt Trần</h1>
              <p className="p">
                Đường số 1, Kcn Long Đức, Tp Trà Vinh, Trà Vinh
              </p>
              <button className="button ghost">Click</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

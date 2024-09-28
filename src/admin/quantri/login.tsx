import { useEffect, useState } from 'react';
import './style.css';
import { sendAPIRequest } from '../../utils/util';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';

const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [tbuser, setTbuser] = useState('');
    const [tbpass, setTbpass] = useState('');
    const { userInfo, signIn } = useAuthStore();
    const navigate = useNavigate(); // Sử dụng điều hướng

    const handleLogin = async () => {
        const data = {
            username: username,
            password: password,
        };
        const res = await sendAPIRequest('/users/login', 'POST', data);
        console.log('res', res);

        if (res && res.status === 200) {
            const expiresIn = 4 * 60 * 60 * 1000; // 4 hours
            const expirationTime = Date.now() + expiresIn;
            console.log('Login successful');

            // Lưu thông tin xác thực vào localStorage
            localStorage.setItem('access_token', res.access_token);
            signIn({
                access_token: res.access_token,
                username: res.tennhansu,
                role: res.role,
                tmp_path: '',
                expirationTime: expirationTime.toString(),
                refresh_token: res.refreshToken,
            });

            // Điều hướng đến trang mặc định sau khi đăng nhập thành công
            navigate('/default');
        } else if (res.status === 204) {
            setTbuser('User không tồn tại!');
            setPassword('');
            setUsername('');
        } else if (res.status === 205) {
            setTbpass('Mật khẩu không hợp lệ!');
            setPassword('');
            setUsername('');
        }
    };

    const refreshAccessToken = async () => {
        try {
            const resrf = await sendAPIRequest('/users/refresh-token', 'POST', {
                token: userInfo?.refresh_token,
            });
            const newAccessToken = resrf.access_token;
            const expiresIn = 4 * 60 * 60 * 1000;
            localStorage.setItem('access_token', newAccessToken);
            const expirationTime = Date.now() + expiresIn;
            localStorage.setItem('expirationTime', expirationTime.toString());
            setTimeout(refreshAccessToken, expiresIn - 1000); // Cập nhật token sau khi hết hạn
        } catch (error) {
            console.error('Failed to refresh access token', error);
        }
    };

    useEffect(() => {
        if (userInfo?.access_token) {
            navigate('/default');
        }
        const expirationTimeString: string | undefined = userInfo?.expirationTime;
        const expirationTime: number = expirationTimeString ? parseInt(expirationTimeString) : 0;
        const currentTime: number = Date.now();
        const timeLeft: number = expirationTime - currentTime;
        if (timeLeft > 0) {
            setTimeout(refreshAccessToken, timeLeft - 5 * 60 * 1000);
        } else {
            console.log('Token expired, please login again');
        }
    }, []);

    return (
        <div className="body" style={{margin: 0}}>
            <div className="container" id="container">
                <div className="form-container sign-in-container">
                    <div className="form">
                        <h1 className="text-center">Đăng nhập</h1>
                        <div className="social-container">
                            <a className="social" style={{ backgroundColor: '#FF4B2B' }}></a>
                            <a className="social" style={{ backgroundColor: '#c8e814' }}></a>
                            <a className="social" style={{ backgroundColor: '#2bff59' }}></a>
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
                        <label className="color-red-login" htmlFor="">
                            {tbuser}
                        </label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            placeholder="Nhập mật khẩu"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label className="color-red-login" htmlFor="">
                            {tbpass}
                        </label>
                        <button type="button" className="button" onClick={handleLogin}>
                            Đăng nhập
                        </button>
                    </div>
                </div>
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1>Việt Trần</h1>
                            <p className="p">Đường số 1, Kcn Long Đức, Tp Trà Vinh, Trà Vinh</p>
                            <button className="ghost">Click</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1>Việt Trần</h1>
                            <p className="p">Đường số 1, Kcn Long Đức, Tp Trà Vinh, Trà Vinh</p>
                            <button className="button ghost">Click</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

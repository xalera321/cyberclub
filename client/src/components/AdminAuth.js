// UserAuth.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserAuth({ onLogin, loginError }) {
    const [loginFormData, setLoginFormData] = useState({
        login: '',
        u_password: ''
    });

    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    };


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const isSuccess = await onLogin(loginFormData);
        if (isSuccess) {
            navigate('/admin');
        }
    };

    return (
        <div>
            <h1>Вход</h1>
            {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
            <form onSubmit={handleLoginSubmit}>
                <input type="text" name="login" placeholder="Логин" value={loginFormData.login} onChange={handleLoginChange} />
                <input type="password" name="e_password" placeholder="Пароль" value={loginFormData.e_password} onChange={handleLoginChange} />
                <button type="submit">Войти</button>
            </form>
        </div>
    );
}

export default UserAuth;

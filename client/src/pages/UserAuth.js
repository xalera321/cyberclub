// UserAuth.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UserAuth({ onLogin, onRegister, loginError, registrationError }) {
    const [loginFormData, setLoginFormData] = useState({
        login: '',
        u_password: ''
    });

    const [registerFormData, setRegisterFormData] = useState({
        login: '',
        email: '',
        u_password: ''
    });

    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    };

    const handleRegisterChange = (e) => {
        setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const isSuccess = await onLogin(loginFormData);
        if (isSuccess) {
            navigate('/account');
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const isSuccess = await onRegister(registerFormData);
        if (isSuccess) {
            navigate('/account');
        }
    };

    return (
        <div className=" container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Регистрация</h2>
                            {registrationError && <p className="text-danger text-center">{registrationError}</p>}
                            <form onSubmit={handleRegisterSubmit}>
                                <div className="mb-3">
                                    <input type="text" className="form-control" name="login" placeholder="Логин" value={registerFormData.login} onChange={handleRegisterChange} />
                                </div>
                                <div className="mb-3">
                                    <input type="email" className="form-control" name="email" placeholder="Email" value={registerFormData.email} onChange={handleRegisterChange} />
                                </div>
                                <div className="mb-3">
                                    <input type="password" className="form-control" name="u_password" placeholder="Пароль" value={registerFormData.u_password} onChange={handleRegisterChange} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block">Зарегистрироваться</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Вход</h2>
                            {loginError && <p className="text-danger text-center">{loginError}</p>}
                            <form onSubmit={handleLoginSubmit}>
                                <div className="mb-3">
                                    <input type="text" className="form-control" name="login" placeholder="Логин" value={loginFormData.login} onChange={handleLoginChange} />
                                </div>
                                <div className="mb-3">
                                    <input type="password" className="form-control" name="u_password" placeholder="Пароль" value={loginFormData.u_password} onChange={handleLoginChange} />
                                </div>
                                <button type="submit" className="btn btn-primary btn-block">Войти</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserAuth;

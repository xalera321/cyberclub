import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage({ onLogin, loginError }) {
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
            navigate('/account');
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
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
                                <p className="text-right"><Link to="/reset-password">Забыли пароль?</Link></p>
                                <button type="submit" className="btn btn-primary btn-block">Войти</button>
                            </form>
                            <p className="text-center mt-3">У вас еще нет учетной записи? <Link to="/registration">Зарегистрируйтесь</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RegistrationPage({ onRegister, registrationError }) {
    const [registerFormData, setRegisterFormData] = useState({
        login: '',
        email: '',
        u_password: ''
    });

    const navigate = useNavigate();

    const handleRegisterChange = (e) => {
        setRegisterFormData({ ...registerFormData, [e.target.name]: e.target.value });
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const isSuccess = await onRegister(registerFormData);
        if (isSuccess) {
            navigate('/login');
        }
    };

    return (
        <div className="container mt-5">
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
                            <p className="text-center mt-3">У вас уже есть учетная запись? <Link to="/login">Войдите</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegistrationPage;

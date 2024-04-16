// UserAuth.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';


function UserAuth({ onLogin, loginError }) {
    const [loginFormData, setLoginFormData] = useState({
        login: '',
        e_password: ''
    });

    const showErrorToast = (errorMessage) => {
        toast.error(errorMessage, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    const showInfoToast = (message) => {
        toast.info(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };
    
    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        setLoginFormData({ ...loginFormData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const isSuccess = await onLogin(loginFormData);
        if (isSuccess) {
            navigate('/admin');
        } else {
            showErrorToast("Неправильный логин или пароль!");
        }
    };
    useEffect(() => {
        showInfoToast("Не администратор? Забудь про эту страницу.");
        if (Cookies.get('token')){
            navigate('/admin')
        }
    }, []);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h1 className="card-title mb-4">Вход</h1>
                            {loginError && <div className="alert alert-danger" role="alert">{loginError}</div>}
                            <form onSubmit={handleLoginSubmit}>
                                <div className="mb-3">
                                    <input type="text" name="login" className="form-control" placeholder="Логин" value={loginFormData.login} onChange={handleLoginChange} />
                                </div>
                                <div className="mb-3">
                                    <input type="password" name="e_password" className="form-control" placeholder="Пароль" value={loginFormData.e_password} onChange={handleLoginChange} />
                                </div>
                                <button type="submit" className="btn btn-primary">Войти</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
}

export default UserAuth;

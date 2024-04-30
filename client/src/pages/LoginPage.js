import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage({ onLogin, loginError }) {
    const [loginFormData, setLoginFormData] = useState({
        login: '',
        u_password: ''
    });

    const [validity, setValidity] = useState({
        login: true,
        u_password: true
    });

    const [showValidation, setShowValidation] = useState(false);

    const navigate = useNavigate();

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginFormData({ ...loginFormData, [name]: value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setShowValidation(true); // Показываем сообщения о валидации после нажатия кнопки "Войти"

        // Проверяем валидность данных, только если они были заполнены
        const isLoginValid = loginFormData.login.trim() === '' ? true : /^[a-zA-Z0-9_]+$/.test(loginFormData.login);
        const isPasswordValid = loginFormData.u_password.trim() === '' ? true : /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&><)(^-_])[A-Za-z\d@$!%*#?&><)(^-_]{8,100}$/.test(loginFormData.u_password);

        // Устанавливаем состояние валидности
        setValidity({
            login: isLoginValid,
            u_password: isPasswordValid
        });

        // Если все данные валидны, выполняем вход
        if (isLoginValid && isPasswordValid) {
            const isSuccess = await onLogin(loginFormData);
            if (isSuccess) {
                navigate('/account');
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Вход</h2>
                            {loginError && showValidation && <p className="text-danger text-center">{loginError}</p>}
                            <form onSubmit={handleLoginSubmit}>
                                <div className="mb-3">
                                    <input type="text" className="form-control" name="login" placeholder="Логин" value={loginFormData.login} onChange={handleLoginChange} />
                                    {!validity.login && showValidation && <p className="text-danger">Логин состоит из латинских букв, цифр или знака _</p>}
                                </div>
                                <div className="mb-3">
                                    <input type="password" className="form-control" name="u_password" placeholder="Пароль" value={loginFormData.u_password} onChange={handleLoginChange} />
                                    {!validity.u_password && showValidation && <p className="text-danger">Пароль состоит  из ВЕРХНИХ и строчных латинских букв, сле специальные символы: .@$!%*#?&amp;&gt;&lt;)(^-_ и состоит из 8-100 символов</p>}
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
// RegistrationPage.js
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

function RegistrationPage({ onRegister, registrationError }) {
    const [registerFormData, setRegisterFormData] = useState({
        login: '',
        email: '',
        u_password: ''
    });

    const [validity, setValidity] = useState({
        login: true,
        email: true,
        u_password: true
    });

    const navigate = useNavigate();

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;

        // Проверка на пустое значение
        if (value.trim() === '') {
            // Если поле пустое, скрываем текст о валидации и выходим из функции
            setValidity({ ...validity, [name]: true });
            setRegisterFormData({ ...registerFormData, [name]: value });
            return;
        }

        // Проверка валидности и обновление состояния валидности
        if (name === 'login') {
            const isValid = /^[a-zA-Z0-9_]+$/.test(value);
            setValidity({ ...validity, [name]: isValid });
        } else if (name === 'email') {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            setValidity({ ...validity, [name]: isValid });
        } else if (name === 'u_password') {
            const isValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&><)(^-_])[A-Za-z\d@$!%*#?&><)(^-_]{8,100}$/.test(value);
            setValidity({ ...validity, [name]: isValid });
        }

        setRegisterFormData({ ...registerFormData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Проверка валидности перед отправкой
        const isFormValid = Object.values(validity).every((value) => value);
        if (isFormValid) {
            const isSuccess = await onRegister(registerFormData);
            if (isSuccess) {
                navigate('/login');
            }
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <h2 className="text-center mb-4">Регистрация</h2>
                            {registrationError && <Alert variant="danger">{registrationError}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-4">
                                    <Form.Control type="text" name="login" placeholder="Логин" value={registerFormData.login} onChange={handleRegisterChange} required />
                                    {!validity.login && <Form.Text className="text-danger">Ваш логин может состоять из латинских букв, цифр и знака _</Form.Text>}
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Control type="email" name="email" placeholder="Email" value={registerFormData.email} onChange={handleRegisterChange} required />
                                    {!validity.email && <Form.Text className="text-danger">Введите корректный адрес электронной почты</Form.Text>}
                                </Form.Group>
                                <Form.Group className="mb-4">
                                    <Form.Control type="password" name="u_password" placeholder="Пароль" value={registerFormData.u_password} onChange={handleRegisterChange} required />
                                    {!validity.u_password && <Form.Text className="text-danger">Ваш пароль должен состоять из ВЕРХНИХ и строчных латинских букв, содержать один из следующих специальных символов: .@$!%*#?&amp;&gt;&lt;)(^-_ и быть от 8 до 100 символов</Form.Text>}
                                </Form.Group>
                                <Button variant="primary" type="submit" className="mb-3" block>Зарегистрироваться</Button>
                            </Form>
                            <p className="text-center mt-3">У вас уже есть учетная запись? <Link to="/login">Войдите</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegistrationPage;
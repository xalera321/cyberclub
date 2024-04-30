import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

import 'react-toastify/dist/ReactToastify.css';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [emailValid, setEmailValid] = useState(false); // Устанавливаем изначальное значение как false
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    const [buttonClicked, setButtonClicked] = useState(false); // Состояние для отслеживания нажатия кнопки

    const handleEmailChange = (event) => {
        const { value } = event.target;
        setEmail(value);
        // При изменении почты сбрасываем состояние валидации
        setEmailValid(false);
    };

    const handleNewPasswordChange = (event) => {
        setNewPassword(event.target.value);
    };

    const handleResetPasswordRequest = async () => {
        // Устанавливаем состояние нажатия кнопки в true
        setButtonClicked(true);

        // Проверяем валидность почты
        setEmailValid(validateEmail(email));

        if (validateEmail(email)) {
            try {
                await axios.post('http://localhost:8080/password-reset-request', { email });
                showInfoToast('Проверьте свою электронную почту');
            } catch (error) {
                showErrorToast(error.response.data.error);
            }
        }
    };

    const handlePasswordReset = async () => {
        try {
            const token = window.location.pathname.split('/').pop();
            await axios.post(`http://localhost:8080/password-reset/${token}`, { newPassword });
            showInfoToast('Проверьте свою электронную почту');
        } catch (error) {
            showErrorToast(error.response.data.error);
        }
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Проверка валидности почты
    };

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
        toast.success(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col xs={10} sm={8} md={6}>
                    <h1 className="text-center text-white mb-4">Сброс пароля</h1>
                    <Form>
                        {!resetSuccess && (
                            <>
                                {!window.location.pathname.includes('password-reset') && (
                                    <Form.Group controlId="formEmail">
                                        <Form.Control
                                            type="email"
                                            placeholder="Введите ваш email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            isInvalid={buttonClicked && !emailValid} // Показываем ошибку только после нажатия кнопки
                                        />
                                        <Form.Control.Feedback type="invalid">Введите корректный адрес электронной почты</Form.Control.Feedback>
                                    </Form.Group>
                                )}
                                {window.location.pathname.includes('password-reset') && (
                                    <Form.Group controlId="formNewPassword">
                                        <Form.Control
                                            type="password"
                                            placeholder="Введите новый пароль"
                                            value={newPassword}
                                            onChange={handleNewPasswordChange}
                                        />
                                    </Form.Group>
                                )}
                                {resetError && <p className="text-danger">{resetError}</p>}
                                <Button
                                    variant="primary"
                                    type="button"
                                    onClick={!window.location.pathname.includes('password-reset') ? handleResetPasswordRequest : handlePasswordReset}
                                    className="w-100 mt-3"
                                >
                                    {!window.location.pathname.includes('password-reset') ? 'Отправить ссылку для сброса' : 'Сбросить пароль'}
                                </Button>
                            </>
                        )}
                        {resetSuccess && (
                            <div className="text-center">
                                <p className="text-success">Пароль успешно изменен</p>
                            </div>
                        )}
                    </Form>
                </Col>
            </Row>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl pauseOnFocusLoss draggable pauseOnHover />
        </Container>
    );
};

export default ResetPasswordPage;

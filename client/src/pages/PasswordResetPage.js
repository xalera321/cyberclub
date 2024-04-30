import React, { useState } from 'react';
import axios from 'axios';
import { useParams, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Container, Form, Button } from 'react-bootstrap';

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

function PasswordResetPage() {
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showValidation, setShowValidation] = useState(false); // Состояние для отображения сообщений о валидации
    const [validPassword, setValidPassword] = useState(true); // Состояние валидности пароля
    const { token } = useParams(); // Получаем параметр токена из URL

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setShowValidation(true); // Показываем сообщения о валидации после нажатия кнопки "Сбросить пароль"
        // Проверка валидности пароля
        const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&><)(^-_])[A-Za-z\d@$!%*#?&><)(^-_]{8,100}$/.test(password);
        setValidPassword(isPasswordValid);

        if (!isPasswordValid) {
            return; // Прерываем отправку формы, если пароль невалиден
        }

        try {
            const response = await axios.post(`http://localhost:8080/password-reset/${token}`, { newPassword: password });
            setMessage(response.data.message);
            showInfoToast('Пароль успешно изменен!');
        } catch (error) {
            showErrorToast(error.response.data.error);
        }
    };

    // После успешного сброса пароля перенаправляем пользователя на главную страницу
    if (message) {
        return <Navigate to="/" />;
    }

    return (
        <Container className="mt-5">
            <h2 className="text-center text-white mb-4">Сброс пароля</h2>
            <Form onSubmit={handlePasswordReset}>
                <Form.Group controlId="formNewPassword">
                    <Form.Control
                        type="password"
                        placeholder="Введите новый пароль"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        className="mb-3"
                    />
                    {showValidation && !validPassword && <p className="text-danger">Пароль должен содержать верхние и строчные латинские буквы, специальные символы: .@$!%*#?&amp;&gt;&lt;)(^-_, и быть длиной от 8 до 100 символов.</p>}
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">Сбросить пароль</Button>
            </Form>
            {error && <p className="text-danger">{error}</p>}
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl pauseOnFocusLoss draggable pauseOnHover />
        </Container>
    );
}

export default PasswordResetPage;
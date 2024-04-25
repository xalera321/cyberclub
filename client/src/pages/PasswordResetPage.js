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
    const { token } = useParams(); // Получаем параметр токена из URL

    const handlePasswordReset = async (e) => {
        e.preventDefault();
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
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mb-3"
                    />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100">Сбросить пароль</Button>
            </Form>
            {error && <p className="text-danger">{error}</p>}
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick rtl pauseOnFocusLoss draggable pauseOnHover />
        </Container>
    );
}

export default PasswordResetPage;

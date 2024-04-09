// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import UserAuth from './components/UserAuth';
import AdminAuth from './components/AdminAuth';
import AdminPanel from './components/AdminPanel';
import AccountPage from './components/AccountPage';
import axios from 'axios';
import Cookies from 'js-cookie';

function App() {
    const [loggedInUsername, setLoggedInUsername] = useState(localStorage.getItem('username'));
    const [loggedInUsernameAdmin, setLoggedInUsernameAdmin] = useState(Cookies.get('username'));
    const [loginError, setLoginError] = useState('');
    const [registrationError, setRegistrationError] = useState('');

    useEffect(() => {
        const token = Cookies.get('token');
        if (loggedInUsername && !token) {
            handleLogout();
        }
    }, [loggedInUsername]);

    const handleLogin = async (loginFormData) => {
        try {
            const response = await axios.post('http://localhost:8080/login', loginFormData);
            const username = response.data.username;
            const token = response.data.accessToken;
            console.log('Received token:', token);
            setLoggedInUsername(username);
            localStorage.setItem('username', username);
            Cookies.set('token', token, { expires: 7 }); // Устанавливаем срок истечения токена в 7 дней
            setLoginError('');
            return true;
        } catch (error) {
            console.error(error);
            setLoggedInUsername(null);
            localStorage.removeItem('username');
            Cookies.remove('token');
            setLoginError('Failed to login. Please check your credentials.');
            return false;
        }
    };

    const handleRegistration = async (registerFormData) => {
        try {
            const response = await axios.post('http://localhost:8080/register', registerFormData);
            const username = response.data.username;
            setLoggedInUsername(username);
            localStorage.setItem('username', username);
            setRegistrationError('');
            return true;
        } catch (error) {
            console.error(error);
            setLoggedInUsername(null);
            localStorage.removeItem('username');
            setRegistrationError('Failed to register. Please try again.');
            return false;
        }
    };

    const handleLogout = () => {
        setLoggedInUsername(null);
        localStorage.removeItem('username');
        Cookies.remove('token');
        Cookies.remove('username'); // Удаляем значение из куки при выходе из аккаунта
    };

    const handleAdminLogin = async (loginFormData) => {
        try {
            const response = await axios.post('http://localhost:8080/admin/login', loginFormData);
            console.log('Response data:', response.data); // Проверяем данные, возвращаемые сервером
            const username = response.data.username;
            console.log(response.data);
            const token = response.data.accessToken;
            console.log('Received token:', token);
            if (username) {
                setLoggedInUsernameAdmin(username); // Устанавливаем loggedInUsernameAdmin после успешной авторизации администратора
                Cookies.set('username', username); // Сохраняем значение в куки
                Cookies.set('token', token); // Сохраняем значение в куки
                setLoginError('');
                return true;
            } else {
                console.error('Username is undefined');
                setLoggedInUsernameAdmin(null);
                Cookies.remove('username'); // Удаляем значение из куки при ошибке входа
                Cookies.remove('token'); // Удаляем значение из куки при ошибке входа
                setLoginError('Failed to login. Please check your credentials.');
                return false;
            }
        } catch (error) {
            console.error('Error during login:', error);
            setLoggedInUsernameAdmin(null);
            Cookies.remove('username'); // Удаляем значение из куки при ошибке входа
            Cookies.remove('token'); // Удаляем значение из куки при ошибке входа
            setLoginError('Failed to login. Please check your credentials.');
            return false;
        }
    };

    return (
        <Router>
            <Routes>
                <Route path="/account" element={loggedInUsername ? <AccountPage username={loggedInUsername} handleLogout={handleLogout} setLoggedInUsername={setLoggedInUsername} /> : <Navigate to="/" />} />
                <Route path="/" element={<UserAuth onLogin={handleLogin} onRegister={handleRegistration} loginError={loginError} registrationError={registrationError} />} />
                <Route path="/admin/login" element={<AdminAuth onLogin={handleAdminLogin} loginError={loginError} />} />
                <Route path="/admin" element={loggedInUsernameAdmin ? <AdminPanel username={loggedInUsernameAdmin} handleLogout={handleLogout} /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;

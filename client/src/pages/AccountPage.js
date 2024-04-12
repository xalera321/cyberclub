import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';

function AccountPage({ username, handleLogout, setLoggedInUsername }) {
    const [userData, setUserData] = useState(null);
    const [newLogin, setNewLogin] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [passwordChangeError, setPasswordChangeError] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [changeEmailError, setChangeEmailError] = useState('');
    const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    console.error('Токен не найден');
                    return;
                }

                const response = await axios.get(`http://localhost:8080/users/name/${username}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setUserData(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserData();
    }, [username]);

    useEffect(() => {
        const fetchAvatar = async () => {
            try {
                if (!userData) return;

                const response = await axios.get(`http://localhost:8080/avatar/${userData.user_id}`);
                setAvatar(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchAvatar();
    }, [userData]);

    const handleAvatarChange = async (event) => {
        const formData = new FormData();
        formData.append('avatar', event.target.files[0]);

        try {
            const token = Cookies.get('token');
            await axios.post(`http://localhost:8080/upload/avatar`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            const response = await axios.get(`http://localhost:8080/users/name/${username}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserData(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangeLogin = async () => {
        try {
            const token = Cookies.get('token');
            const response = await axios.put(`http://localhost:8080/users/${userData.user_id}`, { login: newLogin }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUserData(response.data);
            setNewLogin('');
            setIsLoginModalOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangePassword = async () => {
        try {
            if (newPassword !== confirmPassword) {
                setPasswordChangeError('Новый пароль и подтверждение нового пароля не совпадают.');
                return;
            }
            if (newPassword === currentPassword) {
                setPasswordChangeError('Новый пароль совпадает со старым паролем.');
                return;
            }

            const token = Cookies.get('token');
            const response = await axios.put(`http://localhost:8080/users/${userData.user_id}/password`,
                { currentPassword, newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            setPasswordChangeError('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            setPasswordChangeError('Не удалось изменить пароль. Пожалуйста, попробуйте еще раз.');
        }
    };

    const handleChangeEmail = async () => {
        try {
            const token = Cookies.get('token');
            await axios.put(`http://localhost:8080/users/${username}/email`, { newEmail }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setEmailChangeSuccess(true);
        } catch (error) {
            console.error(error);
            setChangeEmailError('Не удалось изменить почту. Пожалуйста, попробуйте еще раз.');
        }
    };

    const handleEmailChangeConfirmation = async () => {
        try {
            setEmailChangeSuccess(false);
            setNewEmail('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleChangePassword();
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <h5 className="card-header bg-primary text-white">Личный кабинет</h5>
                <div className="card-body">
                    {userData && (
                        <div>
                            <p className="card-text">Привет, {username}!</p>
                            <p className="card-text">Email: {userData.email}</p>
                            <p className="card-text">Баланс: {userData.balance}</p>
                            <p className="card-text">Бонусные баллы: {userData.bonus_points}</p>
                            {avatar && <img src={`http://localhost:8080/avatar/${userData.user_id}`} alt="Avatar" className="img-fluid rounded mb-3" />}
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="form-control mb-3" />
                            <div className="input-group mb-3">
                                <div className="input-group-append">
                                    <button onClick={() => setIsLoginModalOpen(true)} className="btn btn-primary">Изменить логин</button>
                                </div>
                            </div>
                            {passwordChangeError && <p className="text-danger">{passwordChangeError}</p>}
                            <Button onClick={() => setIsModalOpen(true)} variant="contained" color="primary">Изменить пароль</Button>
                            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                                <Box sx={{ ...style, width: 400 }}>
                                    <Typography variant="h6">Изменить пароль</Typography>
                                    <form onSubmit={handleSubmit}>
                                        <TextField type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} label="Текущий пароль" fullWidth required />
                                        <TextField type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} label="Новый пароль" fullWidth required />
                                        <TextField type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} label="Подтвердите новый пароль" fullWidth required />
                                        <Button type="submit" variant="contained" color="primary">Изменить пароль</Button>
                                    </form>
                                    <Button onClick={() => setIsModalOpen(false)} variant="contained">Отмена</Button>
                                </Box>
                            </Modal>
                            <Modal open={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}>
                                <Box sx={{ ...style, width: 400 }}>
                                    <Typography variant="h6">Изменить логин</Typography>
                                    <TextField type="text" value={newLogin} onChange={(e) => setNewLogin(e.target.value)} label="Новый логин" fullWidth />
                                    <Button onClick={handleChangeLogin} variant="contained" color="primary" fullWidth>Изменить логин</Button>
                                    <Button onClick={() => setIsLoginModalOpen(false)} variant="contained" fullWidth>Отмена</Button>
                                </Box>
                            </Modal>
                        </div>
                    )}
                    <button onClick={handleLogout} className="btn btn-danger">Выход из аккаунта</button>
                </div>
            </div>
        </div>
    );
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default AccountPage;
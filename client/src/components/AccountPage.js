import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

function AccountPage({ username, handleLogout, setLoggedInUsername }) {
    const [userData, setUserData] = useState(null);
    const [newLogin, setNewLogin] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [passwordChangeError, setPasswordChangeError] = useState('');

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

            // После загрузки нового аватара, обновляем информацию о пользователе
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
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangePassword = async (currentPassword, newPassword, confirmPassword) => {
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
            // Обработка успешного изменения пароля
            console.log(response.data);
            setPasswordChangeError('');
        } catch (error) {
            console.error(error);
            setPasswordChangeError('Не удалось изменить пароль. Пожалуйста, попробуйте еще раз.');
        }
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
                                <input type="text" value={newLogin} onChange={(e) => setNewLogin(e.target.value)} className="form-control" placeholder="Новый логин" />
                                <div className="input-group-append">
                                    <button onClick={handleChangeLogin} className="btn btn-primary">Изменить логин</button>
                                </div>
                            </div>
                            {passwordChangeError && <p className="text-danger">{passwordChangeError}</p>}
                            <ChangePasswordForm handleChangePassword={handleChangePassword} />
                        </div>
                    )}
                    <button onClick={handleLogout} className="btn btn-danger">Выход из аккаунта</button>
                </div>
            </div>
        </div>
    );
}

function ChangePasswordForm({ handleChangePassword }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleChangePassword(currentPassword, newPassword, confirmPassword);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="form-control" placeholder="Текущий пароль" required />
            </div>
            <div className="form-group">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-control" placeholder="Новый пароль" required />
            </div>
            <div className="form-group">
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-control" placeholder="Подтвердите новый пароль" required />
            </div>
            <button type="submit" className="btn btn-primary">Изменить пароль</button>
        </form>
    );
}

export default AccountPage;

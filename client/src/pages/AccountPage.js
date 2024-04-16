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
    const [rechanges, setRechanges] = useState([]);
    const [username1, setUserName] = useState(username)
    const [changeEmailError, setChangeEmailError] = useState('');
    const [emailChangeSuccess, setEmailChangeSuccess] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAvatarModal, setisAvatarModal] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [avatarUpdated, setAvatarUpdated] = useState(false); // State to track avatar updates
    const [activeTab, setActiveTab] = useState('panel'); // State to track active tab

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

    const fetchAvatarBeforeChange = async () => {
        try {
            if (!userData) return;

            const response = await axios.get(`http://localhost:8080/avatar/${userData.user_id}`);
            setAvatar(response.data);
        } catch (error) {
            console.error(error);
        }
    };


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
    }, [userData, avatarUpdated]); // Update when userData or avatarUpdated changes

    useEffect(() => {
        const fetchUserRechanges = async () => {
            try {
                const token = Cookies.get('token');
                if (!token) {
                    console.log('error');
                    return;
                }
                const response = await axios.get(`http://localhost:8080/rechanges`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRechanges(response.data);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUserData();
        fetchUserRechanges();
        fetchAvatarBeforeChange();
    }, [username]);

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

            setAvatarUpdated(!avatarUpdated); // Trigger re-render by updating avatarUpdated state
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
            localStorage.setItem('username', newLogin);
            setNewLogin('');
            fetchUserData();
            setUserName(newLogin);
            setIsLoginModalOpen(false);
            Cookies.set('token', token, { expires: 7 });
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
                { newPassword, currentPassword },
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

    const handleSubmit = (e) => {
        e.preventDefault();
        handleChangePassword();
    };

    return (
        <div className='bg-dark'>
            {userData && (
                <div className="container-fluid" style={{ height: "100vh" }}>
                    <div className="row" style={{ height: "100vh" }}>
                        <div className="col-md-3 menu bg-dark text-light shadow">
                            <div className="text-center">
                                {avatar && <img src={`http://localhost:8080/avatar/${userData.user_id}?${Date.now()}`} alt="Avatar" className="img-fluid rounded-circle mb-3 mt-3 w-50" onClick={() => setisAvatarModal(true)} />}
                                <p>{username1}</p>
                            </div>
                            <ul className="text-center menu-list nav flex-column">
                                <li className={`nav-item mb-3 ${activeTab === 'panel' ? 'active' : ''}`}>
                                    <button type="button" className="btn btn-outline-warning w-100" id="panelTab" data-toggle="pill" href="#panel">Панель управления</button>
                                </li>
                                <li className={`nav-item mb-3 ${activeTab === 'history' ? 'active' : ''}`}>
                                    <button type="button" className="btn btn-outline-warning w-100" id="historyTab" data-toggle="pill" href="#history">История пополнений</button>
                                </li>
                                <li className="nav-item mb-3">
                                    <button onClick={handleLogout} className="btn btn-outline-danger">Выход из аккаунта</button>
                                </li>
                            </ul>
                        </div>
                        <div className="col-md-9">
                            <div className="tab-content mt-4">
                                <div className={`tab-pane fade ${activeTab === 'panel' ? 'show active' : ''}`} id="panel" style={{ height: "100vh" }}>
                                    <div className="container">
                                        <div className="card bg-dark text-white">
                                            <div className="card-header">
                                                Панель управления
                                            </div>
                                            <div className="card-body">
                                                <h4>Баланс: {userData.balance} </h4>
                                                <h4>Бонусные баллы: {userData.bonus_points} </h4>
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
                                                <Modal open={isAvatarModal} onClose={() => setisAvatarModal(false)}>
                                                    <Box sx={{ ...style, width: 400 }}>
                                                        <Typography variant="h6">Изменить аватарку</Typography>
                                                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="form-control mb-3" />
                                                        <Button onClick={() => setIsLoginModalOpen(false)} variant="contained" fullWidth>Отмена</Button>
                                                    </Box>
                                                </Modal>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`tab-pane fade ${activeTab === 'history' ? 'show active' : ''}`} id="history" style={{ height: "100vh" }}>
                                    <div className="container">
                                        <div className="card mt-4 bg-dark text-white">
                                            <div className="card-header">
                                                История сеансов
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-dark table-striped">
                                                        <thead>
                                                            <tr>
                                                                <th>ID</th>
                                                                <th>Дата и время</th>
                                                                <th>Сумма</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {rechanges.map((rechange) => (
                                                                <tr key={rechange.payment_id}>
                                                                    <td>{rechange.payment_id}</td>
                                                                    <td>{rechange.date_time}</td>
                                                                    <td>{rechange.amount}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

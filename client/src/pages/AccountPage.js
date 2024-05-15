import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Box, TextField, Button, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import refreshIcon from '@iconify-icons/mdi/refresh';
import { ToastContainer, toast } from 'react-toastify';
import CircularProgress from '@mui/material/CircularProgress';
import '../styles/index.css'
import { Navigate } from 'react-router-dom';

import Modal from 'react-modal';
import '../styles/AccountPage.css';


function AccountPage({ username, handleLogout, setLoggedInUsername }) {
    const [userData, setUserData] = useState(null);
    const [newLogin, setNewLogin] = useState('');
    const [loading, setLoading] = useState(true);
    const [avatar, setAvatar] = useState(null);
    const [avatarUpdated, setAvatarUpdated] = useState(false);
    const [isAvatarModal, setisAvatarModal] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [passwordChangeError, setPasswordChangeError] = useState('');
    const [rechanges, setRechanges] = useState([]);
    const [username1, setUserName] = useState(username)
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('panel');
    const [newEmail, setNewEmail] = useState('');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [isEmailChangeModalOpen, setIsEmailChangeModalOpen] = useState(false);
    const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
    const [userSessionId, setUserSessionId] = useState();
    const [endTime, setEndTime] = useState();


    const [computers, setComputers] = useState([]);

    const [minutes, setMinutes] = useState(0);
    const [bonusPoints, setBonusPoints] = useState(0);
    const [selectedComputer, setSelectedComputer] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleStartSession = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }
            const response = await axios.post(`http://localhost:8080/sessions/${userData.user_id}`, {
                duration: parseInt(minutes),
                computer_id: selectedComputer,
                bonus_points: bonusPoints // Передача бонусных баллов в запрос
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchComputers();
            setShowModal(false);
            setUserSessionId(response.data.session_id);
            setEndTime(formatDate(response.data.date_time_end));
            reloadPage();
            showInfoToast(`Сессия запущена. Время окончания: ${formatDate(response.data.date_time_end)}`);
        } catch (error) {
            showErrorToast(error.response.data.message);
        }
    };

    function reloadPage() {
        window.location.reload();
    }

    const handleModalClose = () => {
        setShowModal(false);
    };

    useEffect(() => {
        fetchComputers();
    }, []);

    const fetchComputers = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.get(`http://localhost:8080/computers`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setComputers(response.data);
        } catch (error) {
            console.error(error);
        }
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

    const RefreshIcon = () => {
        const [isRotating, setIsRotating] = useState(false);

        const handleRotation = () => {
            setIsRotating(true);
            setTimeout(() => {
                setIsRotating(false);
            }, 500);
        };

        return (
            <Icon
                icon={refreshIcon}
                className={'rotate-animation'}
                onClick={handleRotation}
            />
        );
    };

    const handleSessionId = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }
            const response = await axios.get(`http://localhost:8080/sessions/${userData.user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
            setUserSessionId(response.data.session_id)
            console.log(response.data)
            setEndTime(formatDate(response.data.date_time_end))
            console.log(endTime)
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error.message);
        }
    };

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
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData) {
            handleSessionId();
        }
    }, [userData]);

    const fetchAvatarBeforeChange = async () => {
        try {
            if (!userData) return;

            const response = await axios.get(`http://localhost:8080/avatar/${userData.user_id}`);
            setAvatar(response.data);
        } catch (error) {
            console.error(error);
        }
    };


    const fetchAvatar = async () => {
        try {
            if (!userData) return;
            const response = await axios.get(`http://localhost:8080/avatar/${userData.user_id}`);
            setAvatar(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchUserRechanges = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.log('error');
                return;
            }
            console.log(token)
            const response = await axios.get(`http://localhost:8080/rechanges`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRechanges(response.data);
            console.log(response.data)
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        setLoading(true); // устанавливаем состояние загрузки перед отправкой запросов

        const fetchData = async () => {
            try {
                await fetchUserData(); // Получаем данные пользователя
                await fetchUserRechanges();
                await fetchComputers();
                await fetchAvatar(); // Получаем аватарку после получения данных пользователя
                await fetchAvatarBeforeChange();
            } catch (error) {
                console.error(error);
            }

            setLoading(false); // устанавливаем состояние загрузки в false после получения всех данных
        };

        fetchData(); // вызываем асинхронную функцию
    }, [username]); // useEffect будет вызываться при изменении username или userData

    useEffect(() => {
        if (userData) {
            fetchAvatar(); // Вызываем fetchAvatar только если userData определен
        }
    }, [userData]); // useEffect будет вызываться при изменении userData


    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

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

            setAvatarUpdated(!avatarUpdated); // Trigger re-render by upmdating avatarUpdated state
            showInfoToast('Аватарка была успешно изменена')
        } catch (error) {
            console.error(error);
        }
    };

    const refresh = async () => {
        fetchUserData();
        fetchUserRechanges();
        fetchComputers();
        console.log(activeTab);

    }

    const handleChangeLogin = async () => {
        try {
            const token = Cookies.get('token');

            // Проверяем валидность нового логина
            const isNewLoginValid = /^[a-zA-Z0-9_]+$/.test(newLogin);

            // Если новый логин не валиден, выходим из функции
            if (!isNewLoginValid) {
                showErrorToast('Некорректный формат логина');
                return;
            }

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
            showInfoToast('Логин был успешно изменен');

            Cookies.set('token', token, { expires: 7 });
        } catch (error) {
            showErrorToast(error.response.data.error);
        }
    };


    const stopSession = async () => {
        try {
            const token = Cookies.get('token');
            console.log(userSessionId)
            console.log(token)
            const response = await axios.put(`http://localhost:8080/sessions/end/${userSessionId}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUserSessionId(null);
            setEndTime(null);
            fetchComputers();
            fetchUserData();
            showInfoToast('Сеанс был успешно завершен')
        } catch (error) {
            showErrorToast(error.response.data.error);
        }
    }

    const handleChangePassword = async () => {
        try {
            if (newPassword !== confirmPassword) {
                showErrorToast('Новый пароль и подтверждение нового пароля не совпадают.');
                return;
            }
            if (newPassword === currentPassword) {
                showErrorToast('Новый пароль совпадает со старым паролем.');
                return;
            }

            // Добавляем проверку на валидность нового пароля
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&><)(^-_])[A-Za-z\d@$!%*#?&><)(^-_]{8,100}$/;
            if (!passwordRegex.test(newPassword)) {
                showErrorToast('Новый пароль должен состоять из ВЕРХНИХ и строчных латинских букв, содержать один из следующих специальных символов: .@$!%*#?&><)(^-_ и быть от 8 до 100 символов');
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
            showInfoToast('Пароль был успешно изменен');
        } catch (error) {
            showErrorToast(error.response.data.error);
        }
    };


    const handleChangeEmail = async () => {
        const isValidEmail = (email) => {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };

        try {
            const token = Cookies.get('token');
            if (!isValidEmail(newEmail)) {
                showErrorToast('Введите корректный адрес электронной почты');
                return;
            }
            const response = await axios.post(
                `http://localhost:8080/change-email`,
                { newEmail },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setIsEmailChangeModalOpen(false); // Закрываем модальное окно для смены почты
            setIsConfirmationModalOpen(true); // Открываем модальное окно для ввода кода подтверждения
            showInfoToast('Проверьте свою электронную почту. В случае ошибки пройдите процедуру заного');
        } catch (error) {
            showErrorToast(error.response.data.error);
        }
    };

    const handleConfirmEmail = async () => {
        const isValidCode = (code) => {
            return /^\d+$/.test(code);
        };
        try {
            const token = Cookies.get('token');
            if (!isValidCode(confirmationCode)) {
                showErrorToast('Введите корректный код подтверждения (только цифры)');
                return;
            }
            await axios.post(
                `http://localhost:8080/confirm-email`,
                { confirmationCode, new_email: newEmail },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setIsConfirmationModalOpen(false); // Закрываем модальное окно для ввода кода подтверждения
            // Дополнительные действия при успешном подтверждении, если нужно
            showInfoToast('Адрес электронной почты был успешно подтвержен');
        } catch (error) {
            console.error(error);
            showErrorToast(error.response.data.error);
            // Обработка ошибок при подтверждении почты
        }
    };



    const handleSubmit = (e) => {
        e.preventDefault();
        handleChangePassword();
    };

    return (
        <div className='bg-dark'>
            {loading ? ( // Показываем модальное окно загрузки, если данные загружаются
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="d-flex justify-content-center" style={{ height: '100vh', alignItems: 'center' }}>
                        <div className="spinner-border text-primary" role="status">
                        </div>
                    </div>
                </div>
            ) : (

                userData && (
                    <div className="container-fluid" style={{ height: "100vh" }}>
                        <div className="row" style={{ height: "100vh" }}>
                            <div className="col-md-3 menu bg-dark text-light shadow" style={{ display: 'flex', flexDirection: 'column' }}>
                                <div className="text-center mt-3 ml-auto" onClick={refresh}>
                                    <RefreshIcon />
                                </div>
                                <div className="text-center mt-3 ml-auto">
                                    <div className="avatar w-50 mx-auto">
                                        {avatar && <img src={`http://localhost:8080/avatar/${userData.user_id}?${Date.now()}`} alt="Avatar" className="img-fluid rounded-circle " onClick={() => setisAvatarModal(true)} />}
                                    </div>
                                    <p className="mt-3">{username1}</p>
                                   
                                </div>
                                <ul className="text-center menu-list nav flex-column">
                                    <li className={`nav-item mb-3 ${activeTab === 'panel' ? 'active' : ''}`}>
                                        <button type="button" className="btn btn-outline-warning w-100" id="panelTab" data-toggle="pill" href="#panel">Панель управления</button>
                                    </li>
                                    <li className={`nav-item mb-3 ${activeTab === 'history' ? 'active' : ''}`}>
                                        <button type="button" className="btn btn-outline-warning w-100" id="historyTab" data-toggle="pill" href="#history">История пополнений</button>
                                    </li>
                                    {!endTime ? (
                                        <li className={`nav-item mb-3 ${activeTab === 'session' ? 'active' : ''}`}>
                                            <button type="button" className="btn btn-outline-warning w-100" id="sessionTab" data-toggle="pill" href="#session">Начать сессию</button>

                                        </li>
                                    ) : null}
                                    {endTime ? (
                                        <div className='card bg-dark mb-3 px-2 border-warning'><li className="nav-item mb-3">
                                            <p>Сессия закончится: {endTime}</p>
                                            {userSessionId ? (
                                                <button onClick={stopSession} className="btn btn-outline-warning w-100">
                                                    Закончить сессию
                                                </button>
                                            ) : null}
                                        </li>
                                        </div>
                                    ) : null}
                                    <li className="nav-item mb-3">
                                        <button onClick={handleLogout} className="btn btn-outline-danger w-100">Выход из аккаунта</button>
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
                                                            <Button onClick={() => setIsLoginModalOpen(true)} variant="contained" color="primary">Изменить логин</Button>
                                                        </div>
                                                    </div>
                                                    {passwordChangeError && <p className="text-danger">{passwordChangeError}</p>}
                                                    <Button onClick={() => setIsModalOpen(true)} variant="contained" color="primary">Изменить пароль</Button>
                                                    <div className="mb-3">
                                                            <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} className="modal-dialog modal-dialog-centered">
                                                                <div className="modal-content">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">Изменить пароль</h5>
                                                                        <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}></button>
                                                                    </div>
                                                                    <div className="modal-body">
                                                                        <form onSubmit={handleSubmit}>
                                                                            <div className="mb-3">
                                                                                <label htmlFor="currentPassword" className="form-label">Текущий пароль</label>
                                                                                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="form-control" id="currentPassword" required />
                                                                            </div>
                                                                            <div className="mb-3">
                                                                                <label htmlFor="newPassword" className="form-label">Новый пароль</label>
                                                                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="form-control" id="newPassword" required />
                                                                            </div>
                                                                            <div className="mb-3">
                                                                                <label htmlFor="confirmPassword" className="form-label">Подтвердите новый пароль</label>
                                                                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="form-control" id="confirmPassword" required />
                                                                            </div>
                                                                            <button type="submit" className="btn btn-primary btn-block">Изменить пароль</button>
                                                                        </form>
                                                                        <button type="button" className="btn btn-secondary btn-block mt-3" onClick={() => setIsModalOpen(false)}>Отмена</button>
                                                                    </div>
                                                                </div>
                                                            </Modal>

                                                    </div>
                                                    <div className="mb-3">
                                                            <Modal isOpen={isLoginModalOpen} onRequestClose={() => setIsLoginModalOpen(false)} className="modal-dialog modal-dialog-centered">
                                                                <div className="modal-content">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">Изменить логин</h5>
                                                                        <button type="button" className="btn-close" onClick={() => setIsLoginModalOpen(false)}></button>
                                                                    </div>
                                                                    <div className="modal-body">
                                                                        <div className="mb-3">
                                                                            <label htmlFor="newLogin" className="form-label">Новый логин</label>
                                                                            <input type="text" value={newLogin} onChange={(e) => setNewLogin(e.target.value)} className="form-control" id="newLogin" />
                                                                        </div>
                                                                        <button onClick={handleChangeLogin} className="btn btn-primary btn-block mb-3">Изменить логин</button>
                                                                        <button onClick={() => setIsLoginModalOpen(false)} className="btn btn-secondary btn-block">Отмена</button>
                                                                    </div>
                                                                </div>
                                                            </Modal>

                                                    </div>
                                                    <div className="mb-3">
                                                            <Modal isOpen={isAvatarModal} onRequestClose={() => setisAvatarModal(false)} className="modal-dialog modal-dialog-centered">
                                                                <div className="modal-content">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">Изменить аватарку</h5>
                                                                        <button type="button" className="btn-close" onClick={() => setisAvatarModal(false)}></button>
                                                                    </div>
                                                                    <div className="modal-body">
                                                                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="form-control mb-3" />
                                                                        <button type="button" className="btn btn-secondary btn-block" onClick={() => setisAvatarModal(false)}>Отмена</button>
                                                                    </div>
                                                                </div>
                                                            </Modal>

                                                    </div>
                                                    <Button onClick={() => setIsEmailChangeModalOpen(true)} variant="contained" color="primary">Изменить почту</Button>
                                                    <div className="mb-3">
                                                            <Modal isOpen={isEmailChangeModalOpen} onRequestClose={() => setIsEmailChangeModalOpen(false)} className="modal-dialog modal-dialog-centered">
                                                                <div className="modal-content">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">Сменить почту</h5>
                                                                        <button type="button" className="btn-close" onClick={() => setIsEmailChangeModalOpen(false)}></button>
                                                                    </div>
                                                                    <div className="modal-body">
                                                                        <div className="mb-3">
                                                                            <label htmlFor="newEmail" className="form-label">Новая почта</label>
                                                                            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="form-control" id="newEmail" />
                                                                        </div>
                                                                        <button onClick={handleChangeEmail} className="btn btn-primary btn-block mb-3">Отправить код подтверждения</button>
                                                                        <button onClick={() => setIsEmailChangeModalOpen(false)} className="btn btn-secondary btn-block">Отмена</button>
                                                                    </div>
                                                                </div>
                                                            </Modal>

                                                    </div>

                                                    <div className="mb-3">
                                                            <Modal isOpen={isConfirmationModalOpen} onRequestClose={() => setIsConfirmationModalOpen(false)} className="modal-dialog modal-dialog-centered">
                                                                <div className="modal-content">
                                                                    <div className="modal-header">
                                                                        <h5 className="modal-title">Подтвердить новую почту</h5>
                                                                        <button type="button" className="btn-close" onClick={() => setIsConfirmationModalOpen(false)}></button>
                                                                    </div>
                                                                    <div className="modal-body">
                                                                        <div className="mb-3">
                                                                            <label htmlFor="confirmationCode" className="form-label">Код подтверждения</label>
                                                                            <input type="text" value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} className="form-control" id="confirmationCode" />
                                                                        </div>
                                                                        <button onClick={handleConfirmEmail} className="btn btn-primary btn-block mb-3">Подтвердить почту</button>
                                                                        <button onClick={() => setIsConfirmationModalOpen(false)} className="btn btn-secondary btn-block">Отмена</button>
                                                                    </div>
                                                                </div>
                                                            </Modal>

                                                    </div>
                                                </div>




                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tab-pane fade ${activeTab === 'history' ? 'show active' : ''}`} id="history" style={{ height: "100vh" }}>
                                        <div className="container">
                                            <div className="card mt-4 bg-dark text-white">
                                                <div className="card-header">
                                                    История пополнений
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
                                                                        <td>{formatDate(rechange.date_time)}</td>
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
                                    <div className={`tab-pane fade ${activeTab === 'session' ? 'show active' : ''}`} id="session" style={{ height: "100vh" }}>
                                        <div className="container">
                                            <div className="card mt-4 bg-dark text-white">
                                                <div className="card-header">
                                                    Начать сеанс
                                                </div>
                                                <div className="row row-cols-1 row-cols-md-3 g-4">
                                                    {computers.map(computer => (
                                                        <div key={computer.computer_id} className="col">
                                                            <div className={`card mt-1 mb-1 ${computer.active ? (computer.busy ? 'bg-danger' : 'bg-success') : 'bg-warning'}`}>
                                                                <div className="card-body">
                                                                    <h5 className="card-title">Компьютер {computer.computer_id}</h5>
                                                                    <p className="card-text">
                                                                        {computer.active ?
                                                                            (computer.busy ? 'Занят' : 'Свободен') :
                                                                            'Неактивен'
                                                                        }
                                                                    </p>
                                                                    <button
                                                                        onClick={() => { setSelectedComputer(computer.computer_id); setShowModal(true); }}
                                                                        className={`btn btn-primary ${computer.busy ? 'disabled' : ''}`}
                                                                        disabled={computer.busy}
                                                                        data-bs-toggle="modal"
                                                                        data-bs-target="#startSessionModal">
                                                                        Начать сессию
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                            <Modal isOpen={showModal} onRequestClose={handleModalClose} className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">Начать сессию</h5>
                                        <button type="button" className="btn-close" onClick={handleModalClose}></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="minutes" className="form-label">Введите количество минут:</label>
                                            <input type="number" className="form-control" id="minutes" value={minutes} onChange={(e) => setMinutes(e.target.value)} />
                                        </div>
                                        {/* Добавленное поле ввода для бонусных баллов */}
                                        <div className="mb-3">
                                            <label htmlFor="bonusPoints" className="form-label">Введите количество бонусных баллов (макс. {userData.bonus_points}):</label>
                                            <input type="number" className="form-control" id="bonusPoints" value={bonusPoints} onChange={(e) => setBonusPoints(e.target.value)} max={userData.bonus_points} />
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={handleModalClose}>Закрыть</button>
                                        <button type="button" className="btn btn-primary" onClick={handleStartSession}>Начать сессию</button>
                                    </div>
                                </div>
                            </Modal>


                    </div>
                )
            )}
            <ToastContainer></ToastContainer>
        </div>
    );
}

export default AccountPage;

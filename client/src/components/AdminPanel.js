import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from 'react-modal';
import { Icon, InlineIcon } from '@iconify/react';
import pencilIcon from '@iconify-icons/mdi/pencil';
import dollarIcon from '@iconify-icons/mdi/currency-usd';
import playIcon from '@iconify-icons/mdi/play';
import stopIcon from '@iconify-icons/mdi/stop';


function AdminPanel({ username, handleLogout }) {
    const [userData, setUserData] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [computers, setComputers] = useState([]);
    const [duration, setDuration] = useState('');
    const [sessions, setSessions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5);
    const [selectedComputer, setSelectedComputer] = useState(null);
    const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [currentPageSessions, setCurrentPageSessions] = useState(1); // Define currentPageSessions
    const [sessionsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const filteredUsers = searchTerm
    ? userData.filter(user => user.login.toLowerCase().includes(searchTerm.toLowerCase()))
    : userData;




    const fetchUserData = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }
    
            let url = 'http://localhost:8080/userprofiles';
            if (searchTerm) {
                url += `?search=${searchTerm}`;
            }
    
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            setUserData(response.data);
        } catch (error) {
            console.error(error);
        }
    };
    

    useEffect(() => {
        fetchUserData();
    }, [username]);

    useEffect(() => {
        fetchSessions();
        fetchComputers();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchSessions();
            fetchUserData();
            fetchComputers();
        }, 5000); // Обновление данных каждые 5 секунд

        return () => clearInterval(interval);
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

    const submitFormEdit = async (userId, newData) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.put(`http://localhost:8080/users/${userId}`, newData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Профиль пользователя успешно изменен');
            console.log(response.data);

            // Обновление данных после изменения профиля
            fetchUserData();
        } catch (error) {
            console.error('Ошибка при изменении профиля пользователя:', error);
        }
    };

    const submitRechangeForm = async (userId, newData) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.put(`http://localhost:8080/users/${userId}/recharge`, newData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Данные пополнены');
            console.log(response.data);

            // Обновление данных после пополнения баланса
            fetchUserData();
        } catch (error) {
            console.error('Ошибка при пополнении баланса:', error);
        }
    };

    const startSession = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.post(`http://localhost:8080/sessions/${selectedUserId}`, {
                duration: parseInt(duration),
                computer_id: selectedComputer
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Сессия успешно запущена');
            console.log(response.data);

            // Обновление данных после запуска сессии
            fetchSessions();
        } catch (error) {
            console.error('Ошибка при запуске сессии:', error);
        }
    };

    const fetchSessions = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.get(`http://localhost:8080/sessions`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setSessions(response.data);
        } catch (error) {
            console.error('Ошибка при получении списка сессий:', error);
        }
    };

    const endSession = async (sessionId) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.put(`http://localhost:8080/sessions/end/${sessionId}`, null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Сессия завершена успешно');
            console.log(response.data);

            // Обновление данных после завершения сессии
            fetchSessions();
        } catch (error) {
            console.error('Ошибка при завершении сессии:', error);
        }
    };
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }
    

    const handleEditModalOpen = (userId) => {
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    };

    const handleRechargeModalOpen = (userId) => {
        setSelectedUserId(userId);
        setIsRechargeModalOpen(true);
    };

    const handleSessionModalOpen = (userId) => {
        setSelectedUserId(userId);
        setIsSessionModalOpen(true);
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };

    const handleRechargeModalClose = () => {
        setIsRechargeModalOpen(false);
    };

    const handleSessionModalClose = () => {
        setIsSessionModalOpen(false);
    };

    const handleEndSessionModalClose = () => {
        setIsEndSessionModalOpen(false);
    };

    const handleEndSessionModalOpen = (sessionId) => {
        setSelectedSessionId(sessionId);
        setIsEndSessionModalOpen(true);
    };

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = userData ? filteredUsers.slice(indexOfFirstUser, indexOfLastUser) : [];

    const indexOfLastSession = currentPageSessions * sessionsPerPage;
    const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
    const currentSessions = sessions.slice(indexOfFirstSession, indexOfLastSession);
    

    return (
        <div className="container card mb-3 mt-3">
            {userData ? (
                <div>
                    <div className="container">
                        <h2 className='mt-2'>Панель администратора</h2>
                        <h4>Пользователи</h4>
                        <input
                        type="text"
                        className="form-control"
                        placeholder="Поиск по имени пользователя"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                        <div className="table-responsive">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Имя пользователя</th>
                                        <th>Email</th>
                                        <th>Баланс</th>
                                        <th>Бонусные баллы</th>
                                        <th>Изменение профиля</th>
                                        <th>Пополнение баланса</th>
                                        <th>Запустить сессию</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentUsers.map(user => (
                                        <tr key={user.user_id}>
                                            <td>{user.user_id}</td>
                                            <td>{user.login}</td>
                                            <td>{user.email}</td>
                                            <td>{user.balance}</td>
                                            <td>{user.bonus_points}</td>
                                            <td>
                                                <button className="btn btn-primary" onClick={() => handleEditModalOpen(user.user_id)}>
                                                    <Icon icon={pencilIcon} /> 
                                                </button>
                                            </td>
                                            <td>
                                                <button className="btn btn-success" onClick={() => handleRechargeModalOpen(user.user_id)}>
                                                    <Icon icon={dollarIcon} /> 
                                                </button>
                                            </td>
                                            <td>
                                                <button className="btn btn-warning" onClick={() => handleSessionModalOpen(user.user_id)}>
                                                    <Icon icon={playIcon} /> 
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <p>Загрузка данных...</p>
            )}

            {/* Pagination for Users */}
            {userData && (
    <ul className="pagination">
        {Array(Math.ceil(filteredUsers.length / usersPerPage)).fill().map((_, index) => (
            <li key={index} className={currentPage === index + 1 ? 'page-item active' : 'page-item'}>
                <button onClick={() => setCurrentPage(index + 1)} className="page-link">{index + 1}</button>
            </li>
        ))}
    </ul>
)}


<h4>Список сессий</h4>
<div className="table-responsive">
    <table className="table table-striped">
        <thead>
            <tr>
                <th>ID сессии</th>
                <th>Начало сессии</th>
                <th>Окончание сессии</th>
                <th>ID пользователя</th>
                <th>Действия</th>
            </tr>
        </thead>
        <tbody>
            {currentSessions.map(session => (
                <tr key={session.session_id}>
                    <td>{session.session_id}</td>
                    <td>{formatDate(session.date_time_start)}</td>
                    <td>{formatDate(session.date_time_end)}</td>
                    <td>{session.user_id}</td>
                    <td>
                        <button className="btn btn-danger" onClick={() => handleEndSessionModalOpen(session.session_id)}>
                        <Icon icon={stopIcon} />
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>


            {/* Pagination for Sessions */}
            {sessions && (
    <ul className="pagination">
        {Array(Math.ceil(sessions.length / sessionsPerPage)).fill().map((_, index) => (
            <li key={index} className={currentPageSessions === index + 1 ? 'page-item active buttons12' : 'page-item'}>
                <button onClick={() => setCurrentPageSessions(index + 1)} className="page-link z-n1">{index + 1}</button>
            </li>
        ))}
    </ul>
)}

            <div className="container card mb-3 mt-3">
            <h4 className='mt-1'>Компьютеры в зале:</h4>
            <div className="row row-cols-1 row-cols-md-3 g-4">
                {computers.map(computer => (
                    <div key={computer.computer_id} className="col">
                        <div className={`card mt-1 mb-1 ${computer.busy ? 'bg-danger' : 'bg-success'}`}>
                            <div className="card-body">
                                <h5 className="card-title">Компьютер {computer.computer_id}</h5>
                                <p className="card-text">{computer.busy ? 'Занят' : 'Свободен'}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
            <button className="btn btn-danger mb-2" onClick={handleLogout}>Выход из аккаунта</button>

            <div className='container'>
                <Modal isOpen={isEditModalOpen} onRequestClose={handleEditModalClose} className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                        <h5 className="modal-title">Изменение профиля пользователя {userData && userData[selectedUserId-1] && userData[selectedUserId-1].login}</h5>
                            <button type="button" className="btn-close" onClick={handleEditModalClose}></button>
                        </div>
                        <div className="modal-body">
                        <form onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const newData = {
                        login: formData.get('login') || '', // Если не введен логин, устанавливаем пустую строку
                        email: formData.get('email') || '' // Если не введен email, устанавливаем пустую строку
                    };
                    submitFormEdit(selectedUserId, newData);
                    handleEditModalClose();
                }}>
                    <div className="mb-3">
                        <label htmlFor="login" className="form-label">Новое имя пользователя:</label>
                        <input type="text" className="form-control" id="login" name="login" placeholder={`Текущий логин: ${userData && userData[selectedUserId-1] && userData[selectedUserId-1].login}`} />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Новый email пользователя:</label>
                        <input type="email" className="form-control" id="email" name="email" placeholder={`Текущий email: ${userData && userData[selectedUserId-1] && userData[selectedUserId-1].email}`} />
                    </div>
                    <button type="submit" className="btn btn-primary">Сохранить изменения</button>
                </form>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={isEndSessionModalOpen} onRequestClose={handleEndSessionModalClose} className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Завершение сессии</h5>
                            <button type="button" className="btn-close" onClick={handleEndSessionModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <p>Вы уверены, что хотите завершить эту сессию?</p>
                            <div>
                                <button type="button" className="btn btn-danger" onClick={() => {
                                    endSession(selectedSessionId);
                                    handleEndSessionModalClose();
                                }}>Да</button>
                                <button type="button" className="btn btn-secondary" onClick={handleEndSessionModalClose}>Нет</button>
                            </div>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={isRechargeModalOpen} onRequestClose={handleRechargeModalClose} className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Пополнение баланса</h5>
                            <button type="button" className="btn-close" onClick={handleRechargeModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const newData = {
                                    amount: formData.get('amount'),
                                };
                                submitRechangeForm(selectedUserId, newData);
                                handleRechargeModalClose();
                            }}>
                                <div className="mb-3">
                                    <label htmlFor="amount" className="form-label">Сумма пополнения:</label>
                                    <input type="number" className="form-control" id="amount" name="amount" placeholder="Введите сумму пополнения" required />
                                </div>
                                <button type="submit" className="btn btn-primary">Пополнить баланс</button>
                            </form>
                        </div>
                    </div>
                </Modal>

                <Modal isOpen={isSessionModalOpen} onRequestClose={handleSessionModalClose} className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Запуск сессии</h5>
                            <button type="button" className="btn-close" onClick={handleSessionModalClose}></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                startSession();
                                handleSessionModalClose();
                            }}>
                                <div className="mb-3">
                                    <label htmlFor="duration" className="form-label">Длительность сессии (в минутах):</label>
                                    <input onChange={(e) => setDuration(e.target.value)} type="number" className="form-control" id="duration" name="duration" placeholder="Введите длительность сессии" required />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="computer" className="form-label">Выберите компьютер:</label>
                                    <select className="form-select" id="computer" name="computer" onChange={(e) => setSelectedComputer(e.target.value)} required>
                                        <option value="">Выберите компьютер</option>
                                        {computers.map(computer => (
                                            !computer.busy &&
                                            <option key={computer.computer_id} value={computer.computer_id}>
                                                Компьютер {computer.computer_id}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-primary">Запустить сессию</button>
                            </form>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}

export default AdminPanel;

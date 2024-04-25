import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from 'react-modal';
import { Icon, InlineIcon } from '@iconify/react';
import stopIcon from '@iconify-icons/mdi/stop';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SessionTable() {
    const [userData, setUserData] = useState(null);
    const [computers, setComputers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [isEndSessionModalOpen, setIsEndSessionModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [currentPageSessions, setCurrentPageSessions] = useState(1); // Define currentPageSessions
    const [sessionsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = searchTerm
        ? userData.filter(user => user.login.toLowerCase().includes(searchTerm.toLowerCase()))
        : userData;

    useEffect(() => {
        const interval = setInterval(() => {
            fetchSessions();
        }, 1000); // Обновление данных каждые 5 секунд

        return () => clearInterval(interval);
    }, []);

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
            console.log("Ошибка на сервере:", error); // Добавленный console.log
            if (error.response.data.error) {
                showErrorToast(error.response.data.error)
                console.log(error.response.data.error)
            } else {
                showErrorToast("Ошибка при добавлении сотрудника")
            }
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

    const handleEndSessionModalClose = () => {
        setIsEndSessionModalOpen(false);
    };

    const handleEndSessionModalOpen = (sessionId) => {
        setSelectedSessionId(sessionId);
        setIsEndSessionModalOpen(true);
    };

    const indexOfLastSession = currentPageSessions * sessionsPerPage;
    const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
    const currentSessions = sessions.slice(indexOfFirstSession, indexOfLastSession);

    return (
        <div className="container mb-3 mt-3">
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
            <div className='container'>
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
            </div>
        </div>
    );
}

export default SessionTable;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Modal from 'react-modal';
import { Icon, InlineIcon } from '@iconify/react';
import pencilIcon from '@iconify-icons/mdi/pencil';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function EmployeeTable( {username} ){
    const [employeeData, setEmployeeData] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [active, setActive] = useState(''); // Устанавливаем пустое значение по умолчанию
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [roleName, setRoleName] = useState('Администратор'); // Устанавливаем значение по умолчанию
    const [newEmployeeData, setNewEmployeeData] = useState({
        login: '',
        role_name: 'Администратор',
        active: true,
        email: '',
    });
    const [currentPageAdmin, setCurrentPageAdmin] = useState(1);
    const [adminsPerPage] = useState(5);

    const handleAddModalOpen = () => {
        setIsAddModalOpen(true);
    };
    
    const handleAddModalClose = () => {
        setIsAddModalOpen(false);
    };
    

    const handleNewEmployeeChange = (e) => {
        const { name, value } = e.target;
        setNewEmployeeData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const submitFormAdd = async (e) => {
        e.preventDefault();
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }
    
            const response = await axios.post(`http://localhost:8080/employees/`, newEmployeeData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
    
            console.log('Новый сотрудник успешно добавлен');
            console.log(response.data);
    
            // Обновление данных после добавления нового сотрудника
            fetchEmployeeData();
            setIsAddModalOpen(false);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                showErrorToast("Доступ запрещен. У вас недостаточно прав для выполнения этого действия.");
            } else {
                showErrorToast("Ошибка при добавлении сотрудника");
            }
        }       
        
    };
    
    


    const fetchEmployeeData = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            let url = 'http://localhost:8080/employees';

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setEmployeeData(response.data);
        } catch (error) {
            console.error(error);
        }
    };


    useEffect(() => {
        fetchEmployeeData();
    }, [username]);


    useEffect(() => {
        const interval = setInterval(() => {
            fetchEmployeeData();
        }, 100);

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

    const submitFormEdit = async (userId, newData) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.put(`http://localhost:8080/employees/${userId}`, newData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Профиль пользователя успешно изменен');
            console.log(response.data);

            // Обновление данных после изменения профиля
            fetchEmployeeData();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                return showErrorToast(error.response.data.error);
            } else {
                showErrorToast("Ошибка при изменении профиля пользователя");
            }
        }
        
    };


    const handleEditModalOpen = (userId) => {
        setSelectedUserId(userId);
        setIsEditModalOpen(true);
    };


    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
    };

    const indexOfLastUser = currentPageAdmin * adminsPerPage;
    const indexOfFirstUser = indexOfLastUser - adminsPerPage;
    const currentUsers = employeeData ? employeeData.slice(indexOfFirstUser, indexOfLastUser) : [];

    return (
        <div>
        {employeeData ? (
            <div>
                <div className="container">
                    <h4>Сотрудники</h4>

                    <div className="table-responsive">
                        <button className="btn btn-success" onClick={() => handleAddModalOpen()}>
                            Добавить сотрудника
                        </button>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Имя администратора</th>
                                    <th>Роль</th>
                                    <th>Активен</th>
                                    <th>Изменить</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map(employee => (
                                    <tr key={employee.employee_id}>
                                        <td>{employee.employee_id}</td>
                                        <td>{employee.login}</td>
                                        <td>{employee.role_name}</td>
                                        {employee.active ?
                                            <td>Активен</td> : <td>Неактивен</td>
                                        }
                                            <button className="btn btn-primary" onClick={() => handleEditModalOpen(employee.employee_id)}>
                                                <Icon icon={pencilIcon} /> 
                                            </button>
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
{employeeData && (
    <ul className="pagination">
        {Array(Math.ceil(employeeData.length / adminsPerPage)).fill().map((_, index) => (
            <li key={index} className={currentPageAdmin === index + 1 ? 'page-item active' : 'page-item'}>
                <button onClick={() => setCurrentPageAdmin(index + 1)} className="page-link">{index + 1}</button>
            </li>
        ))}
    </ul>
)}

        <div className='container'>
            <Modal isOpen={isEditModalOpen} onRequestClose={handleEditModalClose} className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                    <h5 className="modal-title">Изменение профиля пользователя {employeeData && employeeData[selectedUserId-1] && employeeData[selectedUserId-1].login}</h5>
                        <button type="button" className="btn-close" onClick={handleEditModalClose}></button>
                    </div>
                    <div className="modal-body">
                    <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const newData = {
                    login: formData.get('login') || '',
                    role_name: formData.get('role_name') || '',
                    active: formData.get('active') === 'true' // Преобразуем значение в булево
                };
                submitFormEdit(selectedUserId, newData);
                handleEditModalClose();
            }}>
                <div className="mb-3">
                    <label htmlFor="login" className="form-label">Новый логин:</label>
                    <input type="text" className="form-control" id="login" name="login" placeholder={`Текущий логин: ${employeeData && employeeData[selectedUserId-1] && employeeData[selectedUserId-1].login}`} />
                </div>
                <div className="mb-3">
                    <label htmlFor="role_name" className="form-label">Новая роль:</label>
                    <select className='form-select' id='role_name' name='role_name' value={roleName} onChange={(e) => setRoleName(e.target.value)}>
                        <option value='Администратор'>Администратор</option>
                        <option value='Менеджер'>Менеджер</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="active" className="form-label">Активность:</label>
                    <select className="form-select" id="active" name="active" value={active} onChange={(e) => setActive(e.target.value)}>
                        <option value="true">Активен</option>
                        <option value="false">Неактивен</option>
                </select>
                </div>
                <button type="submit" className="btn btn-primary">Сохранить изменения</button>
            </form>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isAddModalOpen} onRequestClose={handleAddModalClose} className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
        <div className="modal-header">
            <h5 className="modal-title">Добавление нового сотрудника</h5>
            <button type="button" className="btn-close" onClick={handleAddModalClose}></button>
        </div>
        <div className="modal-body">
            <form onSubmit={submitFormAdd}>
                <div className="mb-3">
                    <label htmlFor="login" className="form-label">Логин:</label>
                    <input type="text" className="form-control" id="login" name="login" value={newEmployeeData.login} onChange={handleNewEmployeeChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="login" className="form-label">Email:</label>
                    <input type="text" className="form-control" id="email" name="email" value={newEmployeeData.email} onChange={handleNewEmployeeChange} />
                </div>
                <div className="mb-3">
                    <label htmlFor="role_name" className="form-label">Роль:</label>
                    <select className='form-select' id='role_name' name='role_name' value={newEmployeeData.role_name} onChange={handleNewEmployeeChange}>
                        <option value='Администратор'>Администратор</option>
                        <option value='Менеджер'>Менеджер</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="active" className="form-label">Активен:</label>
                    <select className="form-select" id="active" name="active" value={newEmployeeData.active} onChange={handleNewEmployeeChange}>
                        <option value={true}>Да</option>
                        <option value={false}>Нет</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Добавить</button>
            </form>
        </div>
    </div>
</Modal>
        </div>
    </div>
    );
}

export default EmployeeTable
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

function ComputerTable() {
    const [computerEmployees, setComputerEmployees] = useState({});
    const [employeeData, setEmployeeData] = useState(null);
    const [currentPageComputers, setCurrentPageComputers] = useState(1);
    const [computersPerPage] = useState(5);
    const [computers, setComputers] = useState([]);

    useEffect(() => {
        fetchComputers();
        fetchEmployeeData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchComputers();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const fetchEmployeeData = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.get('http://localhost:8080/employees', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setEmployeeData(response.data);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                return showErrorToast(error.response.data.error);
            } else {
                showErrorToast("Ошибка при получении списка сотрудников");
            }
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

    const handleEmployeeChange = async (computerId, employeeId) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }
            const response = await axios.put(
                `http://localhost:8080/computers/${computerId}/changeEmployee`, 
                { newEmployee: employeeId }, // передаем нового сотрудника в теле запроса
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(response.data)
            fetchComputers();

        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                return showErrorToast(error.response.data.error);
            } else {
                showErrorToast("Ошибка при изменении ответственного сотрудника");
            }
        }
    };

    const handleToggleActive = async (computerId) => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }
            const response = await axios.put(
                `http://localhost:8080/computers/${computerId}/toggleActive`, 
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            console.log(response.data)
            fetchComputers();

        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                return showErrorToast(error.response.data.error);
            } else {
                showErrorToast("Ошибка при изменении статуса ПК");
            }
        }
    };

    const fetchComputers = async () => {
        try {
            const token = Cookies.get('token');
            if (!token) {
                console.error('Token not found');
                return;
            }

            const response = await axios.get('http://localhost:8080/computers', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setComputers(response.data);
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                return showErrorToast(error.response.data.error);
            } else {
                showErrorToast("Ошибка при получении списка ПК");
            }
        }
    };

    const indexOfLastComputer = currentPageComputers * computersPerPage;
    const indexOfFirstComputer = indexOfLastComputer - computersPerPage;    
    const currentComputers = computers ? computers.slice(indexOfFirstComputer, indexOfLastComputer) : [];

    return (
        <div>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Компьютер</th>
                            <th>Ответственный</th>
                            <th>Активен</th>
                            <th>Изменить</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentComputers.map(computer => (
                            <tr key={computer.computer_id}>
                                <td>{computer.computer_id}</td>
                                <td>Компьютер №{computer.computer_id}</td>
                                <td>
                                    <select className='form-select'
                                        value={computerEmployees[computer.computer_id] || ''} 
                                        onChange={(e) => {
                                            const selectedEmployeeId = e.target.value;
                                            setComputerEmployees(prevState => ({
                                                ...prevState,
                                                [computer.computer_id]: selectedEmployeeId
                                            }));
                                            handleEmployeeChange(computer.computer_id, selectedEmployeeId);
                                        }}
                                        >
                                            <option value="">Выберите ответственного</option>
                                        {employeeData && employeeData.map(employee => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.login}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                {computer.active ?
                                    <td>Активен</td> : <td>Неактивен</td>
                                }
                                <button className="btn btn-primary" onClick={() => handleToggleActive(computer.computer_id)}>
                                    Изменить
                                </button>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {computers && (
                <ul className="pagination">
                    {Array(Math.ceil(computers.length / computersPerPage)).fill().map((_, index) => (
                        <li key={index} className={currentPageComputers === index + 1 ? 'page-item active' : 'page-item'}>
                            <button onClick={() => setCurrentPageComputers(index + 1)} className="page-link">{index + 1}</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ComputerTable;

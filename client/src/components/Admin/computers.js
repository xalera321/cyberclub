import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';



function ComputerList() {
    const [computers, setComputers] = useState([]);
    const [employeeData, setEmployeeData] = useState(null);
    useEffect(() => {
        fetchComputers();
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            fetchComputers();
            var username = Cookies.get('username');
            if (!username){
                return (
                    <Navigate to="/" />
                )
            }
        }, 1000); // Обновление данных каждые 5 секунд

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
    return (
            <div className="container mb-3 mt-3">
            <h4 className='mt-1'>Компьютеры в зале:</h4>
            <div className="row row-cols-1 row-cols-md-3 g-4">
                {computers.map(computer => (
                    <div key={computer.computer_id} className="col">
                        <div className={`card mt-1 mb-1 ${ computer.active ? (computer.busy ? 'bg-danger' : 'bg-success') : 'bg-warning'}`}>
                            <div className="card-body">
                                <h5 className="card-title">Компьютер {computer.computer_id}</h5>
                                <p className='card-text'>Ответственный: {computer.admin_login}</p>
                                <p className="card-text">
    {computer.active ? 
        (computer.busy ? 'Занят' : 'Свободен') :
        'Неактивен'
    }
</p>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ComputerList;

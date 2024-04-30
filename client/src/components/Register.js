// Register.js
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

const Register = ({ onRegister, registrationError }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [validity, setValidity] = useState({
        username: true,
        password: true
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Проверка валидности и обновление состояния валидности
        if (name === 'username') {
            const isValid = /^[a-zA-Z0-9_]+$/.test(value);
            setValidity({ ...validity, [name]: isValid });
        } else if (name === 'password') {
            const isValid = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            setValidity({ ...validity, [name]: isValid });
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Проверка валидности перед отправкой
        const isFormValid = Object.values(validity).every((value) => value);
        if (isFormValid) {
            onRegister(formData);
        }
    };
}

export default Register;

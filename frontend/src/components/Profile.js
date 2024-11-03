import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate here
import "./profile.css";
import { Form, Button, Table } from 'react-bootstrap';

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate(); // Initialize navigate here
    const [userData, setUserData] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState(null);  
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    const handleError = (errorMessage) => {
        setError(errorMessage);
        console.error("Ошибка:", errorMessage);
    };

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) {
                console.error("Token is not available");
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8080/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setUserData(response.data);
                setIsAdmin(response.data.role === 'admin');
            } catch (error) {
                if (error.response) {
                    setError(`Ошибка: ${error.response.status} - ${error.response.data.message || JSON.stringify(error.response.data)}`);
                    console.error("Ошибка:", error.response.data);
                } else if (error.request) {
                    setError("Запрос был отправлен, но ответа не было.");
                    console.error("Ошибка запроса:", error.request);
                } else {
                    setError("Ошибка: " + error.message);
                    console.error("Ошибка:", error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, token]);

    useEffect(() => {
        const fetchAllUsers = async () => {
            if (isAdmin && token) {
                try {
                    const response = await axios.get('http://localhost:8080/users', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    setAllUsers(response.data);
                } catch (error) {
                    handleError("Ошибка при получении списка пользователей.");
                }
            }
        };

        fetchAllUsers();
    }, [isAdmin, token]);

    const handleEditToggle = () => {
        setEditMode(!editMode);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!token) {
            handleError("Токен не найден.");
            return;
        }
        
        try {
            await axios.put(`http://localhost:8080/users/${userData.id}`, userData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            setEditMode(false);
            alert('Данные обновлены успешно!');
        } catch (error) {
            handleError("Ошибка при обновлении данных.");
        }
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login"); 
    };
    
    const handleShowTasks = () => {
        navigate(`/users/${userId}/tasks`)
    }

    return (
        <div className="profile__wrapper">
            {error && <div className="error">{error}</div>}
    
            <div className='buttons'>            
                <Button variant="primary" className='logouts' onClick={handleLogout}>LOGOUT</Button>
                <Button variant="primary" onClick={handleShowTasks}>TASKS</Button>
            </div>
    
            {userData ? (
                <div>
                    <h2>{isAdmin ? 'Список пользователей' : 'Ваш профиль'}</h2>
                    {!isAdmin ? (
                        <Form onSubmit={handleUpdate}>
                            <Form.Group className="mb-2" controlId="email">
                                <Form.Label>Email:</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={userData.email || ''}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                    required
                                />
                            </Form.Group>
    
                            <Form.Group className="mb-2" controlId="name">
                                <Form.Label>Имя:</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={userData.name || ''}
                                    onChange={handleInputChange}
                                    disabled={!editMode}
                                    required
                                />
                            </Form.Group>
    
                            <Button variant="primary" onClick={handleEditToggle}>
                                {editMode ? 'Отменить' : 'Редактировать'}
                            </Button>
                            {editMode && <Button variant="primary" type="submit" className="edit">Сохранить изменения</Button>}
                        </Form>
                    ) : (
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Имя</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>{user.id}</td>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </div>
            ) : (
                <p>Пользователь не найден.</p>
            )}
        </div>
    );
};

export default Profile;
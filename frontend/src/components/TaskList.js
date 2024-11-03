import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, ListGroup, Modal, Form, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import "./tasklist.css";

const TaskList = () => {
  const { userId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newTask, setNewTask] = useState({ name: '', description: '', status: 'Pending' });

  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem("token");

    try {
        const response = await axios.get(`http://localhost:8080/users/${userId}/tasks/`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setTasks(response.data);
    } catch (error) {
        console.error("Ошибка при получении задач:", error);
        setTasks([]);
        if (error.response && error.response.status === 401) {
            navigate("/login");
        }
    } finally {
        setLoading(false);
    }
}, [userId, navigate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  
  const handleShowCreate = () => setShowCreate(true);

  const handleCloseCreate = () => {
    setShowCreate(false);
    setNewTask({ name: '', description: '', status: 'Pending' });
  };

  const handleShowEdit = (task) => {
    setCurrentTask(task);
    setShowEdit(true);
  };

  const handleCloseEdit = () => setShowEdit(false);

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleCreateTask = async (event) => {
    const token = localStorage.getItem('token');
    event.preventDefault();
    
    try {
        const response = await axios.post(`http://localhost:8080/users/${userId}/tasks/`, newTask, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('Задача создана:', response.data);
        fetchTasks();
        handleCloseCreate();
    } catch (error) {
        setError("Ошибка при создании задачи. Пожалуйста, попробуйте еще раз.");
        console.error("Ошибка при создании задачи:", error);
    }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token'); 
    try {
        await axios.put(`http://localhost:8080/users/${userId}/tasks/${currentTask.id}`, currentTask, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        fetchTasks();
        handleCloseEdit();
    } catch (error) {
        setError("Ошибка при обновлении задачи. Пожалуйста, попробуйте еще раз.");
        console.error("Ошибка при обновлении задачи:", error);
    }
};

  const handleDelete = async (id) => {
      if (window.confirm('Вы уверены, что хотите удалить эту задачу?')) {
          const token = localStorage.getItem('token'); 
          try {
              await axios.delete(`http://localhost:8080/users/${userId}/tasks/${id}`, {
                  headers: {
                      'Authorization': `Bearer ${token}`,
                  },
              });
              fetchTasks();
          } catch (error) {
              setError("Ошибка при удалении задачи. Пожалуйста, попробуйте еще раз.");
              console.error("Ошибка при удалении задачи:", error);
          }
      }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login"); 
  };

  const handleShowProfile = () => {
    navigate(`/users/${userId}/profile`)
  }

  return (
    <div className="task-list__wrapper">
      <h3>Your Tasks</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button className="text-muted px-0" variant="link" onClick={handleLogout}>
        LOGOUT
      </Button>
      <Button variant="primary" onClick={handleShowCreate}>Add Task</Button>
      <Button variant="primary" onClick={handleShowProfile}>Profile</Button>

    {loading ? (
        <Spinner animation="border" />
      ) : (
        <ListGroup>
          {Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task) => (
            <ListGroup.Item key={task.id} className="task-item">
                <h5>{task.name}</h5>
                <p>Status: {task.status}</p>
                <Button variant="secondary" onClick={() => handleShowEdit(task)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(task.id)}>Delete</Button>
            </ListGroup.Item>
            ))
        ) : (
            <p>No tasks available.</p>
        )}
        </ListGroup>
      )}

      <Modal show={showCreate} onHide={handleCloseCreate}>
        <Modal.Header closeButton>
          <Modal.Title>Create Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateTask}>
            <Form.Group controlId="formNewTaskName">
              <Form.Label>Task Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={newTask.name}
                onChange={handleNewTaskChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formNewTaskDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={newTask.description}
                onChange={handleNewTaskChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formNewTaskStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={newTask.status}
                onChange={handleNewTaskChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </Form.Control>
            </Form.Group>
            <Button variant="primary" type="submit">Create Task</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showEdit} onHide={handleCloseEdit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentTask && (
            <Form onSubmit={handleUpdate}>
              <Form.Group controlId="formTaskName">
                <Form.Label>Task Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={currentTask.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formTaskDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={currentTask.description}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group controlId="formTaskStatus">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  name="status"
                  value={currentTask.status}
                  onChange={handleInputChange}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Form.Control>
              </Form.Group>
              <Button variant="primary" type="submit">Save Changes</Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TaskList;
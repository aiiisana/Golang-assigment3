import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./register.css";

const Register = () => {
  const [inputName, setInputName] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();


  const handleLoginRedirect = () => {
    navigate('/');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const newUser = {
      name: inputName,
      email: inputEmail,
      password: inputPassword,
    };

    axios.post('http://localhost:8080/auth/users', newUser)
      .then((response) => {
        console.log("Пользователь успешно зарегистрирован:", response.data);
        setSuccess(true);
        setError("");
      })
      .catch((error) => {
        console.error("Ошибка при регистрации пользователя:", error);
        setError("Ошибка при регистрации. Попробуйте снова.");
        setSuccess(false);
      });
  };

  return (
    <div className="register__wrapper">
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Регистрация успешна!</div>}
      <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mb-2 text-center">Register</div>
        <Form.Group className="mb-2" controlId="Name">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={inputName}
            placeholder="Name"
            onChange={(e) => setInputName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="Email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={inputEmail}
            placeholder="Email"
            onChange={(e) => setInputEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group className="mb-2" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={inputPassword}
            placeholder="Password"
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button className="w-100" variant="primary" type="submit">
          Register
        </Button>
      </Form>
      <div className="d-grid justify-content-end">
          <Button className="text-muted px-0" variant="link" onClick={handleLoginRedirect}>
            LOGIN
          </Button>
        </div>
    </div>
  );
};

export default Register;
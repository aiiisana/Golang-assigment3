import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./login.css";
import axios from "axios";

const Login = () => {
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
        const response = await axios.post('http://localhost:8080/auth/login', {
            email: inputEmail,
            password: inputPassword,
        });

        const { token, userId } = response.data;

        localStorage.setItem("token", token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        navigate(`/users/${userId}/profile`);

    } catch (error) {
        setError("Ошибка при входе. Проверьте данные.");
    } finally {
        setLoading(false);
    }
};
  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className="sign-in__wrapper">
      <Form className="shadow p-4 bg-white rounded" onSubmit={handleSubmit}>
        <div className="h4 mb-2 text-center">Sign In</div>
        {error && (
          <Alert className="mb-2" variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
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
        <Form.Group className="mb-2" controlId="Password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={inputPassword}
            placeholder="Password"
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
        </Form.Group>
        <Button className="w-100" variant="primary" type="submit" disabled={loading}>
          {loading ? "Logging In..." : "Log In"}
        </Button>
        <div className="d-grid justify-content-end">
          <Button className="text-muted px-0" variant="link" onClick={handleRegisterRedirect}>
            Create an account
          </Button>
        </div>
      </Form>
      <div className="text-center mt-3 text-muted">Golang midterm 2024</div>
    </div>
  );
};

export default Login;
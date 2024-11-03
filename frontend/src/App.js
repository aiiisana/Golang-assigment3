import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import TaskList from "./components/TaskList";
import Profile from "./components/Profile";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users/:userId/tasks" element={<TaskList />} />
        <Route path="/users/:userId/profile" element={<Profile />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
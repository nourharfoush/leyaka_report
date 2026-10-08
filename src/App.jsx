import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import Layout from './Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModuleList from './pages/ModuleList';
import ModuleForm from './pages/ModuleForm';
import PrintView from './pages/PrintView';
import Users from './pages/Users';
function Guard({ children, admin }) {
  const { user } = useStore();
  if (!user) return <Navigate to="/login" />;
  if (admin && user.role !== 'admin') return <Navigate to="/" />;
  return children;
}
export default function App() {
  return (<StoreProvider><BrowserRouter><Routes>
    <Route element={<Layout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Guard><Dashboard /></Guard>} />
      <Route path="/m/:key" element={<Guard><ModuleList /></Guard>} />
      <Route path="/m/:key/add" element={<Guard><ModuleForm /></Guard>} />
      <Route path="/m/:key/edit/:id" element={<Guard><ModuleForm /></Guard>} />
      <Route path="/m/:key/print" element={<Guard><PrintView /></Guard>} />
      <Route path="/users" element={<Guard admin><Users /></Guard>} />
    </Route>
  </Routes></BrowserRouter></StoreProvider>);
}
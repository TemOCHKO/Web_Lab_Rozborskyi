import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import backImage from './assets/image.png';

const TRUE_LOGIN = 'artem3';
const TRUE_PASSWORD = 'artem3';

export default function AuthenticationPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (login.trim() === TRUE_LOGIN && password === TRUE_PASSWORD) {
      setError('');
      document.cookie = 'isAuth=true; path=/; max-age=3600';
      navigate('/weather');
    } else {
      setError('Invalid login or password. Try again.');
    }
  };

  return (
    <div className="auth-container" style={{ backgroundImage: `url(${backImage})` }}>
      <div className="auth-island">
        <h2>Log in to Web App</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input placeholder="Login" value={login} onChange={(e) => setLogin(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required/>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}
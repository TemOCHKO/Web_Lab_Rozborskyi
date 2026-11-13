import { useState } from 'react';
import './App.css';
import backImage from './assets/image.png' 

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Trying to log in:', { email, password });
};

  return (
    <div className="auth-container" 
    style={{ backgroundImage: `url(${backImage})` }}>
      <div className="auth-island">
        <h2>Sign in to Web App</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <input placeholder="Login" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password}onChange={(e) => setPassword(e.target.value)}required />
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}

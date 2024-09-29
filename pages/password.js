// File: pages/password.js
import { useState } from 'react';
import Router from 'next/router';
import styles from '../styles/password.module.css'; // Import the CSS module

const PasswordPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Replace 'your_password' with the actual password
    if (password === 'MyBudgetTracking') {
      // Store the password in localStorage or sessionStorage
      localStorage.setItem('authenticated', 'true');
      Router.push('/'); // Redirect to the main app
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>Enter Password</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p className={styles.error}>{error}</p>} {/* Use the error class */}
    </div>
  );
};

export default PasswordPage;

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './Pages/Main/Main';
import Login from './Pages/Login/Login';
import Weather from './Pages/Weather/weather';
import ShoppingList from './Pages/ShoppingList/ShoppingList';
import RegisterTrip from './Pages/RegistrateTrip/RegistrateTrip';
import UserTrips from './Pages/UserTrips/UserTrips';
import CheckOut from './Pages/CheckOut/CheckOut';
import Webcam from './Pages/SnowCam/webcam';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  // Check localStorage when app loads
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      console.log(storedUser)
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Set user details
      setIsLoggedIn(true);
    }
    
    setLoading(false); // Stop loading once user data is retrieved
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  
    const { username, userId } = userData;  // Extract userId from userData
    localStorage.setItem('user', JSON.stringify({ userId, username }));  // Store userId in localStorage
    console.log(localStorage.getItem('user'))
  };
  

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('user');  // Remove user data from localStorage on logout
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    
    <Router>
      <Routes>
        <Route path="/" element={<Main isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />}/>
        <Route path="/login" element={<Login onLogin={handleLogin} />}/>
        <Route path="/weather" element={<Weather/>}/>
        <Route path="/shoppinglist" element={<ShoppingList/>}/>
        <Route path="/trips" element={<UserTrips/>}/>
        <Route path="/registratetrip" element={<RegisterTrip/>}/>
        <Route path="/snowcam" element={<Webcam/>}/>        
        <Route path="/checkout" element={<CheckOut/>}/>
      </Routes>
    </Router>
  );
}


export default App;

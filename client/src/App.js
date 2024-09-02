import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; 
import './App.css';
import Weather from './Pages/Weather/weather';

function App() {
  return (
    <div className="App">
      <Weather/>
    </div>
  );
}

export default App;

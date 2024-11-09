import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Start from './Components/Start';
import Play from './Components/Play';
import Lobby from './Components/Lobby';
import Finish from './Components/Finish';
import Login from './Components/Login';
import Register from './Components/Register';
import './Styling/App.css';

function App() {
    return (
        <div className="app-container">
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Start />} />
                    <Route path="/start" element={<Start />} />
                    <Route path="/lobby" element={<Lobby />} />
                    <Route path="/play" element={<Play />} />
                    <Route path="/finish" element={<Finish />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;

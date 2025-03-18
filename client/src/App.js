import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPageComponent from "./components/MainPageComponent";
import FileComponent from "./components/FileComponent";
import UserProjectsComponent from "./components/UserProjectsComponent";
import Background from './components/BackgroundComponent';
import UserProfileComponent from './components/UserProfileComponent';
import AlertBox from "./components/AlertBox";
import {AlertProvider, useAlert} from "./services/AlertContext";

const App = () => {
    return (
        <AlertProvider>
            <Router>
                <Background />
                <Routes>
                    <Route path="/" element={<MainPageComponent />} />
                    <Route path="/file" element={<FileComponent />} />
                    <Route path="/projects" element={<UserProjectsComponent />} />
                    <Route path="/profile" element={<UserProfileComponent />} />
                </Routes>
            </Router>
        </AlertProvider>
    );
}

export default App;

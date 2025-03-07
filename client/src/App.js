import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPageComponent from "./components/MainPageComponent";
import FileComponent from "./components/FileComponent";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPageComponent />} />
                <Route path="/file" element={<FileComponent />} />
            </Routes>
        </Router>
    );
}

export default App;

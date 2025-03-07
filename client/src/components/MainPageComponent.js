import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "../css/MainPageComponent.css";

const MainPageComponent = () => {
    const navigate = useNavigate();
    const [repoLink, setRepoLink] = useState(""); // Состояние для ссылки из инпута
    const [error, setError] = useState(""); // Состояние для ошибок

    const fetchFiles = async () => {
        try {
            if (!repoLink) {
                setError("Please enter a valid repository link.");
                return;
            }
            setError("");

            const apiUrl = repoLink.replace("https://github.com", "https://api.github.com/repos") + "/contents";
            const response = await fetch(apiUrl);

            if (response.ok) {
                const files = await response.json();
                const mdFiles = files.filter((file) => file.name.endsWith(".md"));

                if (mdFiles.length === 0) {
                    setError("No Markdown files found in the repository.");
                    return;
                }

                const mdFile = mdFiles[0];
                const fileResponse = await fetch(mdFile.download_url);
                const fileContent = await fileResponse.text();
                navigate("/file", { state: { content: fileContent } });
            } else {
                setError("Failed to fetch repository contents. Please check the URL.");
            }
        } catch (err) {
            setError("An error occurred while fetching the files.");
            console.error(err);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const fileContent = reader.result;
                navigate("/file", { state: { content: fileContent } });
            };
            reader.readAsText(file);
        }
    };

    return (
        <div>
            <header className="header">
                <div>
                    <button className="headerbutton" id="login">
                        Login
                    </button>
                    <button className="headerbutton" id="register">
                        Register
                    </button>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <div className="linkblock">
                        <div className="pastelinkarea">
                            {error && <p style={{ color: "red" }}>{error}</p>}
                            <input
                                type="text"
                                id="repo-link"
                                value={repoLink}
                                onChange={(e) => {setRepoLink(e.target.value); setError("")}} // Сохраняем введённую ссылку
                                placeholder="Paste your repo link..."
                            />
                        </div>
                        <div className="readmdbutton">
                            <button id="readmdbutton" onClick={fetchFiles}>READ MD</button>
                        </div>
                    </div>
                    <p>OR</p>
                    <div className="uploadmdbutton">
                        {/* Привязываем input file к кнопке */}
                        <button
                            id="uploadmdbutton"
                            onClick={() => document.getElementById("file-input").click()}
                        >
                            UPLOAD MD
                        </button>
                        <input
                            type="file"
                            id="file-input"
                            style={{ display: "none" }}
                            accept=".md"
                            onChange={handleFileUpload}
                        />
                    </div>
                </div>
            </main>

            <footer className="footer">
                <p>&copy; All rights reserved</p>
            </footer>
        </div>
    );
};

export default MainPageComponent;

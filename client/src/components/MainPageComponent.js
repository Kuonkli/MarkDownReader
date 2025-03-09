import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MainPageComponent.css";

const MainPageComponent = () => {
    const navigate = useNavigate();
    const [repoLink, setRepoLink] = useState(""); // Ссылка на репозиторий
    const [error, setError] = useState(""); // Ошибки

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

                const contents = await Promise.all(
                    mdFiles.map(async (mdFile) => {
                        const fileResponse = await fetch(mdFile.download_url);
                        const fileContent = await fileResponse.text();
                        return { name: mdFile.name, content: fileContent };
                    })
                );

                navigate("/file", { state: { files: contents } }); // Передаём массив файлов
            } else {
                setError("Failed to fetch repository contents. Please check the URL.");
            }
        } catch (err) {
            setError("An error occurred while fetching the files.");
            console.error(err);
        }
    };

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files); // Получаем список загруженных файлов
        if (files.length > 0) {
            const readerPromises = files.map((file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve({ name: file.name, content: reader.result });
                    };
                    reader.readAsText(file);
                });
            });

            Promise.all(readerPromises).then((contents) => {
                navigate("/file", { state: { files: contents } });
            });
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
                                onChange={(e) => {
                                    setRepoLink(e.target.value);
                                    setError("");
                                }}
                                placeholder="Paste your repo link..."
                            />
                        </div>
                        <div className="readmdbutton">
                            <button id="readmdbutton" onClick={fetchFiles}>
                                READ MD
                            </button>
                        </div>
                    </div>
                    <p>OR</p>
                    <div className="uploadmdbutton">
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
                            multiple // Позволяем выбирать несколько файлов
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

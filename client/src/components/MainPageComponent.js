import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/MainPageStyles.css";

const MainPageComponent = () => {
    const navigate = useNavigate();
    const [repoLink, setRepoLink] = useState("");
    const [error, setError] = useState("");

    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickname, setNickname] = useState("");
    const [authError, setAuthError] = useState("");
    const [AuthVisibility, setAuthVisibility] = useState(false);

    const toggleForm = () => {
        setIsLogin(!isLogin);
        setEmail("");
        setPassword("");
        setNickname("");
        setAuthError("");
    };

    const toggleAuthVisibility = (isAuthorization) => {
        setIsLogin(isAuthorization);
        setAuthVisibility(!AuthVisibility);
        setEmail("");
        setPassword("");
        setNickname("");
        setAuthError("");
    }

    const handleAuthSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = isLogin
                ? await fetch("http://localhost:8080/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                })
                : await fetch("http://localhost:8080/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ nickname, email, password }),
                });

            if (response.ok) {
                const accessToken = response.headers.get("Authorization")?.split(" ")[1];
                const refreshToken = response.headers.get("x-refresh-token");

                if (accessToken && refreshToken) {
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", refreshToken);

                    navigate("/projects"); // Перенаправление после успешного входа
                } else {
                    throw new Error("Token not provided");
                }
            } else {
                const errorData = await response.json();
                setAuthError(errorData.error || "An error occurred");
            }
        } catch (err) {
            console.error(err);
            setAuthError("An error occurred while processing your request.");
        }
    };

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
        <div className="container">
            <header className="main-page-header">
                    <button
                        className="header-button"
                        id="login"
                        onClick={() => toggleAuthVisibility(true)}>
                        login
                    </button>
                    <button
                        className="header-button"
                        id="register"
                        onClick={() => toggleAuthVisibility(false)}>
                        register
                    </button>
            </header>

            <main className="main">
                {AuthVisibility ?
                    (
                        <div id={"auth-overlay"} className={"auth-overlay"} onClick={(e) => {
                            if (e.target === document.getElementById("auth-overlay")) {
                                setAuthVisibility(false);
                            }
                        }}>
                            <div className="auth-container">
                                <h2>{isLogin ? "auth" : "registration"}</h2>
                                {authError && <p className={"error-message"}>{authError}</p>}
                                <form onSubmit={handleAuthSubmit}>
                                    {!isLogin && (
                                        <>
                                            <div className="form-group">
                                                <label htmlFor="nickname">nickname:</label>
                                                <input
                                                    type="text"
                                                    id="nickname"
                                                    name="nickname"
                                                    value={nickname}
                                                    onChange={(e) => setNickname(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="form-group">
                                        <label htmlFor="email">email:</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">password:</label>
                                        <input
                                            type="password"
                                            id="password"
                                            name="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button className="auth-button" type="submit">
                                        {isLogin ? "login" : "register"}
                                    </button>
                                    <p onClick={toggleForm} className="toggle-link">
                                        {isLogin ? 'has no account yet? register' : 'already registered? login'}
                                    </p>
                                </form>
                            </div>
                        </div>
                    ) : null
                }

                        <h1>.md reader</h1>
                        <div className="pastelinkarea">
                            {error && <p style={{color: "red"}}>{error}</p>}
                            <input
                                type="text"
                                id="repo-link"
                                value={repoLink}
                                onChange={(e) => {
                                    setRepoLink(e.target.value);
                                    setError("");
                                }}
                                placeholder="paste your repo link..."
                            />
                        </div>
                        <div className="ButtonGroup">
                            <div className="read-md-button">
                                <button id="read-md-button" onClick={fetchFiles}>
                                    read .md
                                </button>
                            </div>
                            <div className="upload-md-button">
                            <button
                                id="upload-md-button"
                                onClick={() => document.getElementById("file-input").click()}
                            >
                                upload file
                            </button>
                            <input
                                type="file"
                                id="file-input"
                                style={{display: "none"}}
                                accept=".md"
                                multiple // Позволяем выбирать несколько файлов
                                onChange={handleFileUpload}
                            />
                            </div>
                        </div>
            </main>
        </div>
    );
};

export default MainPageComponent;

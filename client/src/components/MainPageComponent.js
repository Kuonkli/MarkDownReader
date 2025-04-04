import React, {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { useAlert } from "../services/AlertContext";
import "../css/MainPageStyles.css";
import axios from "axios";

const MainPageComponent = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [repoLink, setRepoLink] = useState("");
    let [error, setError] = useState("");
    const { showAlert } = useAlert();

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

    useEffect(() => {
        if (localStorage.getItem('accessToken')) {
            navigate("/projects");
        }
        if (location.state?.error) {
            const { status, message } = location.state.error;
            showAlert(status, message);
            navigate(location.pathname, { state: {}});
        }
    }, [navigate]);

    const handleAuthSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = isLogin
                ? await axios.post("http://localhost:8080/login", { email, password }, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                : await axios.post("http://localhost:8080/signup", { nickname, email, password }, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            console.log(response.data)
            const accessToken = response.headers.get("Authorization")?.split(" ")[1];
            const refreshToken = response.headers.get("X-Refresh-Token");
            if (accessToken && refreshToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("refreshToken", refreshToken);
                showAlert(response.status, response.data.message);
                navigate("/projects");
            } else {
                throw Error("Request Failed with status code 500")
            }
        } catch (error) {
            if (error.status === 400) {
                showAlert(
                    error.response?.status || 500,
                    error.response.data?.error || "Undefined error occurred"
                );
            } else {
                showAlert(
                    error.response?.status || 500,
                    error.response?.message || "Undefined error occurred"
                );
            }
        }
    };

    const fetchFiles = async () => {
        try {
            if (!repoLink) {
                showAlert(400, "Please enter a valid repository link.")
                return;
            }

            const apiUrl = repoLink.replace("https://github.com", "https://api.github.com/repos") + "/contents";
            const response = await fetch(apiUrl);

            if (response.ok) {
                const files = await response.json();
                const mdFiles = files.filter((file) => file.name.endsWith(".md"));

                if (mdFiles.length === 0) {
                    showAlert(103, "No Markdown files found in the repository.")
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
                showAlert(response.status, "Failed to fetch repository contents. Please check the URL.");
            }
        } catch (err) {
            showAlert(500, "An error occurred while fetching the files.");
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
                        <div className={"auth-window"}>
                            <div id={"auth-overlay"}  className={"auth-overlay"} onClick={(e) => {
                                if (e.target === document.getElementById("auth-overlay")) {
                                    setAuthVisibility(false);
                                }
                            }}/>
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

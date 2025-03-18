import React, {useState, useEffect, useCallback} from "react";
import "../css/UserProjectsStyles.css";
import {Link, useNavigate} from "react-router-dom";
import AuthService from "../services/AuthService";
import ProfileIcon from "../assets/images/user-icon.png";
import FileIcon from "../assets/images/file-icon.png";
import { useAlert } from "../services/AlertContext";

const UserProjectsComponent = (callback, deps) => {
    const [repoLink, setRepoLink] = useState("");
    const [error, setError] = useState("");
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
    const { showAlert } = useAlert();

    const fetchProjects = useCallback(async (url) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log("Server response:", response);

            const result = await response.json()
            if (response.ok) {
                setProjects(result.files);
            } else if (response.status === 401) {
                await AuthService.refreshToken();
                return fetchProjects(url)
            } else {
                showAlert(response.status, response);
                throw new Error("Invalid response data format");
            }
        } catch (error) {
            console.error("Error while fetching projects:", error);
            await AuthService.refreshToken();
        }
    }, [])

    const handleFileUpload = (event) => {
        const files = Array.from(event.target.files);
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

    useEffect(() => {
        const apiUrl = "http://localhost:8080/api/get/files";
        fetchProjects(apiUrl).catch((err) => {console.error(err)});
    }, [fetchProjects]);

    const fetchFiles = async () => {
        try {
            if (!repoLink) {
                showAlert(400, "Please enter a valid repository link.")
                return;
            }
            setError("");

            const apiUrl = repoLink.replace("https://github.com", "https://api.github.com/repos") + "/contents";
            const response = await fetch(apiUrl);

            if (response.ok) {
                const files = await response.json();
                const mdFiles = files.filter((file) => file.name.endsWith(".md"));

                if (mdFiles.length === 0) {
                    showAlert(0, "No Markdown files found in the repository.")
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

    const handleFileOpen = async (file) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:8080/api/${file.FileURL}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log("Server response:", response);
            if (response.ok) {
                const markdownContent = await response.text();
                const contents = [{ name: file.Filename, content: markdownContent }]
                navigate("/file", { state : { files: contents } });
            } else if (response.status === 401) {
                await AuthService.refreshToken();
                return handleFileOpen(file)
            } else {
                showAlert(401, "Invalid response data format")
                throw new Error("Invalid response data format");
            }

        } catch (error) {
            console.error("Error while fetching projects:", error);
            await AuthService.refreshToken();
        }
    }

    return (
        <div>
            <header className="projects-header">
                <div className="file-actions">
                    <div className="link-row">
                        <input
                            type="text"
                            id="projects-repo-link"
                            value={repoLink}
                            onChange={(e) => {
                                setRepoLink(e.target.value);
                                setError("");
                            }}
                            placeholder="Paste your repo link..."
                        />
                        <button id="projects-read-md-button" onClick={fetchFiles}>
                            READ MD
                        </button>
                        <div className="projects-upload-md-button">
                            <button
                                id="projects-upload-md-button"
                                onClick={() => document.getElementById("renamed-file-input").click()}
                            >
                                UPLOAD MD
                            </button>
                            <input
                                type="file"
                                id="renamed-file-input"
                                style={{ display: "none" }}
                                accept=".md"
                                multiple
                                onChange={handleFileUpload}
                            />
                        </div>
                    </div>
                    <div>
                        <Link to={`/profile`}>
                            <svg
                                className="profile-link"
                                width="120"
                                height="120"
                                viewBox="0 0 120 120"
                                xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="circle-shadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="rgba(141, 56, 255, 0.2)"/>
                                    </filter>
                                </defs>

                                <circle
                                    cx="60"
                                    cy="60"
                                    r="50"
                                    fill="url(#iconImage)"
                                    className="circle-element"
                                />

                                <defs>
                                    <pattern id="iconImage" patternUnits="objectBoundingBox" width="1" height="1">
                                        <image href={ProfileIcon} x="0" y="0" width="100" height="100"
                                               preserveAspectRatio="xMidYMid slice"/>
                                    </pattern>
                                </defs>
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>
            <div className={"projects-container"}>
                <div className="projects-grid">
                    {projects.length > 0 ? (
                        projects.map((project, index) => (
                            <div key={index} className="project-card">
                                <div>
                                    <img className={"projects-file-icons"} src={FileIcon} alt={"file-icon" + index.toString()}/>
                                </div>
                                <h3 title={project.Filename}>{project.Filename.length > 15 ? (project.Filename.slice(0, 15) + "...") : (project.Filename)}</h3>
                                <p>{new Date(project.CreatedAt).toISOString().slice(0, 10)}</p>
                                <button className={"projects-file-buttons"} onClick={() => handleFileOpen(project)}>Open</button>
                            </div>
                        ))
                    ) : (
                        <p>loading projects...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProjectsComponent;

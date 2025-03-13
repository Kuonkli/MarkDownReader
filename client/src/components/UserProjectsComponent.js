import React, {useState, useEffect, useCallback} from "react";
import "../css/UserProjectsStyles.css";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/AuthService";

const UserProjectsComponent = (callback, deps) => {
    const [repoLink, setRepoLink] = useState("");
    const [error, setError] = useState("");
    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();
/*
    const fetchProjects = useCallback(async (url) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log("Server response:", response);

            if (response.ok) {
                const files = await response.json();
                console.log(files);
                setProjects(files.files);
                console.log(projects)
            } else if (response.status === 401) {
                await AuthService.refreshToken();
                return fetchProjects(url)
            } else {
                throw new Error("Invalid response data format");
            }
        } catch (error) {
            console.error("Error while fetching projects:", error);
        }
    }, [])*/

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

    /*useEffect(() => {
        const apiUrl = "http://localhost:8080/api/get/files";
        fetchProjects(apiUrl).catch((err) => {console.error(err)});
    }, [fetchProjects]);*/

    useEffect(() => {
        /*
        const apiUrl = "http://localhost:8080/api/get/files";
        fetchProjects(apiUrl).catch((err) => {console.error(err)});
         */
        setProjects([
            {
                "ID": 25,
                "CreatedAt": "2025-03-07T16:50:20.562503+03:00",
                "UpdatedAt": "2025-03-07T16:50:20.562503+03:00",
                "DeletedAt": null,
                "Filename": "mdproject_1_1741355420559925557",
                "FileURL": "markdown-storage/mdproject_1_1741355420561454336.md",
                "UserID": 1
            },
            {
                "ID": 26,
                "CreatedAt": "2025-03-07T16:50:48.243495+03:00",
                "UpdatedAt": "2025-03-07T16:50:48.243495+03:00",
                "DeletedAt": null,
                "Filename": "test",
                "FileURL": "markdown-storage/mdproject_1_1741355448240568783.md",
                "UserID": 1
            },
            {
                "ID": 24,
                "CreatedAt": "2025-03-07T16:50:05.662884+03:00",
                "UpdatedAt": "2025-03-07T21:03:51.652359+03:00",
                "DeletedAt": null,
                "Filename": "test123",
                "FileURL": "markdown-storage/mdproject_1_1741355405661926108.md",
                "UserID": 1
            },
            {
                "ID": 27,
                "CreatedAt": "2025-03-11T16:20:33.41293+03:00",
                "UpdatedAt": "2025-03-11T16:20:33.41293+03:00",
                "DeletedAt": null,
                "Filename": "mdproject_1_1741699233390040901",
                "FileURL": "markdown-storage/mdproject_1_1741699233407028470.md",
                "UserID": 1
            }
        ])
    }, []);

    const fetchFiles = () => {
        if (!repoLink) {
            setError("Please enter a valid repository link.");
            return;
        }
        setError("");
        console.log("Fetching files from:", repoLink);
    };

    return (
        <div>
            <header className="projects-header">
                <div className="file-actions">
                    <input
                        type="text"
                        id="projects-repo-link"
                        value={repoLink}
                        onChange={(e) => {
                            setRepoLink(e.target.value);
                            setError("");
                        }}
                        placeholder="paste your repo link..."
                    />
                    <button id="projects-read-md-button" onClick={fetchFiles}>
                        read .md
                    </button>
                    <div className="projects-upload-md-button">
                        <button
                            id="projects-upload-md-button"
                            onClick={() => document.getElementById("renamed-file-input").click()}
                        >
                            upload file
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
            </header>
            <div className={"projects-container"}>
                <div className="projects-grid">
                    {projects.length > 0 ? (
                        projects.map((project, index) => (
                            <div key={index} className="project-card">
                                <h3>{project.Filename}</h3>
                                <p>{new Date(project.CreatedAt).toISOString().slice(0, 10)}</p>
                            </div>
                        ))
                    ) : (
                        <p>loading projects...
                            {error && <p style={{color: "red"}}>{error}</p>}
                        </p>

                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProjectsComponent;

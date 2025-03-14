import React, { useState, useEffect } from "react";
import {useLocation, useNavigate} from "react-router-dom";
import { marked } from "marked";
import "../css/FilePageStyles.css";
import SaveIcon from "../assets/images/save-file-icon.png"
import DownloadIcon from "../assets/images/download-file-icon.png"
import AuthService from "../services/AuthService";

const FileComponent = () => {
    const [files, setFiles] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        marked.setOptions({
            gfm: true,
            breaks: true,
            walkTokens: (token) => {
                /*
                if (token.type === 'blockquote') {
                    console.log(token);
                }*/
                if (token.raw === '[!CAUTION]' && token.type === 'text') {
                    token.text = 'CAUTION';
                }
                if (token.raw === '[!IMPORTANT]' && token.type === 'text') {
                    token.text = 'IMPORTANT';
                }
                if (token.raw === '[!NOTE]' && token.type === 'text') {
                    token.text = 'NOTE';
                }
            },
        })
        if (location.state && location.state.files) {
            const filesWithHtml = location.state.files.map((file) => ({
                name: file.name,
                html: marked(file.content),
                md: file.content
            }));
            setFiles(filesWithHtml);
        } else {
            console.error("No files found");
        }
    }, [location.state]);

    // Обработчик для загрузки файла
    const handleDownloadFile = (file) => {
        const blob = new Blob([file.md], { type: "text/plain" }); // Создаём Blob-объект с содержимым файла
        const url = URL.createObjectURL(blob); // Генерируем временный URL для Blob
        const link = document.createElement("a"); // Создаём временный элемент <a>
        link.href = url;
        link.download = file.name; // Указываем имя загружаемого файла
        document.body.appendChild(link);
        link.click(); // Запускаем скачивание
        document.body.removeChild(link); // Удаляем временный элемент
        URL.revokeObjectURL(url); // Очищаем сгенерированный URL
    };

    const handleSaveFile = async (file) => {
        try {
            const accessToken = localStorage.getItem('accessToken');

            // Создаём FormData для отправки файла и других данных
            const formData = new FormData();
            formData.append('file', new Blob([file.md], { type: 'text/markdown' }), file.name); // Добавляем файл
            formData.append('filename', file.name);

            const response = await fetch(`http://localhost:8080/api/add/file`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            console.log("Server response:", response);

            if (response.ok) {
                const result = await response.json();
                console.log("File saved successfully:", result);
            } else if (response.status === 401) {
                await AuthService.refreshToken();
                return handleSaveFile(file);
            } else {
                console.error(`Error saving file: ${response.status} - ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error while saving file:", error);
        }
    };


    return (
        <div>
            {files.map((file, index) => (
                <div className="file-container">
                    <div className="file-name-block">
                        <p className={"navigate-back-button"} onClick={() => {navigate("/projects")}}>Back</p>
                        <h3 className={"file-name"} key={index}>{file.name}</h3>
                        <div className={"file-save-actions"}>
                            <button onClick={() => {handleSaveFile(file).catch(error => {console.log(error)})}}>
                                Save <img
                                    key={index}
                                    className={"save-actions-icons"}
                                    src={SaveIcon}
                                    alt={"save-icon" + index.toString()}
                                />
                            </button>
                            <button onClick={() => {handleDownloadFile(file)}}>
                                 Download <img
                                    key={index}
                                    className={"save-actions-icons"}
                                    src={DownloadIcon}
                                    alt={"download-icon" + index.toString()}
                                />
                            </button>
                        </div>
                    </div>
                    <div key={index} className="markdown-box">
                        <div className={"file-content"} dangerouslySetInnerHTML={{__html: file.html}}/>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FileComponent;

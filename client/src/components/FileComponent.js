import React, {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {marked} from "marked";
import "../css/FilePageStyles.css";
import SaveIcon from "../assets/images/save-file-icon.png"
import DownloadIcon from "../assets/images/download-file-icon.png"
import EditIcon from "../assets/images/edit-filname-icon.png"
import TickIcon from "../assets/images/tick-icon.png"
import AuthService from "../services/AuthService";
import {useAlert} from "../services/AlertContext";
import axios from "axios";

const FileComponent = () => {
    const [files, setFiles] = useState([]);
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [isLogin, setIsLogin] = useState(false)
    const location = useLocation();
    const navigate = useNavigate();
    const { showAlert } = useAlert();


    useEffect(() => {
        marked.setOptions({
            gfm: true,
            breaks: true,
            walkTokens: (token) => {
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
            showAlert(500, "No files found")
            console.error("No files found");
        }

        verification()

    }, [location.state]);

    const verification = () => {
        const accessToken = localStorage.getItem('accessToken');
        axios.get(`http://localhost:8080/api/verify`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => {
            if (res.status === 200) {
                setIsLogin(true)
            }
        }).catch(error => {
            if (error.response?.status === 401) {
                AuthService.refreshToken().then(() => {
                    verification()
                }).catch(() => {
                    setIsLogin(false)
                });
            } else {
                setIsLogin(false)
            }
        })
    }

    // Обработчик для загрузки файла
    const handleDownloadFile = (file) => {
        const blob = new Blob([file.md], { type: "text/plain" }); // Создаём Blob-объект с содержимым файла
        const url = URL.createObjectURL(blob); // Генерируем временный URL для Blob
        const link = document.createElement("a"); // Создаём временный элемент <a>
        link.href = url;
        link.download = file.name.endsWith(".md") ? (file.name) : "md_project.md"; // Указываем имя загружаемого файла
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
            formData.append('file', new Blob([file.md], { type: 'text/markdown' }));
            formData.append('filename', file.name);

            // Отправляем запрос с FormData
            const response = await axios.post(`http://localhost:8080/api/add/file`, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            console.log("Server response:", response);
            showAlert(response.status, response.data.message);
            navigate(`/projects/${response.data.file.ID}`, { replace: true });

        } catch (error) {
            console.error("Ошибка при запросе:", error);

            if (error.status === 401) {
                try {
                    await AuthService.refreshToken();
                    await handleSaveFile(file);
                } catch (refreshError) {
                    console.error("Ошибка при обновлении токена:", refreshError);

                    navigate("/", {
                        state: {
                            error: {
                                status: refreshError.status || 500,
                                message: refreshError.message || "Authorization error",
                            },
                        },
                    });
                }
            } else {
                showAlert(
                    error.status || 500,
                    error.message || "Undefined error occurred"
                );
            }
        }
    };

    return (
        <div>
            {files.map((file, index) => (
                <div className="file-container">
                    <div className="file-header-block">
                        { index === 0 ? (<button className={"navigate-back-button"} onClick={() => {navigate(-1)}}>Back</button>) : null}
                        <div className={"file-name-container"}>
                            <input
                                className={"file-name"}
                                key={index}
                                value={file.name}
                                readOnly={isReadOnly}
                                onChange={(e) => {
                                    setFiles((prevFiles) => {
                                        const updatedFiles = [...prevFiles];
                                        updatedFiles[index].name = e.target.value;
                                        return updatedFiles;
                                    })
                                }}
                                placeholder={"automatically generate"}
                            />
                            <button className={"edit-filename-button"} onClick={() => {setIsReadOnly(!isReadOnly)}}>
                                {isReadOnly ? (
                                    <img key={index} className={"edit-filename-image"} src={EditIcon} alt={"edit"}/>
                                ) : (
                                    <img key={index} className={"edit-filename-image"} src={TickIcon} alt={"edit"}/>
                                )}
                            </button>
                        </div>

                        <div className={"file-save-actions"}>
                            {isLogin ? (
                                <button onClick={() => {
                                    handleSaveFile(file).catch(error => {
                                        console.log(error)
                                    })
                                }}>
                                    <span>Save</span> 
                                    <img
                                        key={index}
                                        className={"save-actions-icons"}
                                        src={SaveIcon}
                                        alt={"save-icon" + index.toString()}
                                />
                                </button>
                            ) : null}
                            <button onClick={() => {
                                handleDownloadFile(file)
                            }}>
                                <span>Download</span>
                                <img
                                    key={index}
                                    className={"save-actions-icons"}
                                    src={DownloadIcon}
                                    alt={"download-icon" + index.toString()}
                                />
                            </button>
                        </div>
                    </div>
                    <div className="file-main-wrapper">
                        <div className="markdown-box">
                            <div
                                className={"file-content"}
                                dangerouslySetInnerHTML={{__html: file.html}}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FileComponent;

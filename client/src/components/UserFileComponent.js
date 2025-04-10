import React, {useEffect, useRef, useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {marked} from "marked";
import {toNumber} from "lodash";
import axios from "axios";
import "../css/FilePageStyles.css";
import SaveIcon from "../assets/images/save-file-icon.png"
import DownloadIcon from "../assets/images/download-file-icon.png"
import EditIcon from "../assets/images/edit-filname-icon.png"
import TickIcon from "../assets/images/tick-icon.png"
import CommentsMenuIcon from "../assets/images/comments-menu-icon.png"
import AddCommentIcon from "../assets/images/add-comment-icon.png"
import CommentsVisibleIcon from "../assets/images/comments-visible-icon.png"
import CommentsInvisibleIcon from "../assets/images/comments-invisible-icon.png"
import SaveCommentsIcon from "../assets/images/save-comments-icon.png"
import AuthService from "../services/AuthService";
import {useAlert} from "../services/AlertContext";
import {apiToClientComment, clientToApiComment} from "../utils/Converters.ts";
import CommentBox from "./CommentComponent";


const UserFileComponent = () => {
    const [file, setFile] = useState({});
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [comments, setComments] = useState([]);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [targetCommentId, setTargetCommentId] = useState(null)
    const [commentsMenuVisibility, setCommentsMenuVisibility] = useState(false);
    const [commentsVisibility, setCommentsVisibility] = useState(false);


    const params = useParams()
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const overlayRef = useRef(null);
    const { search } = useLocation();

    useEffect(() => {
        if (targetCommentId === null) {
            return
        }
        if (comments.length > 0) {
            if (targetCommentId) {
                setCommentsVisibility(true);
                const comment = comments.find(c => toNumber(targetCommentId) === c.id);
                if (comment) {
                    window.scrollTo({
                        top: comment.position.y,
                        behavior: "smooth",
                    })
                    showAlert(100, "Comment was found successfully")
                }
            }
        }
    }, [search, targetCommentId]);

    const handleAddComment =  async () => {
        try {
            const newComment = {
                type: "info",
                title: `Comment ${comments?.length + 1}`,
                content: "",
                position: {x: 20, y: 20 + (comments.length * 60)}
            };
            const accessToken = localStorage.getItem('accessToken');
            const comment = clientToApiComment(newComment)
            console.log(comment)
            const response = await axios.post(`http://localhost:8080/api/add/comment?file_id=${file.id}`, comment, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log("Server response:", response);
            setComments(prev => [...prev, apiToClientComment(response.data.comment)]);
            setCommentsVisibility(true);

        } catch (error) {
            console.error("Error while fetching projects:", error);
            if (error.response?.status === 401) {
                try {
                    await AuthService.refreshToken();
                    await handleAddComment();
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

    const handleDeleteComment = async (commentId) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            await axios.delete(`http://localhost:8080/api/delete/comment?id=${commentId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            setComments(prev => prev.filter(comment => comment.id !== commentId));
        } catch (error) {
            if (error.response?.status === 401) {
                try {
                    await AuthService.refreshToken();
                    await handleDeleteComment(commentId);
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

    const handleEditComment = async (comment) => {
        try {
            comment = clientToApiComment(comment);
            console.log(comment)
            const accessToken = localStorage.getItem('accessToken');
            await axios.put(`http://localhost:8080/api/edit/comment`, comment,  {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            showAlert(200, "comment saved successfully")
        } catch (error) {
            if (error.response?.status === 401) {
                try {
                    await AuthService.refreshToken();
                    await handleEditComment(comment);
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
    }

    const handleTarget = async () => {
        const searchParams = new URLSearchParams(search);
        const commentId = toNumber(searchParams.get('aim'));
        if (commentId !== undefined) {
            setTargetCommentId(commentId)
        }
    }

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
        const fileId = params["id"]

        fetchFile(`http://localhost:8080/api/get/file?file_id=${fileId}`).finally(handleTarget)
    }, []);

    const fetchFile = async (url) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log("Server response:", response);
            const userFile = response.data.file;
            const fileWithHtml = {
                id: userFile.id,
                name: userFile.filename,
                html: marked(userFile.content),
                md: userFile.content
            };
            const comments = userFile.comments
                ? userFile.comments.map(apiToClientComment)
                : [];

            setFile(fileWithHtml);
            setComments(comments);
            console.log(comments)
        } catch (error) {
            console.error("Error while fetching projects:", error);
            if (error.response?.status === 401) {
                try {
                    await AuthService.refreshToken();
                    await fetchFile(url);
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
    }

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
            <div className="file-container">
                <div className="file-header-block">
                    <button className={"navigate-back-button"} onClick={() => {navigate(-1)}}>Back</button>
                    <div className={"file-name-container"}>
                        <input
                            className={"file-name"}
                            value={file.name}
                            readOnly={isReadOnly}
                            onChange={(e) => {
                                setFile((prevFile) => ({
                                    ...prevFile, // Копируем остальные свойства файла
                                    name: e.target.value, // Обновляем имя файла
                                }));
                            }}
                            placeholder={"automatically generate"}
                        />
                        <button className={"edit-filename-button"} onClick={() => {setIsReadOnly(!isReadOnly)}}>
                            {isReadOnly ? (
                                <img className={"edit-filename-image"} src={EditIcon} alt={"edit"}/>
                            ) : (
                                <img className={"edit-filename-image"} src={TickIcon} alt={"edit"}/>
                            )}
                        </button>
                    </div>

                    <div className={"file-save-actions"}>
                        <button onClick={() => {
                            handleSaveFile(file).catch(error => {
                                console.log(error)
                            })
                        }}>
                            Save <img
                            className={"save-actions-icons"}
                            src={SaveIcon}
                            alt={"save-icon"}
                        />
                        </button>
                        <button onClick={() => {
                            handleDownloadFile(file)
                        }}>
                            Download <img
                            className={"save-actions-icons"}
                            src={DownloadIcon}
                            alt={"download-icon"}
                        />
                        </button>
                    </div>
                </div>
                <div className={"file-main-wrapper"}>
                    <div className="markdown-box">
                        <div className={"comments-overlay"} ref={overlayRef}>
                            {commentsVisibility ? (comments.map((comment) => (
                                <CommentBox
                                    key={comment.id}
                                    props={comment}
                                    bounds={overlayRef.current || undefined}
                                    onPositionChange={(newPosition) => {
                                        setComments(prev => prev.map(c =>
                                            c.id === comment.id ? {...c, position: newPosition} : c
                                        ));
                                    }}
                                    onCommentChange={(newComment) => {
                                        setComments(prev => prev.map(c =>
                                            c.id === comment.id ? {...c, ...newComment} : c
                                        ));
                                    }}
                                    onSaveComment={() => handleEditComment(comment)}
                                    onDelete={() => handleDeleteComment(comment.id)}
                                    isActive={comment.id === activeCommentId}
                                    setActive={() => setActiveCommentId(comment.id)}
                                />
                            ))) : null}
                        </div>
                        <div
                            className={"file-content"}
                            dangerouslySetInnerHTML={{__html: file.html}}
                        />
                    </div>
                    <div className={"comments-toolbar"}>
                        <button className={"comment-actions-menu-button"} onClick={() => {setCommentsMenuVisibility(!commentsMenuVisibility)}}>
                            <img src={CommentsMenuIcon} alt={"comment-menu"}/>
                        </button>
                        {commentsMenuVisibility ? (
                            <div className={"comment-actions-menu"}>
                                <button className={"comment-actions-menu-button"} onClick={handleAddComment}>
                                    <img src={AddCommentIcon} alt={"add-comment"}/>
                                </button>
                                <button className={"comment-actions-menu-button"} onClick={() => {
                                    setCommentsVisibility(!commentsVisibility)
                                }}>
                                    {commentsVisibility ? (
                                        <img src={CommentsVisibleIcon} alt={"comments-visible"}/>
                                    ) : (
                                        <img src={CommentsInvisibleIcon} alt={"comments-invisible"}/>
                                    )}

                                </button>
                                <button className={"comment-actions-menu-button"}>
                                    <img src={SaveCommentsIcon} alt={"save-all-comments"}/>
                                </button>
                            </div>
                        ) : null}


                    </div>
                </div>

            </div>
        </div>
    );
};

export default UserFileComponent;

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { marked } from "marked";
import "../css/FileComponent.css"; // Подключаем стили

const FileComponent = () => {
    const [content, setContent] = useState(""); // Состояние для хранения HTML-контента
    const location = useLocation();

    useEffect(() => {
        if (location.state && location.state.content) {
            const htmlContent = marked(location.state.content); // Преобразование Markdown в HTML
            setContent(htmlContent);
        } else {
            console.error("No content found");
        }
    }, [location.state]);

    return (
        <div className="file-container">
            <div
                className="markdown-box"
                dangerouslySetInnerHTML={{ __html: content }} // Вставляем преобразованный HTML
            />
        </div>
    );
};

export default FileComponent;

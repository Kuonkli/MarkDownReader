import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { marked } from "marked";
import "../css/FilePageStyles.css";

const FileComponent = () => {
    const [files, setFiles] = useState([]);
    const location = useLocation();

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
            }));
            setFiles(filesWithHtml);
        } else {
            console.error("No files found");
        }
    }, [location.state]);

    return (
        <div className="file-container">
            {files.map((file, index) => (
                <div>
                    <h3 className={"file-name"}>{file.name}</h3>
                    <div key={index} className="markdown-box">
                        <div dangerouslySetInnerHTML={{__html: file.html}}/>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FileComponent;

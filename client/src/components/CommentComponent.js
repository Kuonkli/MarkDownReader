import React, {useEffect, useRef, useState} from "react";
import Draggable from "react-draggable"
import "../css/CommentStyles.css";
import DeleteIcon from "../assets/images/delete-icon.png"
import InfoCommentIcon from "../assets/images/info-comment-icon.png"
import WarningCommentIcon from "../assets/images/warning-comment-icon.png"
import ErrorCommentIcon from "../assets/images/error-comment-icon.png"

const CommentBox = ({ props, bounds, onPositionChange, onCommentChange, onDelete, onSaveComment, isActive, setActive}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [comment, setComment] = useState(props);
    const nodeRef = useRef(null);
    const dragHandleRef = useRef(null);

    const [dragBounds, setDragBounds] = useState({});

    useEffect(() => {
        if (!bounds || !nodeRef.current) return;

        const updateBounds = () => {
            const parentRect = bounds.getBoundingClientRect();
            const commentRect = nodeRef.current.getBoundingClientRect();

            setDragBounds({
                left: 0,
                right: parentRect.width - commentRect.width,
                top: 0,
                bottom: parentRect.height - commentRect.height
            });
        };

        updateBounds();
        window.addEventListener('resize', updateBounds);

        return () => window.removeEventListener('resize', updateBounds);
    }, [bounds]);


    const toggleExpand = () => {
        setIsExpanded((prev) => !prev);
    };

    const handleChange = (updates) => {
        const newComment = { ...comment, ...updates };
        setComment(newComment);
        onCommentChange && onCommentChange(newComment);
    };

    const handleDrag = (e, data) => {
        const newPosition = {x: data.x, y: data.y};
        setComment(prev => ({
            ...prev,
            position: newPosition
        }));
        onPositionChange && onPositionChange(newPosition);
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            handle=".drag-handle"
            bounds={dragBounds}
            position={comment.position}
            onStop={handleDrag}
            onStart={setActive}
        >
            <div
                className={`comment-box ${comment.type} ${isActive ? 'active' : ''}`}
                ref={nodeRef}
                onClick={() => {setActive()}}
            >
                <div className="comment-box-header">
                    <button onClick={toggleExpand} className="toggle-button">
                        {isExpanded ? "▲" : "▼"}
                    </button>
                    <input
                        className={`comment-title ${comment.type}`}
                        value={comment.title}
                        onChange={(e) => handleChange({title: e.target.value})}
                    />
                    <div className={"type-icon-block"}>
                        {comment.type === 'info' ? (
                            <img src={InfoCommentIcon} alt={"info"}/>
                        ) : (comment.type === 'warning' ? (
                            <img src={WarningCommentIcon} alt={"warning"}/>
                        ) : (
                            <img src={ErrorCommentIcon} alt={"error"}/>
                        ))}
                    </div>
                    <div className="drag-handle" ref={dragHandleRef}>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="drag-dots"
                        >
                            <circle cx="5" cy="5" r="2"/>
                            <circle cx="12" cy="5" r="2"/>
                            <circle cx="5" cy="12" r="2"/>
                            <circle cx="12" cy="12" r="2"/>
                            <circle cx="5" cy="19" r="2"/>
                            <circle cx="12" cy="19" r="2"/>

                        </svg>
                    </div>
                </div>
                {isExpanded && (
                    <div className="expanded-content">
                        <div className="comment-type-selector">
                            <span>Type: </span>
                            <select
                                value={comment.type}
                                onChange={(e) => handleChange({type: e.target.value})}
                                className="type-select"
                            >
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                            </select>
                        </div>
                        <textarea
                            value={comment.content}
                            onChange={(e) => handleChange({content: e.target.value})}
                            placeholder={"enter comment..."}
                            className="comment-textarea"
                        />
                        <div className={"comment-save-delete-block"}>
                            <button className="save-comment-button" onClick={() => {
                                onSaveComment && onSaveComment()
                            }}>
                                Save
                            </button>
                            <button className={"delete-comment-button"} onClick={() => {
                                onDelete && onDelete()
                            }}>
                                <img src={DeleteIcon} alt={"delete"}/>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Draggable>
    );
};

export default CommentBox;
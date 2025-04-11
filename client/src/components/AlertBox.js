import "../css/AlertBoxStyles.css";
import SuccessIcon from "../assets/images/alert-success-icon.png";
import ErrorIcon from "../assets/images/alert-error-icon.png";
import DefaultIcon from "../assets/images/alert-default-icon.png";
import DialogIcon from "../assets/images/dialog-icon.png";
import { useState } from "react";

const AlertBox = ({ status, message }) => {
    const getStatusClass = () => {
        if (status >= 200 && status < 300) {
            return "alert-success";
        } else if (status >= 400) {
            return "alert-error";
        } else {
            return "alert-default";
        }
    };

    return (
        <div className={`alert-container ${getStatusClass()}`}>
            <span className="alert-message">{message}</span>
            {getStatusClass() === "alert-success" ? (
                <img src={SuccessIcon} alt={"success"} />
            ) : getStatusClass() === "alert-error" ? (
                <img src={ErrorIcon} alt={"error"} />
            ) : (
                <img src={DefaultIcon} alt={"note"} />
            )}
        </div>
    );
};

const AlertDialog = ({
                         message,
                         onConfirm,
                         onCancel,
                         confirmText = "Yes",
                         cancelText = "No",
                     }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleConfirm = () => {
        setIsOpen(false);
        onConfirm && onConfirm();
    };

    const handleCancel = () => {
        setIsOpen(false);
        onCancel && onCancel();
    };

    if (!isOpen) return null;

    return (
        <div className={`dialog-container`}>
            <div className="dialog-content">
                <span className="dialog-message">{message}</span>
                <img src={DialogIcon} alt={"dialog"}/>
            </div>
            <div className="dialog-actions">
                <button className="dialog-confirm" onClick={handleConfirm}>
                    {confirmText}
                </button>
                <button className="dialog-cancel" onClick={handleCancel}>
                    {cancelText}
                </button>
            </div>
        </div>
    );
};

export {AlertBox, AlertDialog};
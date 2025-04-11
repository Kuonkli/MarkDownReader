import React, { createContext, useState, useContext } from "react";
import { AlertBox, AlertDialog } from "../components/AlertBox";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alert, setAlert] = useState({
        status: "",
        message: "",
        visible: false
    });

    const [dialog, setDialog] = useState({
        visible: false,
        message: "",
        confirmText: "Yes",
        cancelText: "No",
        onConfirm: null,
        onCancel: null
    });

    const showAlert = (status, message) => {
        setAlert({ status, message, visible: true });
        setTimeout(() => {
            setAlert({status: "", message: "", visible: false});
        }, 3000);
    };

    const showDialog = (options, onConfirm, onCancel) => {
        setDialog({
            visible: true,
            message: options.message,
            confirmText: options.confirmText || "Yes",
            cancelText: options.cancelText || "No",
            onConfirm,
            onCancel
        });
    };

    const hideDialog = () => {
        setDialog({
            visible: false,
            message: "",
            confirmText: "Yes",
            cancelText: "No",
            onConfirm: null,
            onCancel: null
        });
    };

    const handleConfirm = () => {
        dialog.onConfirm?.();
        hideDialog();
    };

    const handleCancel = () => {
        dialog.onCancel?.();
        hideDialog();
    };

    return (
        <AlertContext.Provider value={{
            alert,
            showAlert,
            showDialog
        }}>
            {children}
            {alert.visible && <AlertBox status={alert.status} message={alert.message} />}

            {dialog.visible && (
                <AlertDialog
                    message={dialog.message}
                    confirmText={dialog.confirmText}
                    cancelText={dialog.cancelText}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                />
            )}
        </AlertContext.Provider>
    );
};
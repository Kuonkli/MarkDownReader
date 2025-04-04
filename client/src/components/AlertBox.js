import "../css/AlertBoxStyles.css"
import SuccessIcon from "../assets/images/alert-success-icon.png"
import ErrorIcon from "../assets/images/alert-error-icon.png"
import DefaultIcon from "../assets/images/alert-default-icon.png"

const AlertBox = ({status, message}) => {
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
            {getStatusClass() === "alert-success" ?
                (<img src={SuccessIcon} alt={"success"}/>) : (getStatusClass() === "alert-error" ?
                    (<img src={ErrorIcon} alt={"error"}/>) :
                    (<img src={DefaultIcon} alt={"note"}/>))}
        </div>
    );
};

export default AlertBox;

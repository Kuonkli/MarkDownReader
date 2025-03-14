import React, {useState, useEffect, useCallback} from "react";
import "../css/UserProfileStyles.css";
import { useNavigate } from "react-router-dom";

const UserProfileComponent = () => {
    return (
        <div className="container">
            <div className="UserCard">
                <div className="UserName">
                    John Doe
                </div>
                <div className="UserEmail">
                    johndoe@example.com
                </div>
                <div className="UserDateCreate">
                    09.11.2011
                </div>
                <button className="logoutButton">
                    logout
                </button>
            </div>
        </div>
    );
}
export default UserProfileComponent;
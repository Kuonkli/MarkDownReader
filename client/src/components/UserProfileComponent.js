import React, {useState, useEffect, useCallback} from "react";
import "../css/UserProfileStyles.css";
import { useNavigate } from "react-router-dom";

const UserProfileComponent = () => {
    const navigate = useNavigate();
    const handleLogout = async (event) => {
        navigate("/");
    }




    return (
        <div className="containerUserProfile">
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
                <button className="logoutButton" onClick={handleLogout}>
                    logout
                </button>
            </div>
        </div>
    );
}
export default UserProfileComponent;
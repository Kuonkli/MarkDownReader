import React from "react";
import "../css/Preloader.css";

const Preloader = () => {
    return (
        <div className="preloader">
            <svg
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
                className="spinner"
            >
                <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="#8d38ff"
                    strokeWidth="5"
                    strokeDasharray="125"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

export default Preloader;

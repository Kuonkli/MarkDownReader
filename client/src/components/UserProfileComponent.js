import {useEffect, useState} from 'react'
import EmailIcon from '../assets/images/email-icon.png'
import ProfileIcon from '../assets/images/user-icon.png'
import PasswordIcon from '../assets/images/password-icon.png'
import CalendarIcon from '../assets/images/calendar-icon.png'
import '../css/UserProfileStyles.css'
import {useNavigate} from "react-router-dom";
import { useAlert } from '../services/AlertContext';
import AuthService from "../services/AuthService";
import axios from "axios";


const UserProfile = () => {
    const [userData, setUserData] = useState({
        Nickname: 'JohnDoe',
        Email: 'john.doe@example.com',
        Password: '••••••••',
        CreatedAt: '30.02.2077'
    })
    const navigate = useNavigate()
    const showAlert = useAlert();

    const fetchProfile = async (url) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            console.log("Server response:", response);
            setUserData(response.data.user);

        } catch (error) {
            console.error("Ошибка при запросе проектов:", error);

            if (error.status === 401) {
                try {
                    await AuthService.refreshToken();
                    await fetchProfile(url);
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

    const handleLogout = () => {
        AuthService.clearTokens()
        navigate("/")
    }

    const handleHome = () => {
        navigate("/projects")
    }

    useEffect(() => {
        const apiUrl = "http://localhost:8080/api/get/profile";
        fetchProfile(apiUrl).finally();
    }, []);

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">
                        <img src={ProfileIcon}  alt={"profile"}/>
                    </div>
                    <h2>User Profile</h2>
                </div>

                <div className="profile-info">
                    <div className="info-group">
                        <label>
                            <img className={"profile-info-icons"} src={ProfileIcon} alt={"profile"}/>
                            Nickname
                        </label>
                        <input
                            type="text"
                            value={userData.Nickname}
                            readOnly
                        />
                    </div>

                    <div className="info-group">
                        <label>
                            <img className={"profile-info-icons"} src={EmailIcon} alt={"email"}/>
                            Email
                        </label>
                        <input
                            type="email"
                            value={userData.Email}
                            readOnly
                        />
                    </div>

                    <div className="info-group">
                        <label>
                            <img className={"profile-info-icons"} src={PasswordIcon} alt={"password"}/>
                            Password
                        </label>
                        <input
                            type="password"
                            value={'••••••••'}
                            readOnly
                        />
                    </div>

                    <div className="info-group">
                        <label>
                            <img className={"profile-info-icons"} src={CalendarIcon} alt={"date"}/>
                            Created At
                        </label>
                        <input
                            type="text"
                            value={new Date(userData.CreatedAt).toDateString().slice(0, 10)}
                            readOnly
                        />
                    </div>
                </div>

                <div className="profile-actions">
                    <button onClick={handleHome} className="profile-buttons home-btn">
                        Home
                    </button>
                    <button onClick={handleLogout} className="profile-buttons logout-btn">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    )
}

export default UserProfile
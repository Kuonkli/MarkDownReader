import React, { Component } from 'react';

import ("../css/MainPageComponent.css")

class MainPageComponent extends Component {
    constructor(props) {
        super(props)
    }

    render () {
        return (
            <div>
                <header className="header">
                    <div>
                        <button className="headerbutton" id="login">
                            Login
                        </button>
                        <button className="headerbutton" id = "register">
                            Register
                        </button>
                    </div>
                </header>

                <main className="main">
                    <div className="container">
                        <div className="linkblock">
                            <div className="pastelinkarea">
                                <input type="text" id="repo-link" placeholder="Paste your repo link..."/>
                            </div>
                            <div className="readmdbutton">
                                <button id = "readmdbutton">
                                    READ MD
                                </button>
                            </div>
                        </div>
                        <p>OR</p>
                        <div className="uploadmdbutton">
                            <button id = "uploadmdbutton">
                                UPLOAD MD
                            </button>
                        </div>
                    </div>
                </main>

                <footer className="footer">
                    <p>&copy; All rights reserved</p>
                </footer>
            </div>


        );
    }
};

export default MainPageComponent;
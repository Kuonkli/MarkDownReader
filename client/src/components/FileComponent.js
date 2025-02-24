import React, { Component } from "react";
import { marked } from 'marked';

class FileComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            htmlContent: '',
        };
    }

    async componentDidMount() {
        await this.fetchFiles(`https://github.com/Flowseal/zapret-discord-youtube`)
    }

    fetchFiles = async(url) => {
        const apiUrl = url.replace("https://github.com", "https://api.github.com/repos") + "/contents";
        const response = await fetch(apiUrl);
        if (response.ok) {
            const files = await response.json();
            const mdFiles = files.filter(file => file.name.endsWith('.md'));
            for (const mdFile of mdFiles) {
                const fileResponse = await fetch(mdFile.download_url);
                const fileContent = await fileResponse.text();
                const htmlContent = marked(fileContent);
                this.setState({
                    htmlContent: htmlContent,
                })
            }
        } else {
            console.error("Failed to fetch repository contents");
        }
    }

    render() {
        return (
            <div
                dangerouslySetInnerHTML={{__html: this.state.htmlContent}}
            />
        )
    }
}

export default FileComponent;
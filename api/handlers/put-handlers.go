package handlers

import (
	db "MarkDownReader/database"
	"MarkDownReader/models"
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
)

func UpdateFileNameHandler(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var requestBody struct {
		FileId      uint   `json:"FileId"`
		NewFilename string `json:"NewFilename"`
	}
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	if requestBody.NewFilename == "" || requestBody.FileId <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "bad request"})
		return
	}

	var count int64
	db.DB.Model(&models.MarkdownFile{}).Where("filename = ?", requestBody.NewFilename).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "filename already exists"})
		return
	}

	var markdownFile models.MarkdownFile
	if err := db.DB.Where("id = ? AND user_id = ?", requestBody.FileId, userId).First(&markdownFile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch file", "details": err.Error()})
		return
	}

	markdownFile.Filename = requestBody.NewFilename
	if err := db.DB.Save(&markdownFile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update file name", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "file name updated successfully", "file": markdownFile})
}

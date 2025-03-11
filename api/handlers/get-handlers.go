package handlers

import (
	db "MarkDownReader/database"
	"MarkDownReader/models"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

func GetUserFiles(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	var userFiles []models.MarkdownFile
	if err := db.DB.Where("user_id = ?", userId).Find(&userFiles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user files"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"files": userFiles,
	})
}

func GetFileHandler(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}
	fileId, err := strconv.Atoi(c.Query("file_id"))
	if err != nil || fileId <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file id"})
		return
	}
	var userFile models.MarkdownFile
	if err := db.DB.Where("user_id = ? AND id = ?", userId, fileId).First(&userFile).Error; err != nil {
		if !userFile.DeletedAt.Valid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file not found"})
			return
		}
		c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"file": userFile,
	})
}

func GetProfileHandler(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}
	var user models.User
	if err := db.DB.First(&user, userId).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

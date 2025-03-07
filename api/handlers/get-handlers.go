package handlers

import (
	db "MarkDownReader/database"
	"MarkDownReader/models"
	"github.com/gin-gonic/gin"
	"net/http"
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

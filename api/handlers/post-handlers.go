package handlers

import (
	db "MarkDownReader/database"
	"MarkDownReader/models"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

func generateRandomFileName(fileName string, userID uint) string {
	return fmt.Sprintf("%s_%d_%d", fileName, userID, time.Now().UnixNano())
}

func PostMDFileHandler(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid userID type"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to upload file", "details": err.Error()})
		return
	}

	if contentType := file.Header.Get("Content-Type"); contentType != "text/markdown" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("invalid content type: %s", contentType),
		})
		return
	}

	fileName := c.PostForm("filename")
	if fileName == "" {
		fileName = generateRandomFileName("mdproject", userID)
	}

	var count int64
	db.DB.Model(&models.MarkdownFile{}).Where("filename = ? AND user_id = ?", fileName, userID).Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "filename already exists"})
		return
	}

	storagePath := "./markdown-storage"
	if err := os.MkdirAll(storagePath, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create storage directory", "details": err.Error()})
		return
	}

	filePath := filepath.Join(storagePath, generateRandomFileName("mdproject", userID)+".md")

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file", "details": err.Error()})
		return
	}

	markdownFile := models.MarkdownFile{
		Filename: fileName,
		FileURL:  filePath,
		UserID:   userID,
	}

	if err := db.DB.Create(&markdownFile).Error; err != nil {
		if strings.Contains(err.Error(), "duplicate key value") {
			c.JSON(http.StatusConflict, gin.H{"error": "filename already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file metadata", "details": err.Error()})
		return
	}

	if err := db.DB.Preload("User").First(&markdownFile, markdownFile.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load user data", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "file uploaded successfully", "file": markdownFile})
}

func PostCommentHandler(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userID, ok := userIDValue.(uint)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid user ID type"})
		return
	}

	fileID, err := strconv.Atoi(c.Query("file_id"))
	if err != nil || fileID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file id"})
		return
	}
	var req models.Comment
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var file models.MarkdownFile
	if err := db.DB.Where("id = ?", fileID).First(&file).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		}
		return
	}

	comment := models.Comment{
		Type:           req.Type,
		Title:          req.Title,
		Content:        req.Content,
		PositionX:      req.PositionX,
		PositionY:      req.PositionY,
		UserID:         userID,
		MarkdownFileID: uint(fileID),
	}

	if err := db.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create comment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "comment created successfully",
		"comment": comment,
	})
}

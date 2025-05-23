package handlers

import (
	db "MarkDownReader/database"
	"MarkDownReader/models"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"io/ioutil"
	"net/http"
	"strconv"
)

func Verification(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "user logged in",
	})
}

func GetUserFiles(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	searchQuery := c.Query("search") // ?search=термин
	sortOrder := c.Query("sort")     // ?sort=newest или ?sort=oldest

	query := db.DB.Where("user_id = ?", userId)

	if searchQuery != "" {
		searchPattern := "%" + searchQuery + "%"
		query = query.Where("(filename ILIKE '%' || ? || '%' OR SIMILARITY(filename, ?) > 0.2)", searchPattern, searchQuery)
	}

	switch sortOrder {
	case "newest":
		query = query.Order("created_at DESC")
	case "oldest":
		query = query.Order("created_at ASC")
	case "name_asc":
		query = query.Order("filename ASC")
	case "name_desc":
		query = query.Order("filename DESC")
	default:
		query = query.Order("created_at DESC")
	}

	var userFiles []models.MarkdownFile
	if err := query.Find(&userFiles).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch user files"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"files": userFiles,
	})
}

func GetFileHandler(c *gin.Context) {
	// Получаем userID из контекста
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}

	// Получаем file_id из query параметра
	fileId, err := strconv.Atoi(c.Query("file_id"))
	if err != nil || fileId <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid file id"})
		return
	}

	// Загружаем файл из базы данных
	var userFile models.MarkdownFile
	if err := db.DB.Where("user_id = ? AND id = ?", userId, fileId).First(&userFile).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "file not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch file"})
		return
	}

	// Загружаем связанные комментарии
	var comments []models.Comment
	if err := db.DB.Where("markdown_file_id = ?", fileId).Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
		return
	}

	// Читаем содержимое файла из FileURL
	fileContent, err := loadFileContent(userFile.FileURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("failed to load file content: %s", userFile.FileURL)})
		return
	}

	// Формируем ответ
	c.JSON(http.StatusOK, gin.H{
		"file": gin.H{
			"id":       userFile.ID,
			"filename": userFile.Filename,
			"content":  fileContent,
			"comments": comments,
		},
	})
}

// Вспомогательная функция для чтения содержимого файла
func loadFileContent(fileURL string) (string, error) {
	content, err := ioutil.ReadFile(fileURL)
	if err != nil {
		return "", err
	}
	return string(content), nil
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

func GetAllCommentsHandler(c *gin.Context) {
	userId, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "unauthorized"})
		return
	}
	var comments []models.Comment
	if err := db.DB.
		Where("comments.user_id = ?", userId).
		Preload("MarkdownFile").
		Joins("JOIN markdown_files ON comments.markdown_file_id = markdown_files.id").
		Order("markdown_files.id").
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch comments"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"comments": comments,
	})
}

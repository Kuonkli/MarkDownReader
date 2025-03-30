package handlers

import (
	db "MarkDownReader/database"
	"MarkDownReader/models"
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"strconv"
)

func DeleteCommentHandler(c *gin.Context) {
	commentID, err := strconv.Atoi(c.Query("id"))
	if err != nil || commentID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid comment id"})
		return
	}

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

	var comment models.Comment
	if err := db.DB.Where("id = ?", commentID).First(&comment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "comment not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		}
		return
	}

	if comment.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "you can only delete your own comments"})
		return
	}

	if err := db.DB.Delete(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete comment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "comment deleted successfully",
	})
}

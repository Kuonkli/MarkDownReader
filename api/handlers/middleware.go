package handlers

import (
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strconv"
)

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || len(authHeader) <= len("Bearer ") {
			log.Println("Missing access token")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing access token"})
			c.Abort()
			return
		}

		tokenString := authHeader[len("Bearer "):]
		log.Println("Access token found")

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})
		if err != nil || !token.Valid {
			log.Println("Invalid token or parsing error:", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		log.Println("Token valid, proceeding")

		// Преобразуем UserID из строки в uint
		userID, err := strconv.ParseUint(claims.UserID, 10, 32)
		if err != nil {
			log.Println("Invalid UserID format:", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid UserID format"})
			c.Abort()
			return
		}

		c.Set("userID", uint(userID))
		c.Next()
	}
}

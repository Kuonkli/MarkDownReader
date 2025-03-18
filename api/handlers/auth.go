package handlers

import (
	db "MarkDownReader/database"
	"MarkDownReader/models"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"
)

var jwtKey = []byte("j2f3l2kd658vK-09S=GHksvSKGLSDGJ")

type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignUpRequest struct {
	Nickname string `json:"nickname" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func SignUp(c *gin.Context) {
	var req SignUpRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password is too short"})
		return
	}
	if len(req.Password) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password is too long"})
		return
	}
	if len(req.Nickname) >= 200 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "nickname is too long"})
		return
	}
	if len(req.Email) >= 200 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email is too long"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	user := &models.User{
		Nickname: req.Nickname,
		Email:    req.Email,
		Password: string(hashedPassword),
	}
	if err := db.DB.Create(&user).Error; err != nil {
		if strings.Contains(err.Error(), "(SQLSTATE 23505)") {
			c.JSON(http.StatusConflict, gin.H{"error": "email already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	accessTokenExpirationTime := time.Now().Add(15 * time.Minute)
	refreshTokenExpirationTime := time.Now().Add(24 * time.Hour)

	accessClaims := &Claims{
		UserID: strconv.Itoa(int(user.ID)),
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: accessTokenExpirationTime.Unix(),
		},
	}

	refreshClaims := &Claims{
		UserID: strconv.Itoa(int(user.ID)),
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: refreshTokenExpirationTime.Unix(),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate access token"})
		return
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate refresh token"})
		return
	}

	c.Header("Authorization", "Bearer "+accessTokenString)
	c.Header("X-Refresh-Token", refreshTokenString)

	c.JSON(http.StatusCreated, gin.H{"message": "user created successfully"})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request payload"})
		return
	}

	var user models.User
	if err := db.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password or email"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid password or email"})
		return
	}

	accessTokenExpirationTime := time.Now().Add(15 * time.Minute)
	refreshTokenExpirationTime := time.Now().Add(24 * time.Hour)

	accessClaims := &Claims{
		UserID: strconv.Itoa(int(user.ID)),
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: accessTokenExpirationTime.Unix(),
		},
	}

	refreshClaims := &Claims{
		UserID: strconv.Itoa(int(user.ID)),
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: refreshTokenExpirationTime.Unix(),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate refresh token"})
		return
	}

	c.Header("Authorization", "Bearer "+accessTokenString)
	c.Header("X-Refresh-Token", refreshTokenString)

	c.JSON(http.StatusOK, gin.H{"message": "login successful"})
}

func RefreshToken(c *gin.Context) {
	refreshToken := c.GetHeader("X-Refresh-Token")
	if refreshToken == "" {
		log.Println("refresh token not provided")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "refresh token not provided"})
		return
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})

	if err != nil || !token.Valid {
		log.Println("invalid refresh token")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid refresh token"})
		return
	}

	newAccessTokenExpirationTime := time.Now().Add(15 * time.Minute)
	newAccessClaims := &Claims{
		UserID: claims.UserID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: newAccessTokenExpirationTime.Unix(),
		},
	}

	newAccessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, newAccessClaims)
	newAccessTokenString, err := newAccessToken.SignedString(jwtKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new access token"})
		return
	}

	c.Header("Authorization", "Bearer "+newAccessTokenString)
	c.JSON(http.StatusOK, gin.H{"message": "token refreshed successfully"})
}

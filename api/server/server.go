package server

import (
	"MarkDownReader/api/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"time"
)

type APIServer struct {
	Address string `json:"address"`
}

func (s *APIServer) Run() error {
	router := gin.Default()

	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Authorization", "X-Refresh-Token", "Content-Type"},
		ExposeHeaders:    []string{"Authorization", "X-Refresh-Token"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}

	router.Use(cors.New(config))

	router.POST("/signup", handlers.SignUp)
	router.POST("/login", handlers.Login)
	router.POST("/refresh", handlers.RefreshToken)

	api := router.Group("/api", handlers.AuthMiddleware())
	{
		api.Static("/markdown-storage", "./markdown-storage")
		get := api.Group("/get")
		{
			get.GET("/profile", handlers.GetProfileHandler)
			get.GET("/files", handlers.GetUserFiles)
			get.GET("/file", handlers.GetFileHandler)
		}
		add := api.Group("/add")
		{
			add.POST("/file", handlers.PostMDFileHandler)
		}
		edit := api.Group("/edit")
		{
			edit.PUT("/file_name", handlers.UpdateFileNameHandler)
		}
	}

	err := router.Run(s.Address)
	if err != nil {
		log.Fatal(err)
		return err
	}
	return nil
}

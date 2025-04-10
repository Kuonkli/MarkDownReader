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
		api.GET("/verify", handlers.Verification)
		get := api.Group("/get")
		{
			get.GET("/profile", handlers.GetProfileHandler)
			get.GET("/files", handlers.GetUserFiles)
			get.GET("/file", handlers.GetFileHandler)
			get.GET("comments", handlers.GetAllCommentsHandler)
		}
		add := api.Group("/add")
		{
			add.POST("/file", handlers.PostMDFileHandler)
			add.POST("/comment", handlers.PostCommentHandler)
		}
		edit := api.Group("/edit")
		{
			edit.PUT("/file_name", handlers.UpdateFileNameHandler)
			edit.PUT("/comment", handlers.UpdateCommentHandler)
		}
		del := api.Group("/delete")
		{
			del.DELETE("/comment", handlers.DeleteCommentHandler)
		}
	}

	err := router.Run(s.Address)
	if err != nil {
		log.Fatal(err)
		return err
	}
	return nil
}

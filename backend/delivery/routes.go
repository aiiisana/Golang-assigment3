package delivery

import (
	"backend/middleware"
	"backend/repository"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.POST("/auth/users", repository.RegisterUser)
	router.POST("/auth/login", repository.LoginUser)
	router.GET("/users", middleware.JWTAuthMiddleware(), repository.GetUsers)
	router.PUT("/users/:userId", middleware.JWTAuthMiddleware(), repository.UpdateUserData)
	router.GET("/users/:userId", middleware.JWTAuthMiddleware(), repository.GetUserInfo)

	taskGroup := router.Group("/users/:userId/tasks").Use(middleware.JWTAuthMiddleware())
	{
		taskGroup.GET("/", repository.GetTasks)
		taskGroup.POST("/", repository.CreateTask)
		taskGroup.PUT("/:id", repository.UpdateTask)
		taskGroup.DELETE("/:id", repository.DeleteTask)
	}

	adminGroup := router.Group("/admin").Use(middleware.JWTAuthMiddleware())
	adminGroup.Use(func(c *gin.Context) {
		userRole, exists := c.Get("role")
		if !exists || userRole != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Forbidden"})
			c.Abort()
			return
		}
		c.Next()
	})

	// adminGroup.GET("/users", repository.GetUsers)
}

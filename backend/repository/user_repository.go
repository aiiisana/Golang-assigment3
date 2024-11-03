package repository

import (
	"backend/middleware"
	"backend/models"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var users = make([]models.User, 0)
var userIDCounter uint = 1

func InitializeAdminUser() {
	for _, user := range users {
		if user.Email == "admin@example.com" {
			return
		}
	}

	adminUser := models.User{
		ID:       userIDCounter,
		Name:     "admin",
		Email:    "admin@example.com",
		Password: "admin",
		Role:     "admin",
	}

	users = append(users, adminUser)
	userIDCounter++
}

func RegisterUser(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user.Role = "user"
	user.ID = userIDCounter
	users = append(users, user)
	userIDCounter++

	c.JSON(http.StatusOK, "User registered successfully")
}

func LoginUser(c *gin.Context) {
	var loginData struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var foundUser *models.User
	for _, user := range users {
		if user.Email == loginData.Email && user.Password == loginData.Password {
			foundUser = &user
			break
		}
	}

	if foundUser == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, err := middleware.GenerateJWT(foundUser.ID, foundUser.Role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}

	response := struct {
		Token  string `json:"token"`
		UserId uint   `json:"userId"`
	}{
		Token:  token,
		UserId: foundUser.ID,
	}
	c.JSON(http.StatusOK, response)
}

func GetUsers(c *gin.Context) {
	c.JSON(http.StatusOK, users)
}

func GetUserInfo(c *gin.Context) {
	log.Println("Запрос информации о пользователе")
	userIDStr := c.Param("userId")
	log.Println("Полученный userId:", userIDStr)

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		log.Println("Неверный формат userId:", userIDStr)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	for _, u := range users {
		if u.ID == uint(userID) {
			log.Println("Найден пользователь:", u)
			c.JSON(http.StatusOK, u)
			return
		}
	}

	log.Println("Пользователь не найден для ID:", userID)
	c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
}

func UpdateUserData(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный ID пользователя"})
		return
	}

	var user models.User
	for _, u := range users {
		if u.ID == uint(userID) {
			user = u
			break
		}
	}

	if user.ID == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Пользователь не найден"})
		return
	}

	var updatedData models.User
	if err := c.ShouldBindJSON(&updatedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	if updatedData.Name != "" {
		user.Name = updatedData.Name
	}
	if updatedData.Email != "" {
		user.Email = updatedData.Email
	}

	for i, u := range users {
		if u.ID == user.ID {
			users[i] = user
			break
		}
	}

	c.Header("X-User-Id", strconv.Itoa(int(user.ID)))
	c.Header("X-User-Role", c.MustGet("role").(string))

	c.JSON(http.StatusOK, user)
}

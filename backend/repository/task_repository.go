package repository

import (
	"backend/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

var tasks = make(map[uint][]models.Task)
var taskIDCounter uint = 1

func CreateTask(c *gin.Context) {
	userId, _ := strconv.Atoi(c.Param("userId"))

	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task.ID = taskIDCounter
	task.UserID = uint(userId)
	tasks[task.UserID] = append(tasks[task.UserID], task)
	taskIDCounter++

	c.JSON(http.StatusCreated, task)
}

func GetTasks(c *gin.Context) {
	userId, _ := strconv.Atoi(c.Param("userId"))
	userTasks := tasks[uint(userId)]
	c.JSON(http.StatusOK, userTasks)
}

func UpdateTask(c *gin.Context) {
	userId, _ := strconv.Atoi(c.Param("userId"))
	taskId, _ := strconv.Atoi(c.Param("id"))

	var updatedTask models.Task
	if err := c.ShouldBindJSON(&updatedTask); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i, task := range tasks[uint(userId)] {
		if int(task.ID) == taskId {
			updatedTask.ID = task.ID
			updatedTask.UserID = task.UserID
			tasks[uint(userId)][i] = updatedTask
			c.JSON(http.StatusOK, updatedTask)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
}

func DeleteTask(c *gin.Context) {
	userId, _ := strconv.Atoi(c.Param("userId"))
	taskId, _ := strconv.Atoi(c.Param("id"))

	userTasks := tasks[uint(userId)]
	for i, task := range userTasks {
		if int(task.ID) == taskId {
			tasks[uint(userId)] = append(userTasks[:i], userTasks[i+1:]...)
			c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
}

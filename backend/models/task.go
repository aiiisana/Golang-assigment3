package models

type Task struct {
	ID     uint   `json:"id"`
	UserID uint   `json:"userId"`
	Name   string `json:"name"`
	Status string `json:"status"`
}

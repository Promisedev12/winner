<?php

class Database {
    private $host = DB_HOST;
    private $db_name = DB_NAME;
    private $user = DB_USER;
    private $password = DB_PASS;
    private $conn;

    public function connect() {
        $this->conn = new mysqli($this->host, $this->user, $this->password, $this->db_name);

        if ($this->conn->connect_error) {
            die('Connection Error: ' . $this->conn->connect_error);
        }

        return $this->conn;
    }

    public function __construct() {
        $this->connect();
    }

    public function prepare($query) {
        return $this->conn->prepare($query);
    }

    public function query($query) {
        return $this->conn->query($query);
    }

    public function escape($data) {
        return $this->conn->real_escape_string($data);
    }

    public function close() {
        $this->conn->close();
    }

    public function __get($property) {
        if (property_exists($this->conn, $property)) {
            return $this->conn->$property;
        }
    }
}

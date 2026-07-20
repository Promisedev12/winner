-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `phone` VARCHAR(20) NULL,
    `email_verified` BOOLEAN DEFAULT FALSE,
    `verification_token` VARCHAR(255) NULL,
    `reset_token` VARCHAR(255) NULL,
    `reset_expires` DATETIME NULL,
    `status` ENUM('active', 'suspended', 'banned') DEFAULT 'active',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (`email`),
    INDEX idx_status (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create roles table
CREATE TABLE IF NOT EXISTS `roles` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(50) UNIQUE NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default roles
INSERT INTO `roles` (`name`, `description`) VALUES 
('reader', 'Can read blogs and books'),
('blogger', 'Can write and publish blogs'),
('author', 'Can upload and sell books'),
('admin', 'Full system access');

-- Create user_roles table (many-to-many)
CREATE TABLE IF NOT EXISTS `user_roles` (
    `user_id` INT NOT NULL,
    `role_id` INT NOT NULL,
    `approved` BOOLEAN DEFAULT FALSE,
    `approved_at` DATETIME NULL,
    `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`, `role_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create categories table
CREATE TABLE IF NOT EXISTS `categories` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(100) UNIQUE NOT NULL,
    `description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create blogs table
CREATE TABLE IF NOT EXISTS `blogs` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) UNIQUE NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `featured_image` VARCHAR(255) NULL,
    `author_id` INT NOT NULL,
    `category_id` INT NULL,
    `status` ENUM('draft', 'published', 'scheduled', 'archived') DEFAULT 'draft',
    `views` INT DEFAULT 0,
    `likes` INT DEFAULT 0,
    `scheduled_for` DATETIME NULL,
    `published_at` DATETIME NULL,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    INDEX idx_status (`status`),
    INDEX idx_author (`author_id`),
    INDEX idx_views (`views`),
    FULLTEXT idx_search (`title`, `content`, `excerpt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create tags table
CREATE TABLE IF NOT EXISTS `tags` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) UNIQUE NOT NULL,
    `slug` VARCHAR(100) UNIQUE NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS `blog_tags` (
    `blog_id` INT NOT NULL,
    `tag_id` INT NOT NULL,
    PRIMARY KEY (`blog_id`, `tag_id`),
    FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create books table
CREATE TABLE IF NOT EXISTS `books` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `slug` VARCHAR(255) UNIQUE NOT NULL,
    `description` TEXT NULL,
    `cover_image` VARCHAR(255) NULL,
    `file_url` VARCHAR(255) NOT NULL,
    `file_type` ENUM('pdf', 'epub') NOT NULL,
    `author_id` INT NOT NULL,
    `category_id` INT NULL,
    `price` DECIMAL(10,2) DEFAULT 0.00,
    `is_premium` BOOLEAN DEFAULT FALSE,
    `downloads` INT DEFAULT 0,
    `rating` DECIMAL(3,2) DEFAULT 0.00,
    `reviews_count` INT DEFAULT 0,
    `pages` INT NULL,
    `language` VARCHAR(50) DEFAULT 'English',
    `edition` VARCHAR(50) NULL,
    `isbn` VARCHAR(50) NULL,
    `status` ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    `published_at` DATETIME NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL,
    INDEX idx_status (`status`),
    INDEX idx_author (`author_id`),
    INDEX idx_downloads (`downloads`),
    FULLTEXT idx_search (`title`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create comments table
CREATE TABLE IF NOT EXISTS `comments` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `user_id` INT NOT NULL,
    `blog_id` INT NULL,
    `book_id` INT NULL,
    `parent_id` INT NULL,
    `likes` INT DEFAULT 0,
    `status` ENUM('pending', 'approved', 'spam') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE,
    INDEX idx_status (`status`),
    INDEX idx_content_type (`blog_id`, `book_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS `bookmarks` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `blog_id` INT NULL,
    `book_id` INT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
    UNIQUE KEY unique_bookmark (`user_id`, `blog_id`, `book_id`),
    INDEX idx_user (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create follows table
CREATE TABLE IF NOT EXISTS `follows` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `follower_id` INT NOT NULL,
    `following_id` INT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (`follower_id`, `following_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create reading_history table
CREATE TABLE IF NOT EXISTS `reading_history` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `blog_id` INT NULL,
    `book_id` INT NULL,
    `progress` INT DEFAULT 0,
    `last_read` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`blog_id`) REFERENCES `blogs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE CASCADE,
    INDEX idx_user (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create payments table
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `book_id` INT NULL,
    `subscription_id` INT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `commission` DECIMAL(10,2) NOT NULL,
    `author_earnings` DECIMAL(10,2) NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `transaction_id` VARCHAR(255) UNIQUE NOT NULL,
    `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE SET NULL,
    INDEX idx_status (`status`),
    INDEX idx_user (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS `subscriptions` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `plan` ENUM('creator', 'enterprise') NOT NULL,
    `price` DECIMAL(10,2) NOT NULL,
    `status` ENUM('active', 'cancelled', 'expired', 'past_due') DEFAULT 'active',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `payment_method` VARCHAR(50) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX idx_status (`status`),
    INDEX idx_user (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `data` JSON NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    INDEX idx_user_read (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS `activity_logs` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NULL,
    `action` VARCHAR(255) NOT NULL,
    `details` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX idx_user (`user_id`),
    INDEX idx_created (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create reports table
CREATE TABLE IF NOT EXISTS `reports` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `reporter_id` INT NOT NULL,
    `content_type` ENUM('blog', 'book', 'comment') NOT NULL,
    `content_id` INT NOT NULL,
    `reason` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('pending', 'resolved', 'dismissed') DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `resolved_at` DATETIME NULL,
    `resolved_by` INT NULL,
    FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    INDEX idx_status (`status`),
    INDEX idx_content (`content_type`, `content_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
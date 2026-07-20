-- Insert sample categories
INSERT INTO `categories` (`name`, `slug`, `description`) VALUES
('Technology', 'technology', 'Latest tech news and trends'),
('Programming', 'programming', 'Coding tutorials and best practices'),
('Data Science', 'data-science', 'Data analysis and machine learning'),
('Web Development', 'web-development', 'Frontend and backend development'),
('AI & Machine Learning', 'ai-ml', 'Artificial intelligence and ML insights'),
('Business', 'business', 'Entrepreneurship and business strategies'),
('Marketing', 'marketing', 'Digital marketing and SEO'),
('Design', 'design', 'UI/UX and graphic design'),
('Education', 'education', 'Learning resources and tips'),
('Self Development', 'self-development', 'Personal growth and productivity');

-- Insert sample tags
INSERT INTO `tags` (`name`, `slug`) VALUES
('AI', 'ai'),
('Python', 'python'),
('JavaScript', 'javascript'),
('React', 'react'),
('PHP', 'php'),
('MySQL', 'mysql'),
('Tutorial', 'tutorial'),
('Beginners', 'beginners'),
('Advanced', 'advanced'),
('Tips', 'tips');

-- Insert admin user (password: Admin@123)
INSERT INTO `users` (`name`, `email`, `password`, `email_verified`, `status`) VALUES
('Admin User', 'admin@bloglib.com', '$2y$10$YourHashedPasswordHere', TRUE, 'active');

-- Assign admin role (assuming admin user id = 1 and role id = 4 for admin)
-- INSERT INTO `user_roles` (`user_id`, `role_id`, `approved`, `approved_at`) VALUES (1, 4, TRUE, NOW());
import React, { useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiSearch,
  FiBookmark,
  FiShare2,
  FiArrowRight,
} from "react-icons/fi";
import { FaLock, FaRegCommentAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleReadArticle = (id) => {
    navigate(`/article/${id}`);
  };

  // Sample blog data - replace with your actual data
  const blogPosts = [
    {
      id: 1,
      title: "Understanding End-to-End Encryption in Cloud Storage",
      excerpt:
        "A deep dive into how end-to-end encryption protects your files from unauthorized access, even from service providers.",
      category: "security",
      date: "May 15, 2023",
      readTime: "8 min read",
      author: "Alex Security",
      encrypted: true,
      thumbnail:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      bookmarked: false,
    },
    {
      id: 2,
      title: "The Future of Secure File Sharing Technologies",
      excerpt:
        "Exploring emerging technologies that will revolutionize how we share files securely in the coming years.",
      category: "technology",
      date: "June 2, 2023",
      readTime: "6 min read",
      author: "Sarah Tech",
      encrypted: true,
      thumbnail:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      bookmarked: true,
    },
    {
      id: 3,
      title: "Best Practices for Secure Document Management",
      excerpt:
        "Essential tips for businesses to manage sensitive documents while maintaining security and accessibility.",
      category: "business",
      date: "June 18, 2023",
      readTime: "10 min read",
      author: "James Enterprise",
      encrypted: true,
      thumbnail:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      comments: 5,
      bookmarked: false,
    },
    {
      id: 4,
      title: "Comparing Encryption Standards: AES vs RSA",
      excerpt:
        "A technical comparison of the most widely used encryption standards and their appropriate use cases.",
      category: "security",
      date: "July 5, 2023",
      readTime: "12 min read",
      author: "Dr. Crypto",
      encrypted: true,
      thumbnail:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      comments: 15,
      bookmarked: true,
    },
    {
      id: 5,
      title: "How We Implement Zero-Knowledge Architecture",
      excerpt:
        "Our engineering team explains the technical details behind our zero-knowledge security implementation.",
      category: "engineering",
      date: "July 22, 2023",
      readTime: "15 min read",
      author: "Engineering Team",
      encrypted: true,
      thumbnail:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      comments: 23,
      bookmarked: false,
    },
    {
      id: 6,
      title: "The Psychology of Strong Passwords",
      excerpt:
        "Why users choose weak passwords and how to create memorable yet secure authentication methods.",
      category: "psychology",
      date: "August 10, 2023",
      readTime: "7 min read",
      author: "Dr. Mind",
      encrypted: false,
      thumbnail:
        "https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      comments: 9,
      bookmarked: false,
    },
  ];

  const categories = [
    { id: "all", name: "All Articles" },
    { id: "security", name: "Security" },
    { id: "technology", name: "Technology" },
    { id: "business", name: "Business" },
    { id: "engineering", name: "Engineering" },
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      activeCategory === "all" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleBookmark = (postId) => {
    // In a real app, this would update the backend
    // Bookmark toggled for post: ${postId}
  };

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="row mb-5">
        <div className="col-lg-8 mx-auto text-center">
          <h1 className="fw-bold mb-3">Secure Knowledge Hub</h1>
          <p className="lead text-muted">
            Expert insights on encryption, security best practices, and the
            future of privacy technology
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-5">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="input-group">
            <span className="input-group-text bg-white">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex flex-wrap justify-content-md-end gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`btn btn-sm ${
                  activeCategory === category.id
                    ? "btn-primary"
                    : "btn-outline-secondary"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <div className="row mb-5">
          <div className="col">
            <div className="card border-0 shadow-lg overflow-hidden">
              <div className="row g-0">
                <div className="col-lg-6">
                  <img
                    src={filteredPosts[0].thumbnail}
                    alt={filteredPosts[0].title}
                    className="img-fluid h-100 object-fit-cover"
                    style={{ minHeight: "300px" }}
                  />
                </div>
                <div className="col-lg-6">
                  <div className="card-body p-4 p-lg-5">
                    <div className="d-flex align-items-center mb-3">
                      <span className="badge bg-primary bg-opacity-10 text-primary me-2">
                        {filteredPosts[0].category.charAt(0).toUpperCase() +
                          filteredPosts[0].category.slice(1)}
                      </span>
                      {filteredPosts[0].encrypted && (
                        <span className="badge bg-success bg-opacity-10 text-success">
                          <FaLock className="me-1" size={12} />
                          Encrypted Content
                        </span>
                      )}
                    </div>
                    <h2 className="card-title mb-3">
                      {filteredPosts[0].title}
                    </h2>
                    <p className="card-text text-muted mb-4">
                      {filteredPosts[0].excerpt}
                    </p>
                    <div className="d-flex flex-wrap align-items-center text-muted small mb-4">
                      <span className="d-flex align-items-center me-3">
                        <FiUser className="me-1" />
                        {filteredPosts[0].author}
                      </span>
                      <span className="d-flex align-items-center me-3">
                        <FiCalendar className="me-1" />
                        {filteredPosts[0].date}
                      </span>
                      <span className="d-flex align-items-center me-3">
                        <FiClock className="me-1" />
                        {filteredPosts[0].readTime}
                      </span>
                      <span className="d-flex align-items-center">
                        <FaRegCommentAlt className="me-1" />
                        {filteredPosts[0].comments} comments
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-primary me-3"
                        onClick={() => handleReadArticle(filteredPosts[0].id)}
                      >
                        Read Article <FiArrowRight className="ms-1" />
                      </button>

                      <button
                        className="btn btn-outline-secondary me-2"
                        onClick={() => toggleBookmark(filteredPosts[0].id)}
                      >
                        <FiBookmark
                          className={
                            filteredPosts[0].bookmarked
                              ? "text-warning fill-warning"
                              : ""
                          }
                        />
                      </button>
                      <button className="btn btn-outline-secondary">
                        <FiShare2 />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Posts */}
      <div className="row g-4">
        {filteredPosts.slice(1).map((post) => (
          <div key={post.id} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="position-relative">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="position-absolute top-0 end-0 p-2">
                  <button
                    className="btn btn-sm btn-light rounded-circle"
                    onClick={() => toggleBookmark(post.id)}
                  >
                    <FiBookmark
                      className={
                        post.bookmarked ? "text-warning fill-warning" : ""
                      }
                    />
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <span className="badge bg-primary bg-opacity-10 text-primary me-2">
                    {post.category.charAt(0).toUpperCase() +
                      post.category.slice(1)}
                  </span>
                  {post.encrypted && (
                    <span className="badge bg-success bg-opacity-10 text-success">
                      <FaLock size={10} className="me-1" />
                      Encrypted
                    </span>
                  )}
                </div>
                <h5 className="card-title mb-3">{post.title}</h5>
                <p className="card-text text-muted small mb-3">
                  {post.excerpt}
                </p>
                <div className="d-flex flex-wrap align-items-center text-muted small mb-3">
                  <span className="d-flex align-items-center me-3">
                    <FiUser className="me-1" size={12} />
                    {post.author}
                  </span>
                  <span className="d-flex align-items-center me-3">
                    <FiCalendar className="me-1" size={12} />
                    {post.date}
                  </span>
                  <span className="d-flex align-items-center">
                    <FiClock className="me-1" size={12} />
                    {post.readTime}
                  </span>
                </div>
              </div>
              <div className="card-footer bg-white border-0 d-flex justify-content-between">
                <button
                  className="btn btn-primary me-3"
                  onClick={() => handleReadArticle(filteredPosts[0].id)}
                >
                  Read Article <FiArrowRight className="ms-1" />
                </button>
                <div className="d-flex">
                  <span className="d-flex align-items-center small text-muted me-2">
                    <FaRegCommentAlt className="me-1" size={12} />
                    {post.comments}
                  </span>
                  <button className="btn btn-sm btn-outline-secondary">
                    <FiShare2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredPosts.length === 0 && (
        <div className="text-center py-5">
          <FiSearch size={48} className="text-muted mb-3" />
          <h4>No articles found</h4>
          <p className="text-muted">
            Try adjusting your search or select a different category
          </p>
        </div>
      )}
    </div>
  );
};

export default Blog;

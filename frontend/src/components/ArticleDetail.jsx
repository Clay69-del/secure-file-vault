import React from 'react';
import { useParams } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { FaLock } from 'react-icons/fa';

const blogPosts = [
  {
    id: 1,
    title: 'Understanding End-to-End Encryption in Cloud Storage',
    excerpt: 'A deep dive into how end-to-end encryption protects your files from unauthorized access, even from service providers.',
    description: 'End-to-end encryption (E2EE) ensures that data is encrypted on the sender’s device and decrypted only by the recipient. In cloud storage, this model protects sensitive files even if the provider is compromised. This article explores the fundamentals of E2EE, how key management works, and the challenges involved in integrating it into scalable systems without sacrificing performance or user experience.',
    category: 'security',
    date: 'May 15, 2023',
    readTime: '8 min read',
    author: 'Alex Security',
    encrypted: true,
    thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    comments: 12,
    bookmarked: false
  },
  {
    id: 2,
    title: 'The Future of Secure File Sharing Technologies',
    excerpt: 'Exploring emerging technologies that will revolutionize how we share files securely in the coming years.',
    description: 'From blockchain-enabled document tracking to ephemeral sharing links and decentralized storage, secure file sharing is rapidly evolving. This article highlights the latest trends in privacy-preserving technologies, regulatory pressures, and how businesses can adapt to maintain compliance while ensuring seamless collaboration.',
    category: 'technology',
    date: 'June 2, 2023',
    readTime: '6 min read',
    author: 'Sarah Tech',
    encrypted: true,
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    comments: 8,
    bookmarked: true
  },
  {
    id: 3,
    title: 'Best Practices for Secure Document Management',
    excerpt: 'Essential tips for businesses to manage sensitive documents while maintaining security and accessibility.',
    description: 'Managing digital documents securely requires more than access control. This article covers version control, audit trails, role-based permissions, data classification, and cloud DLP strategies to help organizations reduce the risk of data leakage and ensure compliance with global standards such as ISO 27001 and GDPR.',
    category: 'business',
    date: 'June 18, 2023',
    readTime: '10 min read',
    author: 'James Enterprise',
    encrypted: true,
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    comments: 5,
    bookmarked: false
  },
  {
    id: 4,
    title: 'Comparing Encryption Standards: AES vs RSA',
    excerpt: 'A technical comparison of the most widely used encryption standards and their appropriate use cases.',
    description: 'AES and RSA are both widely adopted, but they serve different purposes. This article breaks down the symmetric and asymmetric encryption models, performance trade-offs, and real-world applications—from securing HTTPS to encrypting storage devices—and when you should prefer one over the other based on your use case.',
    category: 'security',
    date: 'July 5, 2023',
    readTime: '12 min read',
    author: 'Dr. Crypto',
    encrypted: true,
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    comments: 15,
    bookmarked: true
  },
  {
    id: 5,
    title: 'How We Implement Zero-Knowledge Architecture',
    excerpt: 'Our engineering team explains the technical details behind our zero-knowledge security implementation.',
    description: 'Zero-knowledge architecture allows systems to operate without seeing the data users upload. This article outlines our design decisions, cryptographic primitives used (e.g., ZK-SNARKs), challenges of performance tuning, and how we built a secure, scalable solution that empowers users with full data ownership without sacrificing usability.',
    category: 'engineering',
    date: 'July 22, 2023',
    readTime: '15 min read',
    author: 'Engineering Team',
    encrypted: true,
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    comments: 23,
    bookmarked: false
  },
  {
    id: 6,
    title: 'The Psychology of Strong Passwords',
    excerpt: 'Why users choose weak passwords and how to create memorable yet secure authentication methods.',
    description: 'This article explores the behavioral patterns behind weak password choices, the pitfalls of password fatigue, and how to design systems that guide users toward better practices. It covers psychological nudges, password managers, passphrases, and biometric alternatives, making authentication safer and more user-friendly.',
    category: 'psychology',
    date: 'August 10, 2023',
    readTime: '7 min read',
    author: 'Dr. Mind',
    encrypted: false,
    thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    comments: 9,
    bookmarked: false
  }
];


const ArticleDetail = () => {
  const { id } = useParams();
  const article = blogPosts.find(post => post.id === parseInt(id));

  if (!article) {
    return (
      <div className="container py-5 text-center">
        <h2>Article Not Found</h2>
        <p>The article you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row mb-4">
        <div className="col-lg-10 mx-auto">
          <h1 className="fw-bold mb-3">{article.title}</h1>
          <div className="text-muted d-flex flex-wrap gap-3 mb-3">
            <span><FiUser className="me-1" /> {article.author}</span>
            <span><FiCalendar className="me-1" /> {article.date}</span>
            <span><FiClock className="me-1" /> {article.readTime}</span>
            {article.encrypted && (
              <span className="text-success"><FaLock className="me-1" /> Encrypted Content</span>
            )}
          </div>
          <img src={article.thumbnail} alt={article.title} className="img-fluid rounded shadow-sm mb-4" />
        
          <hr />
          <div>
            <p className="lead">{article.excerpt}</p>
<hr />
<div>
  <p>{article.description}</p>
</div>
</div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;

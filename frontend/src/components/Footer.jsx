import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <div className="container">
        <div className="row">
          {/* Company Info */}
          <div className="col-md-4 mb-4 mb-md-0">
            <h5 className="text-uppercase text-white">Secure File Vault</h5>
            <p className="text-light" style={{ opacity: 0.9 }}>
              Your trusted platform for end-to-end encrypted file storage and
              sharing.
            </p>
            <div className="d-flex">
              <a href="#" className="text-white me-3">
                <i className="bi bi-twitter fs-5"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-white me-3">
                <i className="bi bi-linkedin fs-5"></i>
              </a>
              <a href="#" className="text-white">
                <i className="bi bi-github fs-5"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-md-2 mb-4 mb-md-0">
            <h5 className="text-uppercase text-white">QUICK LINKS</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a
                  href="/"
                  className="text-light text-decoration-none"
                  style={{ opacity: 0.9 }}
                >
                  Home
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ opacity: 0.9 }}
                >
                  Features
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ opacity: 0.9 }}
                >
                  Pricing
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ opacity: 0.9 }}
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Security Links */}
          <div className="col-md-3 mb-4 mb-md-0">
            <h5 className="text-uppercase text-white text-decoration-none">
              SECURITY
            </h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ opacity: 0.9 }}
                >
                  Privacy Policy
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ opacity: 0.9 }}
                >
                  Terms of Service
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ opacity: 0.9 }}
                >
                  Encryption Whitepaper
                </a>
              </li>
              <li className="mb-2">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                  style={{ opacity: 0.9 }}
                >
                  Security Audit
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-md-3">
            <h5 className="text-uppercase text-white">CONTACT US</h5>
            <ul className="list-unstyled text-light" style={{ opacity: 0.9 }}>
              <li className="mb-2">
                <i className="bi bi-envelope me-2"></i> 240441@softwarica.edu.np
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone me-2"></i> +977 980-9437032
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4 bg-secondary" />

        {/* Copyright */}
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <p className="small text-light mb-0" style={{ opacity: 0.9 }}>
              &copy; {new Date().getFullYear()} Yogendra Badu. All rights
              reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <p className="small text-light mb-0" style={{ opacity: 0.9 }}>
              <i className="bi bi-shield-check me-1"></i>
              End-to-End Encrypted |<i className="bi bi-google ms-2 me-1"></i>
              Google Sign-In Enabled
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiMessageSquare,
  FiUser,
  FiMap,
  FiPhoneCall,
  FiCheckCircle,
  FiLoader,
} from "react-icons/fi";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here you would typically make an API call to send the form data
      // For now, we'll just simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Contact Information Section */}
      <section className="py-12 my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 mb-8 lg:mb-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Get in Touch</h3>
                  <div className="flex items-center mb-6">
                    <FiPhoneCall
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Phone</h5>
                      <p className="text-gray-600 text-sm">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <FiMail
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Email</h5>
                      <p className="text-gray-600 text-sm">
                        support@securecloud.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center mb-6">
                    <FiMapPin
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Location</h5>
                      <p className="text-gray-600 text-sm">
                        123 Secure Street, Cyber City, CA 90210
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-6">
                    Send us a Message
                  </h3>
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-transparent"
                          id="name"
                          name="name"
                          placeholder="Your Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="name"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary-600"
                        >
                          Your Name
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-transparent"
                          id="email"
                          name="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="email"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary-600"
                        >
                          Email address
                        </label>
                      </div>
                      <div className="md:col-span-2 relative">
                        <input
                          type="text"
                          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-transparent"
                          id="subject"
                          name="subject"
                          placeholder="Subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="subject"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary-600"
                        >
                          Subject
                        </label>
                      </div>
                      <div className="md:col-span-2 relative">
                        <textarea
                          className="peer w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder-transparent resize-none"
                          placeholder="Leave a message here"
                          id="message"
                          name="message"
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                        <label
                          htmlFor="message"
                          className="absolute left-4 -top-2.5 bg-white px-2 text-sm text-gray-600 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-primary-600"
                        >
                          Message
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        {submitSuccess ? (
                          <div className="flex items-center p-4 mb-4 text-green-800 border border-green-300 rounded-lg bg-green-50">
                            <FiCheckCircle className="mr-2" />
                            Your message has been sent successfully!
                          </div>
                        ) : (
                          <button
                            type="submit"
                            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <FiLoader className="mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              "Send Message"
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Business Hours Section */}
      <section className="py-12 my-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="mb-8 lg:mb-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-6">Business Hours</h3>
                  <div className="flex items-center mb-4">
                    <FiClock
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">
                        Monday - Friday
                      </h5>
                      <p className="text-gray-600 text-sm">9:00 AM - 5:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <FiClock
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Saturday</h5>
                      <p className="text-gray-600 text-sm">
                        10:00 AM - 2:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiClock
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Sunday</h5>
                      <p className="text-gray-600 text-sm">Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-6">
                    Contact Preferences
                  </h3>
                  <div className="flex items-center mb-4">
                    <FiMessageSquare
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">
                        Email Support
                      </h5>
                      <p className="text-gray-600 text-sm">Available 24/7</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <FiPhone
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">
                        Phone Support
                      </h5>
                      <p className="text-gray-600 text-sm">
                        Available during business hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FiUser
                      className="text-primary-600 mr-4 flex-shrink-0"
                      size={24}
                    />
                    <div>
                      <h5 className="text-sm font-medium mb-1">Live Chat</h5>
                      <p className="text-gray-600 text-sm">
                        Available Monday - Friday, 9 AM - 5 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

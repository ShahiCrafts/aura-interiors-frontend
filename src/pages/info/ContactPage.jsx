import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  Loader2,
  CheckCircle,
  MessageSquare,
  Headphones,
  ShoppingBag,
  Handshake,
  ArrowRight,
  User,
  FileText,
} from "lucide-react";
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";
import { useSubmitContact } from "../../hooks/admin/useContactTan";

const contactCategories = [
  {
    value: "general",
    label: "General Inquiry",
    icon: MessageSquare,
  },
  {
    value: "support",
    label: "Support",
    icon: Headphones,
  },
  {
    value: "sales",
    label: "Sales",
    icon: ShoppingBag,
  },
  {
    value: "partnership",
    label: "Partnership",
    icon: Handshake,
  },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const { mutate: submitContact, isPending } = useSubmitContact();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitContact(formData, {
      onSuccess: () => {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to send message.");
      },
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white font-dm-sans">

        {/* Full Width Split Layout - Compact */}
        <div className="flex flex-col lg:flex-row min-h-screen pt-16 items-center justify-center gap-12 lg:gap-8 xl:gap-16 max-w-7xl mx-auto px-4">

          {/* Left Column: Info */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center text-center lg:text-left">

            <div className="max-w-md mx-auto lg:mx-0 lg:ml-auto w-full">

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-zinc-900 mb-4 tracking-tight font-playfair">
                Get in <span className="italic text-teal-700">Touch.</span>
              </h1>
              <p className="text-zinc-600 text-base md:text-lg max-w-sm mx-auto lg:mx-0 leading-relaxed font-dm-sans">
                We are here to help. Reach out using the form or via our direct channels.
              </p>
            </div>

            <div className="mt-10 lg:mt-10 max-w-md mx-auto lg:mx-0 lg:ml-auto w-full space-y-5 lg:space-y-6">
              <div className="flex items-center gap-5 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                  <Mail size={22} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Email</p>
                  <p className="text-lg font-medium text-gray-900">support@aurainteriors.live</p>
                </div>
              </div>

              <div className="flex items-center gap-5 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                  <Phone size={22} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Phone</p>
                  <p className="text-lg font-medium text-gray-900">+977 9866291003</p>
                </div>
              </div>

              <div className="flex items-center gap-5 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                  <MapPin size={22} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Studio</p>
                  <p className="text-lg font-medium text-gray-900">Lalitpur, Nepal</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center">
            <div className="max-w-lg mx-auto lg:mx-0 lg:mr-auto w-full bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-3xl font-playfair font-light text-gray-950 mb-8 text-center lg:text-left">Send a Message</h2>

              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Inquiry Topic"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="How can we help you today?"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 resize-none bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-teal-700/25 font-dm-sans flex items-center justify-center gap-2 mt-4 text-base"
                >
                  {isPending ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>


      </main>
      <Footer />
    </>
  );
}

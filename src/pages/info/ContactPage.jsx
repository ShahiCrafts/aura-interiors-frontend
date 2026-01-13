import { useState } from "react";
import { motion } from "framer-motion";
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
  const [submitted, setSubmitted] = useState(false);

  const { mutate: submitContact, isPending } = useSubmitContact();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitContact(formData, {
      onSuccess: () => {
        setSubmitted(true);
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
        alert(error.response?.data?.message || "Failed to send message.");
      },
    });
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-stone-50 font-dm-sans flex items-center justify-center p-4 relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0 h-full w-full">
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2600&auto=format&fit=crop"
              alt="Modern Interior"
              className="h-full w-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-stone-100/60 backdrop-blur-sm" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-10 sm:p-14 max-w-lg w-full text-center shadow-2xl shadow-teal-900/10 relative z-10"
          >
            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-teal-700" />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-neutral-900 mb-4">
              Received
            </h1>
            <p className="text-neutral-600 mb-8 leading-relaxed">
              We've got your message. Our team will review your inquiry and get back to you shortly.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-8 py-3 bg-teal-700 text-white rounded-full font-medium hover:bg-teal-800 transition-all shadow-lg hover:shadow-teal-700/20 flex items-center gap-2 mx-auto"
            >
              Send Another
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white font-dm-sans">

        {/* Full Width Split Layout - Compact */}
        <div className="flex flex-col lg:flex-row min-h-screen pt-16">

          {/* Left Column: Info (White Background) */}
          <div className="lg:w-1/2 bg-white p-8 lg:p-12 xl:p-16 flex flex-col justify-center lg:justify-start lg:pt-32 relative overflow-hidden text-center lg:text-left">

            <div className="relative z-10 max-w-md mx-auto w-full">

              <h1 className="text-5xl lg:text-6xl font-playfair font-light leading-tight mb-6 text-gray-950">
                Get in <span className="italic text-teal-700">Touch.</span>
              </h1>
              <p className="text-gray-700 text-base lg:text-lg leading-relaxed max-w-sm mx-auto lg:mx-0 font-dm-sans">
                We are here to help. Reach out using the form or via our direct channels.
              </p>
            </div>

            <div className="relative z-10 mt-10 lg:mt-12 max-w-md mx-auto w-full space-y-6 lg:space-y-8">
              <div className="flex items-center gap-5 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                  <Mail size={22} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Email</p>
                  <p className="text-lg font-medium text-gray-900">hello@aurainteriors.com</p>
                </div>
              </div>

              <div className="flex items-center gap-5 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                  <Phone size={22} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Phone</p>
                  <p className="text-lg font-medium text-gray-900">+1 (234) 567-890</p>
                </div>
              </div>

              <div className="flex items-center gap-5 justify-center lg:justify-start">
                <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                  <MapPin size={22} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Studio</p>
                  <p className="text-lg font-medium text-gray-900">123 Design District, NY</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form (Neutral Background) */}
          <div className="lg:w-1/2 bg-white p-8 lg:p-12 xl:p-16 flex flex-col justify-center lg:justify-start lg:pt-32">
            <div className="max-w-lg mx-auto w-full">
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

        {/* FAQ Section */}
        <section className="bg-stone-50 py-20 lg:py-32 border-t border-stone-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 mb-4 block">Help Center</span>
              <h2 className="text-4xl lg:text-5xl font-playfair font-bold text-gray-950 mb-6">Frequently Asked <span className="italic text-teal-700">Questions</span></h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Quick answers to common questions. Can't find what you're looking for? Reach out to our team.
              </p>
            </div>

            <div className="grid gap-4 mb-12">
              {[
                { q: "How do I place an order?", a: "Browse our shop, add items to your cart, and proceed to checkout with your shipping and payment info." },
                { q: "What is your return policy?", a: "We offer a 30-day return policy for most items in their original condition." },
                { q: "How does the 'View in AR' feature work?", a: "Tap 'View in AR' on any product page using your mobile device to see the item in your room at scale." }
              ].map((faq, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="/faq"
                className="inline-flex items-center gap-2 text-teal-700 font-bold hover:text-teal-800 transition-colors group"
              >
                View all FAQs
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { contactSchema } from "../../utils/validationSchemas";

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
  const { mutate: submitContact, isPending } = useSubmitContact();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(contactSchema),
    mode: "onTouched",
  });

  const onSubmit = (data) => {
    submitContact(
      { name: data.fullName, ...data }, // Mapping fullName to name as expected by API if needed, or adjust API to accept fullName
      {
        onSuccess: () => {
          toast.success("Message sent successfully! We'll get back to you soon.");
          reset();
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || "Failed to send message.");
        },
      }
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white font-dm-sans">

        {/* Full Width Split Layout - Responsive */}
        <div className="flex flex-col lg:flex-row min-h-screen pt-24 sm:pt-28 lg:pt-16 items-center justify-center gap-10 sm:gap-12 lg:gap-8 xl:gap-16 max-w-7xl mx-auto px-6 sm:px-8 lg:px-8 py-12 sm:py-14 lg:py-0">

          {/* Left Column: Info */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center text-center lg:text-left">

            <div className="max-w-md mx-auto lg:mx-0 lg:ml-auto w-full">

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-light text-zinc-900 mb-3 sm:mb-4 tracking-tight font-playfair">
                Get in <span className="italic text-teal-700">Touch.</span>
              </h1>
              <p className="text-zinc-600 text-base sm:text-lg max-w-sm mx-auto lg:mx-0 leading-relaxed font-dm-sans">
                We are here to help. Reach out using the form or via our direct channels.
              </p>
            </div>

            <div className="mt-8 sm:mt-10 lg:mt-10 max-w-md mx-auto lg:mx-0 lg:ml-auto w-full">
              <div className="space-y-5 sm:space-y-5 lg:space-y-6 inline-block mx-auto lg:mx-0">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                    <Mail size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Email</p>
                    <p className="text-base sm:text-lg font-medium text-gray-900">support@aurainteriors.live</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                    <Phone size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Phone</p>
                    <p className="text-base sm:text-lg font-medium text-gray-900">+977 9866291003</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-full bg-teal-50 border border-teal-200/30 flex items-center justify-center shrink-0 text-teal-700">
                    <MapPin size={20} className="sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Studio</p>
                    <p className="text-base sm:text-lg font-medium text-gray-900">Lalitpur, Nepal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center">
            <div className="max-w-lg mx-auto lg:mx-0 lg:mr-auto w-full bg-white p-6 sm:p-7 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl sm:text-3xl font-playfair font-light text-gray-950 mb-6 sm:mb-8 text-center lg:text-left">Send a Message</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register("fullName")}
                        placeholder="John Doe"
                        className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border focus:ring-1 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 bg-white ${errors.fullName ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-teal-700 focus:ring-teal-700"}`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="you@example.com"
                        className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border focus:ring-1 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 bg-white ${errors.email ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-teal-700 focus:ring-teal-700"}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...register("phone")}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-gray-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 bg-white"
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
                        {...register("subject")}
                        placeholder="Inquiry Topic"
                        className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border focus:ring-1 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 bg-white ${errors.subject ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-teal-700 focus:ring-teal-700"}`}
                      />
                    </div>
                    {errors.subject && (
                      <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      {...register("message")}
                      rows={4}
                      placeholder="How can we help you today?"
                      className={`w-full px-4 py-2.5 sm:py-3 rounded-xl border focus:ring-1 outline-none transition-all font-dm-sans text-sm text-gray-900 placeholder:text-gray-400 resize-none bg-white ${errors.message ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-gray-200 focus:border-teal-700 focus:ring-teal-700"}`}
                    />
                  </div>
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1 font-dm-sans">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-3 sm:py-4 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-700/70 disabled:cursor-not-allowed text-white font-semibold rounded-full transition-all duration-300 font-dm-sans flex items-center justify-center gap-2 mt-2 sm:mt-4 text-sm sm:text-base"
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

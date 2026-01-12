import React from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import notFoundAnimation from "../../assets/images/not_found.json"; // Ensure path is correct
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";
import { ArrowLeft } from "lucide-react";

const NotFoundPage = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-neutral-50 font-dm-sans pt-20">
                <div className="w-full max-w-xs mb-3">
                    <Lottie animationData={notFoundAnimation} loop={true} />
                </div>

                <h1 className="text-2xl md:text-3xl font-playfair font-semibold text-neutral-900 mb-4 text-center">
                    Page Not Found
                </h1>

                <p className="text-neutral-500 text-lg mb-5 text-center max-w-md">
                    Oops! The page you are looking for seems to have vanished into thin air.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-8 py-3 text-teal-700 font-medium rounded-full transition-all duration-300"
                >
                    <ArrowLeft size={20} />
                    Go Back Home
                </Link>
            </div>
            <Footer />
        </>
    );
};

export default NotFoundPage;

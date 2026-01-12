import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDown,
    Search,
    HelpCircle,
    ShoppingBag,
    Truck,
    RotateCcw,
    Smartphone,
    Plus,
    Minus
} from "lucide-react";
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";

const faqData = [
    {
        category: "Ordering",
        icon: ShoppingBag,
        questions: [
            {
                id: "o1",
                q: "How do I place an order?",
                a: "To place an order, browse our shop, select your desired items, and add them to your cart. Once you're ready, click on the cart icon and proceed to checkout. Follow the prompts to enter your shipping and payment information."
            },
            {
                id: "o2",
                q: "Can I modify my order after it's placed?",
                a: "We process orders quickly to ensure timely delivery. If you need to change or cancel your order, please contact our support team within 1 hour of placement. After this window, we may not be able to make changes."
            },
            {
                id: "o3",
                q: "Do you offer financing options?",
                a: "Yes, we partner with several financing providers to offer flexible payment plans. You can view available options during the checkout process."
            }
        ]
    },
    {
        category: "Shipping & Delivery",
        icon: Truck,
        questions: [
            {
                id: "s1",
                q: "What are your shipping rates?",
                a: "Shipping rates vary based on the item size and your location. Small items typically ship for a flat rate, while white-glove delivery for large furniture is calculated at checkout."
            },
            {
                id: "s2",
                q: "How long will it take to receive my order?",
                a: "Standard shipping takes 5-7 business days for in-stock items. Custom or larger furniture pieces may take 4-8 weeks. You can track your order status in the 'Track Order' section of our website."
            },
            {
                id: "s3",
                q: "Do you ship internationally?",
                a: "Currently, we ship to the continental United States and select European countries. We are working on expanding our international reach soon."
            }
        ]
    },
    {
        category: "Returns & Exchanges",
        icon: RotateCcw,
        questions: [
            {
                id: "r1",
                q: "What is your return policy?",
                a: "We offer a 30-day return policy for most items in their original condition. Custom-made pieces are't eligible for return unless they arrive damaged or defective."
            },
            {
                id: "r2",
                q: "How do I start a return?",
                a: "To initiate a return, log into your account, go to your 'Order History', and select the item you wish to return. You will receive a return label and instructions via email."
            }
        ]
    },
    {
        category: "AR Features",
        icon: Smartphone,
        questions: [
            {
                id: "a1",
                q: "How does the AR 'View in Room' feature work?",
                a: "Simply browse a product on your mobile device and tap the 'View in AR' button. Our application uses your phone's camera to place a digital 3D model of the furniture in your space at actual scale."
            },
            {
                id: "a2",
                q: "Which devices support AR features?",
                a: "Most modern iOS (iPhone 6s and later) and Android devices with ARCore support are compatible. Ensure your browser is up to date for the best experience."
            }
        ]
    }
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeId, setActiveId] = useState(null);

    const toggleAccordion = (id) => {
        setActiveId(activeId === id ? null : id);
    };

    const filteredFaqs = faqData.map(cat => ({
        ...cat,
        questions: cat.questions.filter(q =>
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.questions.length > 0);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-stone-50 font-dm-sans pt-32 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-playfair font-bold text-gray-950 mb-6"
                        >
                            Frequently Asked <span className="italic text-teal-700">Questions</span>
                        </motion.h1>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
                            Find answers to common questions about our products, ordering process, shipping, and augmented reality features.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for answers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border border-gray-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* FAQ Sections */}
                    <div className="space-y-12">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((category) => (
                                <div key={category.category} className="space-y-4">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700">
                                            <category.icon size={20} />
                                        </div>
                                        <h2 className="text-2xl font-playfair font-semibold text-gray-900">
                                            {category.category}
                                        </h2>
                                    </div>

                                    <div className="grid gap-3">
                                        {category.questions.map((item) => (
                                            <div
                                                key={item.id}
                                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
                                            >
                                                <button
                                                    onClick={() => toggleAccordion(item.id)}
                                                    className="w-full px-6 py-5 flex items-center justify-between text-left group"
                                                >
                                                    <span className={`text-lg font-medium transition-colors duration-300 ${activeId === item.id ? 'text-teal-700' : 'text-gray-800'}`}>
                                                        {item.q}
                                                    </span>
                                                    <div className={`shrink-0 ml-4 w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center transition-all duration-300 ${activeId === item.id ? 'bg-teal-700 border-teal-700 text-white rotate-180' : 'text-gray-400 group-hover:border-teal-700 group-hover:text-teal-700'}`}>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                </button>

                                                <AnimatePresence>
                                                    {activeId === item.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                                        >
                                                            <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-50 pt-4">
                                                                {item.a}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="mt-4 text-teal-700 font-medium hover:underline"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Still have questions? */}
                    <div className="mt-20 p-10 bg-teal-900 rounded-3xl text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-800/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                        <div className="relative z-10">
                            <h3 className="text-3xl font-playfair font-bold mb-4">Still have questions?</h3>
                            <p className="text-teal-100 mb-8 max-w-lg mx-auto">
                                Our support team is always here to help. Reach out to us via call or email and we'll get back to you within 24 hours.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/contact"
                                    className="px-8 py-3 bg-white text-teal-900 rounded-full font-bold hover:bg-stone-100 transition-all shadow-lg"
                                >
                                    Contact Support
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

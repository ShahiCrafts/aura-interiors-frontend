import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Megaphone,
  Calendar,
  ArrowLeft,
  Pin,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../layouts/Navbar";
import Footer from "../layouts/Footer";
import { usePublicAnnouncements, usePublicAnnouncement } from "../hooks/useAnnouncementTan";

const TYPE_CONFIG = {
  general: { icon: Info, color: "bg-blue-500", label: "General" },
  maintenance: { icon: AlertTriangle, color: "bg-yellow-500", label: "Maintenance" },
  update: { icon: CheckCircle, color: "bg-green-500", label: "Update" },
  promotion: { icon: Megaphone, color: "bg-purple-500", label: "Promotion" },
  policy: { icon: FileText, color: "bg-gray-500", label: "Policy" },
  event: { icon: Calendar, color: "bg-pink-500", label: "Event" },
};

const PRIORITY_COLORS = {
  low: "border-gray-200",
  normal: "border-blue-200",
  high: "border-orange-300",
  critical: "border-red-400",
};

function AnnouncementCard({ announcement, onClick }) {
  const typeConfig = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.general;
  const TypeIcon = typeConfig.icon;
  const priorityBorder = PRIORITY_COLORS[announcement.priority] || PRIORITY_COLORS.normal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border-2 ${priorityBorder} p-5 cursor-pointer hover:shadow-md transition-all`}
    >
      <div className="flex items-start gap-4">
        {/* Type Badge */}
        <div className={`p-3 rounded-lg ${typeConfig.color} shrink-0`}>
          <TypeIcon className="w-5 h-5 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {announcement.isPinned && (
              <Pin className="w-4 h-4 text-amber-500 shrink-0" />
            )}
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeConfig.color} text-white`}>
              {typeConfig.label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(announcement.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {announcement.title}
          </h3>

          {/* Summary/Content Preview */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {announcement.summary || announcement.content}
          </p>

          {/* Action Button */}
          {announcement.actionUrl && (
            <div className="mt-3">
              <span className="text-amber-600 text-sm font-medium inline-flex items-center gap-1 hover:underline">
                {announcement.actionLabel || "Learn More"}
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          )}
        </div>

        {/* Image Preview */}
        {announcement.imageUrl && (
          <img
            src={announcement.imageUrl}
            alt=""
            className="w-20 h-20 object-cover rounded-lg shrink-0 hidden sm:block"
          />
        )}
      </div>
    </motion.div>
  );
}

function AnnouncementDetail({ announcement, onBack }) {
  const typeConfig = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.general;
  const TypeIcon = typeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header Image */}
      {announcement.imageUrl && (
        <div className="w-full h-48 md:h-64 overflow-hidden">
          <img
            src={announcement.imageUrl}
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Announcements
        </button>

        {/* Type and Date */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${typeConfig.color} text-white text-sm font-medium`}>
            <TypeIcon className="w-4 h-4" />
            {typeConfig.label}
          </div>
          {announcement.isPinned && (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
              <Pin className="w-4 h-4" />
              Pinned
            </div>
          )}
          <span className="text-gray-500 text-sm flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(announcement.publishedAt).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {announcement.title}
        </h1>

        {/* Content */}
        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {announcement.content}
          </p>
        </div>

        {/* Action Button */}
        {announcement.actionUrl && (
          <a
            href={announcement.actionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {announcement.actionLabel || "Learn More"}
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Tags */}
        {announcement.tags && announcement.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {announcement.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AnnouncementsPage() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");

  // Fetch announcements
  const { data: announcementsData, isLoading, error } = usePublicAnnouncements({
    page,
    limit: 10,
    type: typeFilter !== "all" ? typeFilter : undefined,
  });

  const announcements = announcementsData?.data?.announcements || [];
  const pagination = announcementsData?.data?.pagination || {};

  // Fetch single announcement detail when selected
  const { data: detailData, isLoading: detailLoading } = usePublicAnnouncement(
    selectedAnnouncement?._id,
    { enabled: !!selectedAnnouncement }
  );

  const handleSelectAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setSelectedAnnouncement(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <Megaphone className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Announcements
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Stay updated with the latest news, updates, and important information from Aura Interiors.
            </p>
          </div>

          {/* Show detail view or list view */}
          <AnimatePresence mode="wait">
            {selectedAnnouncement ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {detailLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  </div>
                ) : (
                  <AnnouncementDetail
                    announcement={detailData?.data?.announcement || selectedAnnouncement}
                    onBack={handleBack}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Type Filter */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                  <button
                    onClick={() => { setTypeFilter("all"); setPage(1); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      typeFilter === "all"
                        ? "bg-amber-600 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => { setTypeFilter(key); setPage(1); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                          typeFilter === key
                            ? "bg-amber-600 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </button>
                    );
                  })}
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-gray-500">Failed to load announcements. Please try again later.</p>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No announcements at the moment.</p>
                    <p className="text-gray-400 text-sm mt-1">Check back later for updates!</p>
                  </div>
                ) : (
                  <>
                    {/* Announcements List */}
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <AnnouncementCard
                          key={announcement._id}
                          announcement={announcement}
                          onClick={() => handleSelectAnnouncement(announcement)}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                        <span className="text-gray-600">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                          disabled={page === pagination.totalPages}
                          className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}

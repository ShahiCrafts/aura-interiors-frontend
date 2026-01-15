import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Clock,
  Heart,
  Bookmark,
  ChevronDown,
  ArrowRight,
  Loader2,
} from "lucide-react";
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";
import { useBlogs, useBlogCategories, usePopularBlogs, useToggleBlogLike } from "../../hooks/blog/useBlogTan";
import { getBlogImageUrl, getAvatarUrl } from "../../utils/imageUrl";
import Skeleton from "../../components/common/Skeleton";
import { useNewsletterSubscribe } from "../../hooks/newsletter/useNewsletterTan";

export default function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [savedPosts, setSavedPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [page, setPage] = useState(1);

  // Fetch blogs
  const {
    data: blogsData,
    isLoading: blogsLoading,
    isFetching,
  } = useBlogs({
    page,
    limit: 10,
    category: activeCategory !== "all" ? activeCategory : undefined,
    search: searchQuery || undefined,
  });

  // Fetch categories
  const { data: categoriesData } = useBlogCategories();

  // Fetch popular blogs
  const { data: popularData } = usePopularBlogs(3);

  const { mutate: toggleLike } = useToggleBlogLike();
  const { mutate: subscribeNewsletter, isPending: isSubscribing } = useNewsletterSubscribe();

  const blogs = blogsData?.data?.blogs || [];
  const pagination = blogsData?.data?.pagination || {};
  const categories = categoriesData?.data?.categories || [
    { slug: "all", name: "All", count: 0 },
  ];
  const popularPosts = popularData?.data?.blogs || [];

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const handleCategoryChange = (slug) => {
    setActiveCategory(slug);
    setPage(1);
  };

  const toggleSaved = (postId) => {
    setSavedPosts((prev) =>
      prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleLiked = (postId) => {
    const isLiked = likedPosts.includes(postId);
    setLikedPosts((prev) =>
      isLiked ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
    // Only increment likes if not already liked (simple counter, no unlike)
    if (!isLiked) {
      toggleLike(postId);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    subscribeNewsletter({ email: newsletterEmail, source: 'blog' }, {
      onSuccess: () => {
        setNewsletterEmail("");
      }
    });
  };

  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      setPage((prev) => prev + 1);
    }
  };

  const getImageUrl = (imagePath) => getBlogImageUrl(imagePath);

  const getAuthorAvatar = (author) => getAvatarUrl(author, author?.name || 'Author');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white font-dm-sans">
        {/* Hero Section */}
        <section className="pt-24 sm:pt-28 md:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-medium text-neutral-900 mb-4">
              Design Inspiration{" "}
              <span className="italic text-teal-700">&amp; Ideas</span>
            </h1>
            <p className="text-neutral-600 text-base sm:text-lg">
              Explore our collection of articles, tips, and trends to inspire
              your next interior design project.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-8 sm:mb-12">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories
                .slice(0, showMoreCategories ? categories.length : 5)
                .map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => handleCategoryChange(category.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${activeCategory === category.slug
                      ? "bg-teal-700 text-white"
                      : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              {categories.length > 5 && (
                <button
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                  className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-all duration-200 flex items-center gap-1"
                >
                  {showMoreCategories ? "Show less" : "+ view more"}
                </button>
              )}
            </div>

            {/* Search Input */}
            <form
              onSubmit={handleSearch}
              className="relative w-full sm:w-auto sm:ml-auto mt-3 sm:mt-0"
            >
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-full border border-neutral-300 text-sm focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 transition-all"
              />
            </form>
          </div>
        </section>

        {/* Main Content */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Blog Posts Grid */}
            <div className="flex-1">
              {blogsLoading ? (
                <div className="space-y-8">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col sm:flex-row gap-6 animate-pulse">
                      <Skeleton className="w-full sm:w-64 md:w-72 h-48 sm:h-44 md:h-48 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-4 py-2">
                        <div className="flex gap-2">
                          <Skeleton className="w-20 h-6 rounded-full" />
                          <Skeleton className="w-24 h-4" />
                        </div>
                        <Skeleton className="w-full h-8" />
                        <Skeleton className="w-full h-4" />
                        <Skeleton className="w-2/3 h-4" />
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <div className="space-y-1">
                              <Skeleton className="w-24 h-3" />
                              <Skeleton className="w-16 h-2" />
                            </div>
                          </div>
                          <Skeleton className="w-24 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : blogs.length > 0 ? (
                <div className="space-y-6 sm:space-y-8">
                  {blogs.map((post) => (
                    <BlogCard
                      key={post._id}
                      post={post}
                      isSaved={savedPosts.includes(post._id)}
                      isLiked={likedPosts.includes(post._id)}
                      onToggleSaved={() => toggleSaved(post._id)}
                      onToggleLiked={() => toggleLiked(post._id)}
                      getImageUrl={getImageUrl}
                      getAuthorAvatar={getAuthorAvatar}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-neutral-500 text-lg">
                    No articles found matching your criteria.
                  </p>
                </div>
              )}

              {/* Load More Button */}
              {pagination.page < pagination.pages && (
                <div className="flex justify-center mt-10 sm:mt-12">
                  <button
                    onClick={loadMore}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-300 text-neutral-700 font-medium hover:bg-neutral-50 transition-all duration-200 disabled:opacity-50"
                  >
                    {isFetching ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                    Load More Articles
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-80 shrink-0">
              {/* Popular This Week */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-5 font-playfair">
                  Popular This Week
                </h3>
                <div className="space-y-4">
                  {popularPosts.map((post, index) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="flex gap-3 group"
                    >
                      <span className="text-teal-700 font-semibold text-sm">
                        0{index + 1}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-neutral-800 group-hover:text-teal-700 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-neutral-500 mt-1">
                          {post.readTime} min read
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-teal-700 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-2 font-playfair">
                  Join Our Newsletter
                </h3>
                <p className="text-teal-100 text-sm mb-4">
                  Get the latest design tips and trends delivered to your inbox.
                </p>
                <form onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-teal-600/50 border border-teal-500 text-white placeholder:text-teal-200 text-sm focus:outline-none focus:border-white transition-colors mb-3"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="w-full py-2.5 rounded-lg bg-white text-teal-700 font-semibold text-sm hover:bg-teal-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubscribing ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}

function BlogCard({
  post,
  isSaved,
  isLiked,
  onToggleSaved,
  onToggleLiked,
  getImageUrl,
  getAuthorAvatar,
}) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    : new Date(post.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <article className="flex flex-col sm:flex-row gap-4 sm:gap-6 group">
      {/* Image */}
      <Link
        to={`/blog/${post.slug}`}
        className="relative w-full sm:w-64 md:w-72 h-48 sm:h-44 md:h-48 shrink-0 rounded-xl overflow-hidden"
      >
        <img
          src={getImageUrl(post.featuredImage)}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Bookmark Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSaved();
          }}
          className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <Bookmark
            size={16}
            className={
              isSaved
                ? "fill-neutral-800 text-neutral-800"
                : "text-neutral-600"
            }
          />
        </button>
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center py-1">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          <span className="px-3 py-1 bg-teal-700 text-white text-xs font-semibold rounded-full uppercase tracking-wide">
            {post.categoryName || post.category}
          </span>
          <span className="flex items-center gap-1 text-neutral-500 text-sm">
            <Clock size={14} />
            {post.readTime} min read
          </span>
          <button onClick={onToggleLiked} className="ml-auto sm:hidden">
            <Heart
              size={18}
              className={
                isLiked ? "fill-red-500 text-red-500" : "text-neutral-400"
              }
            />
          </button>
        </div>

        {/* Title */}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2 font-playfair">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        <p className="text-neutral-600 text-sm line-clamp-2 mb-4">
          {post.excerpt}
        </p>

        {/* Source & Author */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={getAuthorAvatar(post.author)}
              alt={post.author?.name || "Author"}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {post.author?.name || "Editorial Team"}
              </p>
              <p className="text-xs text-neutral-500">
                {post.source?.name ? `${post.source.name} • ` : ''}{formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onToggleLiked} className="hidden sm:block">
              <Heart
                size={18}
                className={
                  isLiked
                    ? "fill-red-500 text-red-500"
                    : "text-neutral-400 hover:text-neutral-600"
                }
              />
            </button>
            <Link
              to={`/blog/${post.slug}`}
              className="flex items-center gap-1 text-teal-700 font-medium text-sm hover:gap-2 transition-all"
            >
              Read More
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

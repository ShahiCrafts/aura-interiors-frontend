import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Clock,
  Calendar,
  Facebook,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  ArrowLeft,
  Loader2,
  Eye,
  Heart,
} from "lucide-react";
import Navbar from "../../layouts/customer/Navbar";
import Footer from "../../layouts/customer/Footer";
import { useBlog, useRelatedBlogs } from "../../hooks/blog/useBlogTan";
import { getBlogImageUrl, getAvatarUrl } from "../../utils/imageUrl";

export default function BlogDetailsPage() {
  const { slug } = useParams();
  const [activeSection, setActiveSection] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch blog
  const { data: blogData, isLoading, error } = useBlog(slug);
  const blog = blogData?.data?.blog;

  // Fetch related blogs
  const { data: relatedData } = useRelatedBlogs(blog?._id, 3);
  const relatedBlogs = relatedData?.data?.blogs || [];

  // Extract sections from content for TOC
  const sections = blog?.content
    ? extractSections(blog.content)
    : [];

  // Track scroll position for TOC highlighting
  useEffect(() => {
    if (sections.length === 0) return;

    const handleScroll = () => {
      const sectionElements = sections.map((s) =>
        document.getElementById(s.id)
      );
      const scrollPosition = window.scrollY + 150;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnSocial = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(blog?.title || "");

    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`,
    };

    window.open(links[platform], "_blank", "width=600,height=400");
  };

  const getImageUrl = (imagePath) => getBlogImageUrl(imagePath);

  const getAuthorAvatar = (author) => getAvatarUrl(author, author?.name || 'Author');

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white font-dm-sans flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-700" />
        </main>
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-white font-dm-sans">
          <div className="pt-32 pb-16 text-center">
            <h1 className="text-2xl font-playfair text-neutral-900 mb-4">
              Blog post not found
            </h1>
            <Link
              to="/blog"
              className="text-teal-700 hover:underline flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    : new Date(blog.createdAt).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white font-dm-sans">
        {/* Header Section */}
        <section className="pt-24 sm:pt-28 md:pt-32 pb-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link
              to="/blog"
              className="text-neutral-500 hover:text-teal-700 text-sm flex items-center gap-1"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Link>
          </div>

          {/* Category Badge */}
          <span className="inline-block px-3 py-1 bg-teal-700 text-white text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
            {blog.categoryName || blog.category}
          </span>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-playfair font-medium text-neutral-900 mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* Excerpt */}
          <p className="text-neutral-600 text-base sm:text-lg mb-6">
            {blog.excerpt}
          </p>

          {/* Meta & Share */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Clock size={16} />
                {blog.readTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={16} />
                {formattedDate}
              </span>
              {blog.views > 0 && (
                <span className="flex items-center gap-1.5">
                  <Eye size={16} />
                  {blog.views} views
                </span>
              )}
              {blog.likes > 0 && (
                <span className="flex items-center gap-1.5">
                  <Heart size={16} />
                  {blog.likes} likes
                </span>
              )}
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-500 mr-1">Share:</span>
              <button
                onClick={() => shareOnSocial("facebook")}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-blue-100 hover:text-blue-600 flex items-center justify-center transition-colors"
              >
                <Facebook size={16} />
              </button>
              <button
                onClick={() => shareOnSocial("twitter")}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-sky-100 hover:text-sky-500 flex items-center justify-center transition-colors"
              >
                <Twitter size={16} />
              </button>
              <button
                onClick={() => shareOnSocial("linkedin")}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-blue-100 hover:text-blue-700 flex items-center justify-center transition-colors"
              >
                <Linkedin size={16} />
              </button>
              <button
                onClick={copyLink}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-teal-100 hover:text-teal-700 flex items-center justify-center transition-colors relative"
              >
                <LinkIcon size={16} />
                {copied && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-neutral-800 text-white px-2 py-1 rounded whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        {blog.featuredImage && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-8">
            <img
              src={getImageUrl(blog.featuredImage)}
              alt={blog.title}
              className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl"
            />
          </section>
        )}

        {/* Main Content */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Article Content */}
            <article className="flex-1 max-w-4xl">
              {/* Content */}
              <div
                className="prose prose-lg max-w-none text-neutral-700 leading-relaxed
                  prose-headings:font-playfair prose-headings:text-neutral-900
                  prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                  prose-p:mb-4
                  prose-a:text-teal-700 prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-neutral-800
                  prose-ul:my-4 prose-li:my-1
                  prose-img:rounded-xl prose-img:my-6"
                dangerouslySetInnerHTML={{ __html: renderContent(blog.content) }}
              />

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-10 pt-6 border-t border-neutral-200">
                  <p className="text-sm text-neutral-500 mb-3">Topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {blog.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm rounded-full hover:bg-neutral-200 transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Source & Author Card */}
              <div className="flex flex-col gap-4 p-6 bg-neutral-50 rounded-xl mt-10">
                {/* Source Info */}
                {blog.source && (
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      {blog.source.logo && (
                        <img
                          src={blog.source.logo}
                          alt={blog.source.name}
                          className="h-8 w-auto object-contain"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                      <div>
                        <p className="text-sm text-neutral-500">Originally published on</p>
                        <p className="font-medium text-neutral-900">{blog.source.name}</p>
                      </div>
                    </div>
                    {blog.originalUrl && (
                      <a
                        href={blog.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-teal-700 hover:underline"
                      >
                        Read Original
                      </a>
                    )}
                  </div>
                )}

                {/* Author Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={getAuthorAvatar(blog.author)}
                    alt={blog.author?.name || "Author"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-neutral-900">
                      {blog.author?.name || "Editorial Team"}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {blog.source?.name || "Aura Interiors"}
                    </p>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar - Table of Contents */}
            {sections.length > 0 && (
              <aside className="hidden lg:block w-72 shrink-0">
                <div className="sticky top-28">
                  <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">
                      Table of Contents
                    </h3>
                    <nav className="space-y-1">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${activeSection === section.id
                            ? "bg-teal-50 text-teal-700 font-medium border-l-2 border-teal-700"
                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                            }`}
                        >
                          {section.title}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>

        {/* Related Posts */}
        {relatedBlogs.length > 0 && (
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
            <h2 className="text-2xl font-playfair font-semibold text-neutral-900 mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((relatedBlog) => (
                <Link
                  key={relatedBlog._id}
                  to={`/blog/${relatedBlog.slug}`}
                  className="group"
                >
                  <div className="relative h-48 rounded-xl overflow-hidden mb-4">
                    <img
                      src={getImageUrl(relatedBlog.featuredImage)}
                      alt={relatedBlog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="font-semibold text-neutral-900 group-hover:text-teal-700 transition-colors line-clamp-2 mb-2">
                    {relatedBlog.title}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {relatedBlog.readTime} min read
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
}

// Helper function to extract sections from content for TOC
function extractSections(content) {
  const sections = [];
  const headingRegex = /<h2[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h2>/gi;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    sections.push({
      id: match[1],
      title: match[2],
    });
  }

  // If no h2 with IDs, try to extract from plain h2 tags
  if (sections.length === 0) {
    const simpleHeadingRegex = /<h2[^>]*>([^<]*)<\/h2>/gi;
    let index = 0;
    while ((match = simpleHeadingRegex.exec(content)) !== null) {
      const id = `section-${index}`;
      sections.push({
        id,
        title: match[1],
      });
      index++;
    }
  }

  return sections;
}

// Helper function to render content with proper IDs for TOC
function renderContent(content) {
  if (!content) return "";

  // Add IDs to h2 tags if they don't have them
  let index = 0;
  return content.replace(/<h2([^>]*)>([^<]*)<\/h2>/gi, (match, attrs, text) => {
    if (attrs.includes('id="')) {
      return match;
    }
    const id = `section-${index}`;
    index++;
    return `<h2${attrs} id="${id}">${text}</h2>`;
  });
}

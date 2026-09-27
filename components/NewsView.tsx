import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Newspaper, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ChevronRight, 
  ChevronLeft, 
  ArrowLeft, 
  Share2, 
  Check, 
  Sparkles, 
  Tag, 
  Bookmark, 
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Sliders,
  Filter
} from 'lucide-react';
import { Article } from '../types';
import { subscribeToPublishedArticles } from '../services/articleService';
import { ArticleContentRenderer } from './ArticleContentRenderer';
import { Link, useNavigate } from 'react-router-dom';

interface NewsViewProps {
  initialSlug?: string | null;
  onNavigateHome?: () => void;
  onBack?: () => void;
  isAdminUser?: boolean;
}

export const NewsView: React.FC<NewsViewProps> = ({ 
  initialSlug, 
  onNavigateHome,
  onBack,
  isAdminUser = false 
}) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Search & category filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Carousel gallery state (for the top 3 most recent articles)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHoveringGallery, setIsHoveringGallery] = useState(false);

  // Link copy toast
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll to top on mount or when reading an article
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedArticle]);

  // Subscribe to published articles from Firestore (with fallback)
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPublishedArticles((loaded) => {
      setArticles(loaded);
      setLoading(false);

      // Check if URL or prop specified a specific article by slug or id
      const params = new URLSearchParams(window.location.search);
      const targetSlug = initialSlug || params.get('article');
      if (targetSlug) {
        const found = loaded.find(a => a.slug === targetSlug || a.id === targetSlug);
        if (found) {
          setSelectedArticle(found);
        }
      }
    });

    return () => unsubscribe();
  }, [initialSlug]);

  // Most recent three articles for the gallery rotation at the top
  const topThreeArticles = useMemo(() => {
    return articles.slice(0, 3);
  }, [articles]);

  // Auto-rotate gallery every 6 seconds when not hovered and not viewing an article
  useEffect(() => {
    if (topThreeArticles.length <= 1 || isHoveringGallery || selectedArticle) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % topThreeArticles.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [topThreeArticles.length, isHoveringGallery, selectedArticle]);

  // Available categories
  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    articles.forEach(a => {
      if (a.category) cats.add(a.category);
    });
    return Array.from(cats);
  }, [articles]);

  // Filtered articles for the grid below the gallery
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (selectedCategory !== 'All' && article.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesExcerpt = article.excerpt?.toLowerCase().includes(q) || false;
        const matchesAuthor = article.authorName.toLowerCase().includes(q);
        const matchesCategory = article.category?.toLowerCase().includes(q) || false;
        return matchesTitle || matchesExcerpt || matchesAuthor || matchesCategory;
      }
      return true;
    });
  }, [articles, selectedCategory, searchQuery]);

  const handleOpenArticle = (article: Article) => {
    setSelectedArticle(article);
    window.history.pushState({}, '', `/news?article=${article.slug}`);
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    window.history.pushState({}, '', '/news');
  };

  const handleCopyLink = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return 'Recent';
    try {
      return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const calculateReadTime = (content?: string) => {
    if (!content) return 1;
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  // -------------------------------------------------------------
  // VIEW: SINGLE ARTICLE READER
  // -------------------------------------------------------------
  if (selectedArticle) {
    const currentArticle = selectedArticle;
    const readTime = calculateReadTime(currentArticle.content);
    const related = articles.filter(a => a.id !== currentArticle.id).slice(0, 3);

    return (
      <div className="min-h-screen bg-[#FAFAFC] text-slate-900 pb-20">
        
        {/* Sticky Top Navigation Bar */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button
              type="button"
              onClick={handleBackToList}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5856D6] hover:text-[#4341B8] transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to News &amp; Articles
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Share article link"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {isAdminUser && (
                <Link
                  to="/beginfin-admins"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-black text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3 text-[#7F7FFA]" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Article Reader Body */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          <article className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-12">
            
            {/* Header Metadata */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-indigo-50 text-[#5856D6] rounded-full text-xs font-bold uppercase tracking-wider ring-1 ring-[#7F7FFA]/30">
                  {currentArticle.category || 'Perspectives'}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(currentArticle.publishedAt)}
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {readTime} min read
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
                {currentArticle.title}
              </h1>

              {currentArticle.excerpt && (
                <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed pt-1">
                  {currentArticle.excerpt}
                </p>
              )}

              {/* Author Attribution Card */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#5856D6] to-[#7F7FFA] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {currentArticle.authorName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {currentArticle.authorName}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {currentArticle.authorDetails || 'BeginFin Contributor'}
                  </p>
                </div>
              </div>
            </div>

            {/* Cover Hero Image */}
            {currentArticle.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden mb-10 shadow-sm border border-slate-100">
                <img
                  src={currentArticle.imageUrl}
                  alt={currentArticle.title}
                  className="w-full h-auto max-h-[480px] object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Formatted Content */}
            <div className="text-slate-800 text-lg leading-relaxed space-y-6">
              <ArticleContentRenderer content={currentArticle.content} />
            </div>

            {/* Bottom Author Bio & About BeginFin */}
            <div className="mt-14 pt-8 border-t border-slate-200/80 bg-slate-50/70 -mx-6 -mb-6 sm:-mx-12 sm:-mb-12 p-6 sm:p-10 rounded-b-3xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#5856D6]">
                    About BeginFin
                  </span>
                  <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                    BeginFin is a 100% open-access, zero-cost personal finance initiative founded in Temple, Texas. Built by students for students, featuring 18 global languages and verifiable credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onNavigateHome || (() => navigate('/'))}
                  className="px-5 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                >
                  Explore Curriculum
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </article>

          {/* Related Articles Section */}
          {related.length > 0 && (
            <div className="mt-14 space-y-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                More from BeginFin News
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {related.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => handleOpenArticle(rel)}
                    className="group bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    {rel.imageUrl && (
                      <div className="h-32 rounded-xl overflow-hidden mb-3">
                        <img 
                          src={rel.imageUrl} 
                          alt={rel.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-bold text-[#5856D6] uppercase tracking-wider block mb-1">
                        {rel.category || 'Article'}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#5856D6] transition-colors line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span>{formatDate(rel.publishedAt)}</span>
                      <span className="text-[#5856D6] font-semibold flex items-center gap-0.5">
                        Read <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: NEWS HOME WITH GALLERY ROTATION AT TOP
  // -------------------------------------------------------------
  const activeSlide = topThreeArticles[currentSlideIndex] || topThreeArticles[0];

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 pb-24">
      
      {/* Top Header Banner */}
      <header className="bg-gradient-to-b from-white to-[#FAFAFC] border-b border-slate-200/70 pt-10 pb-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECECFC] text-[#5856D6] rounded-full text-xs font-bold tracking-wide uppercase ring-1 ring-[#7F7FFA]/30">
              <Newspaper className="w-3.5 h-3.5" />
              <span>BeginFin Dispatches &amp; Perspectives</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight font-['Source_Sans_3',sans-serif]">
              News &amp; Updates
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl font-normal">
              Official announcements, curriculum enhancements, financial guides, and open educational milestones from the BeginFin team.
            </p>
          </div>

          {isAdminUser && (
            <Link
              to="/beginfin-admins"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#5856D6] hover:bg-[#4341B8] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer self-start md:self-auto"
            >
              <Sliders className="w-3.5 h-3.5" />
              Manage Articles in Admin Panel
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-12">

        {/* ----------------------------------------------------------- */}
        {/* GALLERY-STYLE ROTATION AT TOP (Most Recent 3 Articles)       */}
        {/* ----------------------------------------------------------- */}
        {topThreeArticles.length > 0 && activeSlide && (
          <section 
            aria-label="Featured News Gallery"
            onMouseEnter={() => setIsHoveringGallery(true)}
            onMouseLeave={() => setIsHoveringGallery(false)}
            className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 bg-slate-950 group"
          >
            {/* Cinematic Slide Container */}
            <div className="relative min-h-[400px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-end">
              
              {/* Cover Image Background with Smooth Crossfade */}
              {activeSlide.imageUrl ? (
                <img
                  src={activeSlide.imageUrl}
                  alt={activeSlide.title}
                  className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 brightness-[0.65] group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#2A2B4A] to-slate-900" />
              )}

              {/* Multilayer gradient for extreme readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

              {/* Slide Content */}
              <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-3xl space-y-3.5">
                
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
                    {activeSlide.category || 'Featured Announcement'}
                  </span>
                  <span className="text-white/60 text-xs">•</span>
                  <span className="text-white/80 text-xs font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(activeSlide.publishedAt)}
                  </span>
                  <span className="text-white/60 text-xs">•</span>
                  <span className="text-white/80 text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {calculateReadTime(activeSlide.content)} min read
                  </span>
                </div>

                <h2 
                  onClick={() => handleOpenArticle(activeSlide)}
                  className="text-2xl sm:text-4xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight cursor-pointer hover:text-[#B4B4FF] transition-colors"
                >
                  {activeSlide.title}
                </h2>

                {activeSlide.excerpt && (
                  <p className="text-sm sm:text-base text-slate-200 line-clamp-2 font-normal leading-relaxed max-w-2xl drop-shadow-sm">
                    {activeSlide.excerpt}
                  </p>
                )}

                <div className="pt-3 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleOpenArticle(activeSlide)}
                    className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 rounded-full text-xs font-extrabold tracking-wide uppercase transition-all shadow-lg active:scale-95 cursor-pointer inline-flex items-center gap-2"
                  >
                    Read Full Story
                    <ChevronRight className="w-4 h-4 text-[#5856D6]" />
                  </button>

                  <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
                    <span>By <strong className="font-bold text-white">{activeSlide.authorName}</strong></span>
                  </div>
                </div>

              </div>

              {/* Prev / Next Carousel Navigation Arrows */}
              {topThreeArticles.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + topThreeArticles.length) % topThreeArticles.length)}
                    aria-label="Previous featured story"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % topThreeArticles.length)}
                    aria-label="Next featured story"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Dot Indicators & Tab Controls at the bottom of the gallery */}
              {topThreeArticles.length > 1 && (
                <div className="relative z-10 px-6 sm:px-10 pb-4 pt-2 flex items-center justify-between border-t border-white/10 bg-black/30 backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    {topThreeArticles.map((art, idx) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => setCurrentSlideIndex(idx)}
                        aria-label={`Jump to slide ${idx + 1}`}
                        className={`transition-all rounded-full cursor-pointer ${
                          idx === currentSlideIndex 
                            ? 'w-8 h-2 bg-[#7F7FFA]' 
                            : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-[11px] font-bold tracking-wider uppercase text-white/70">
                    Story {currentSlideIndex + 1} of {topThreeArticles.length}
                  </div>
                </div>
              )}

            </div>
          </section>
        )}

        {/* ----------------------------------------------------------- */}
        {/* ALL ARTICLES FEED & FILTERS                                 */}
        {/* ----------------------------------------------------------- */}
        <section className="space-y-6">
          
          {/* Controls Bar: Search & Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles & guides..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-[#7F7FFA] focus:border-transparent placeholder:text-slate-400"
              />
            </div>

          </div>

          {/* Article Grid */}
          {filteredArticles.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No articles found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No published articles matched your search or category filter. Try clearing your filters or search terms.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  onClick={() => handleOpenArticle(article)}
                  className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col cursor-pointer hover:-translate-y-1"
                >
                  {/* Card Cover Image */}
                  {article.imageUrl && (
                    <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[#5856D6] rounded-md text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                          {article.category || 'Article'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Card Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(article.publishedAt)}
                        </span>
                        <span>•</span>
                        <span>{calculateReadTime(article.content)} min read</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-950 group-hover:text-[#5856D6] transition-colors leading-snug line-clamp-2">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                          {article.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[180px]">
                        {article.authorName}
                      </span>
                      <span className="text-[#5856D6] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                        Read Story <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                </article>
              ))}
            </div>
          )}

        </section>

      </main>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Save, 
  Send, 
  Eye, 
  Edit3, 
  Columns, 
  Image as ImageIcon, 
  Upload, 
  Link as LinkIcon, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered, 
  Code, 
  Minus, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Calendar, 
  User, 
  Tag, 
  Clock, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { Article } from '../types';
import { ArticleContentRenderer } from './ArticleContentRenderer';

interface ArticleEditorProps {
  initialArticle?: Partial<Article> | null;
  onSave: (article: Article) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

const PRESET_COVER_IMAGES = [
  {
    label: 'Campus & Grad',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1600&auto=format&fit=crop'
  },
  {
    label: 'Finance & Analytics',
    url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1600&auto=format&fit=crop'
  },
  {
    label: 'Modern Tech & AI',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop'
  },
  {
    label: 'Personal Budgeting',
    url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1600&auto=format&fit=crop'
  },
  {
    label: 'Classroom & Learning',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1600&auto=format&fit=crop'
  },
  {
    label: 'Economic Growth',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop'
  }
];

const CATEGORIES = [
  'Announcements',
  'Financial Literacy',
  'Curriculum Updates',
  'Technology',
  'Student Stories',
  'Teacher Perspectives',
  'General'
];

export const ArticleEditor: React.FC<ArticleEditorProps> = ({
  initialArticle,
  onSave,
  onClose,
  isSaving
}) => {
  const isEditing = Boolean(initialArticle?.id);

  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [category, setCategory] = useState(initialArticle?.category || 'Announcements');
  const [authorName, setAuthorName] = useState(initialArticle?.authorName || 'Vishnu Kakarla');
  const [authorDetails, setAuthorDetails] = useState(initialArticle?.authorDetails || 'BeginFin Editorial Team');
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [content, setContent] = useState(initialArticle?.content || '');
  const [imageUrl, setImageUrl] = useState(initialArticle?.imageUrl || '');
  const [status, setStatus] = useState<'draft' | 'published'>(initialArticle?.status || 'draft');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialArticle?.isFeatured || false);

  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from title if not manually edited
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!isEditing || !slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  // Text insertion toolbar helpers
  const insertTextAtCursor = (before: string, after: string = '', defaultPlaceholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultPlaceholder;
    const replacement = before + selectedText + after;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter URL (e.g. https://begin-fin.com):', 'https://');
    if (url && url !== 'https://') {
      insertTextAtCursor('[', `](${url})`, 'Link Text');
    }
  };

  const handleInsertKeyTakeaway = () => {
    insertTextAtCursor(
      '\n> **Key Takeaway**: ',
      '\n',
      'Enter the most critical financial insight here for students.'
    );
  };

  // Cover image file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Limit file size to 2MB to prevent large memory overhead
    if (file.size > 2.5 * 1024 * 1024) {
      alert('Image file size must be less than 2.5MB. For best performance, use an external image URL.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImageUrl(dataUrl);
        setShowImagePicker(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Word count & read time calculation
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleSubmit = async (targetStatus?: 'draft' | 'published') => {
    setFormError(null);

    const finalTitle = title.trim();
    if (!finalTitle) {
      setFormError('Please provide an article title.');
      return;
    }

    const finalSlug = (slug.trim() || generateSlug(finalTitle)) || `article-${Date.now()}`;
    const finalContent = content.trim();
    if (!finalContent) {
      setFormError('Article content cannot be empty.');
      return;
    }

    const finalStatus = targetStatus || status;
    const finalPublishedAt = finalStatus === 'published' 
      ? (initialArticle?.publishedAt || new Date().toISOString())
      : null;

    const articleToSave: Article = {
      id: initialArticle?.id || `art-${Date.now()}`,
      title: finalTitle,
      slug: finalSlug,
      category: category.trim() || 'Announcements',
      excerpt: excerpt.trim() || finalContent.substring(0, 160).replace(/[#*`>]/g, '') + '...',
      content: finalContent,
      authorName: authorName.trim() || 'BeginFin Editorial Team',
      authorDetails: authorDetails.trim(),
      imageUrl: imageUrl.trim(),
      publishedAt: finalPublishedAt,
      updatedAt: new Date().toISOString(),
      status: finalStatus,
      isFeatured: isFeatured
    };

    try {
      await onSave(articleToSave);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save article.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              status === 'published' 
                ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300' 
                : 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
            }`}>
              {status === 'published' ? '● Live Published' : '● Draft Mode'}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
              {isEditing ? `Edit: ${title || 'Untitled'}` : 'Write New Article'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                Write
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>

            {/* Save as Draft CTA */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit('draft')}
              className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </button>

            {/* Direct Publish CTA */}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSubmit('published')}
              className="px-4 py-1.5 bg-[#5856D6] hover:bg-[#4341B8] text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {status === 'published' ? 'Update & Keep Live' : 'Publish to /news'}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors ml-1 cursor-pointer"
              title="Close editor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {formError && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Main Editor Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Section 1: Article Metadata Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              
              {/* Title & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="e.g. BeginFin Reaches 18-Language Milestone in Texas"
                    className="w-full px-3.5 py-2.5 text-lg font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#7F7FFA] focus:border-transparent placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                      <span>URL Slug</span>
                      <button
                        type="button"
                        onClick={() => setSlug(generateSlug(title))}
                        className="text-[11px] text-[#5856D6] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-2.5 h-2.5" /> Sync from title
                      </button>
                    </label>
                    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
                      <span className="shrink-0 font-mono text-slate-400">/news/</span>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                        placeholder="article-slug"
                        className="w-full bg-transparent font-mono text-slate-800 focus:outline-hidden px-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#7F7FFA]"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Author Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Author Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Vishnu Kakarla"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#7F7FFA]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Author Role / Details
                  </label>
                  <input
                    type="text"
                    value={authorDetails}
                    onChange={(e) => setAuthorDetails(e.target.value)}
                    placeholder="e.g. Co-Founder & Lead Developer, BeginFin"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#7F7FFA]"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Summary / Excerpt (displayed in gallery & article cards)</span>
                  <span className="text-[11px] text-slate-400">{excerpt.length} characters</span>
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise, punchy 1-2 sentence overview of the article..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#7F7FFA] resize-none"
                />
              </div>

              {/* Cover Image Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#5856D6]" />
                    Article Cover Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(!showImagePicker)}
                    className="text-xs text-[#5856D6] hover:underline font-semibold cursor-pointer"
                  >
                    {showImagePicker ? 'Close Preset Picker' : 'Choose from Curated Presets'}
                  </button>
                </div>

                {/* Preset image selector grid */}
                {showImagePicker && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-[11px] text-slate-500 font-medium">Click any preset image to apply as cover:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_COVER_IMAGES.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            setImageUrl(preset.url);
                            setShowImagePicker(false);
                          }}
                          className={`group relative h-20 rounded-lg overflow-hidden border-2 text-left cursor-pointer transition-all ${
                            imageUrl === preset.url ? 'border-[#5856D6] ring-2 ring-[#7F7FFA]/40' : 'border-transparent hover:border-slate-300'
                          }`}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.label} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-1.5">
                            <span className="text-[10px] font-bold text-white leading-tight drop-shadow-sm">{preset.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Image URL input & upload */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Paste image URL (https://...) or upload below"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#7F7FFA]"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload File
                  </button>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="shrink-0 px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Cover Image Preview Banner */}
                {imageUrl && (
                  <div className="relative h-40 sm:h-52 rounded-xl overflow-hidden border border-slate-200 group">
                    <img
                      src={imageUrl}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7F7FFA] mb-1">
                        Cover Image Preview
                      </span>
                      <h3 className="text-white font-bold text-base sm:text-lg line-clamp-1">
                        {title || 'Article Title Preview'}
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Rich Text Editor & Formatter Toolbar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Text Editor Toolbar */}
              <div className="px-3 py-2 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center gap-1 text-slate-700">
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('# ', '', 'Heading 1')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Heading 1"
                >
                  <Heading1 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('## ', '', 'Heading 2')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Heading 2"
                >
                  <Heading2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('### ', '', 'Heading 3')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Heading 3"
                >
                  <Heading3 className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-300 mx-1" />

                <button
                  type="button"
                  onClick={() => insertTextAtCursor('**', '**', 'bold text')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Bold (**text**)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('*', '*', 'italic text')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Italic (*text*)"
                >
                  <Italic className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-300 mx-1" />

                <button
                  type="button"
                  onClick={() => insertTextAtCursor('> ', '', 'Quoted text')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Blockquote"
                >
                  <Quote className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('- ', '', 'List item')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('1. ', '', 'First item')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('`', '`', 'code')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Inline Code"
                >
                  <Code className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Insert Hyperlink"
                >
                  <LinkIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => insertTextAtCursor('\n---\n', '', '')}
                  className="p-1.5 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                  title="Divider Line"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-300 mx-1" />

                <button
                  type="button"
                  onClick={handleInsertKeyTakeaway}
                  className="px-2 py-1 bg-[#ECECFC] hover:bg-[#DCDCFC] text-[#5856D6] rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Insert Key Takeaway callout"
                >
                  <Sparkles className="w-3 h-3" />
                  Key Takeaway Box
                </button>

                <div className="ml-auto text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-3">
                  <span>{wordCount} words</span>
                  <span>~{estimatedReadTime} min read</span>
                </div>
              </div>

              {/* Editor / Preview Area */}
              <div className="p-4">
                {viewMode === 'edit' && (
                  <textarea
                    ref={textareaRef}
                    rows={18}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your article in markdown or formatted text... Use headings (#, ##), bullet points (-), quotes (>), or bold (**text**)..."
                    className="w-full font-mono text-sm leading-relaxed text-slate-800 border-0 focus:outline-hidden resize-y min-h-[360px]"
                  />
                )}

                {viewMode === 'preview' && (
                  <div className="min-h-[360px] p-2 sm:p-4 bg-white">
                    <ArticleContentRenderer content={content || '*No content written yet.*'} />
                  </div>
                )}

                {viewMode === 'split' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your article here..."
                      className="w-full font-mono text-xs leading-relaxed text-slate-800 border border-slate-200 rounded-lg p-3 focus:outline-hidden focus:ring-2 focus:ring-[#7F7FFA] resize-none h-[420px]"
                    />
                    <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 overflow-y-auto h-[420px]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                        Live Preview
                      </span>
                      <ArticleContentRenderer content={content || '*Start typing to see live preview...*'} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Status & Publish Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#5856D6] focus:ring-[#7F7FFA] w-4 h-4"
                  />
                  <span>Feature in top rotating gallery</span>
                </label>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSubmit('draft')}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSubmit('published')}
                  className="px-5 py-2 bg-[#5856D6] hover:bg-[#4341B8] text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Now
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

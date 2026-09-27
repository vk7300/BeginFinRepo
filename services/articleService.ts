import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where 
} from '../firebase';
import { Article } from '../types';
import { SEED_ARTICLES } from '../data/seedArticles';

const LOCAL_STORAGE_KEY = 'beginfin_articles_cache_v1';

// Helpers for localStorage sync
function loadCachedArticles(): Article[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read cached articles from localStorage:', err);
  }
  return SEED_ARTICLES;
}

function saveCachedArticles(articles: Article[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
  } catch (err) {
    console.warn('Could not save articles to localStorage:', err);
  }
}

/**
 * Subscribe to all articles (for Admin Panel)
 */
export function subscribeToAllArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Start with cached or seed data
  let localArticles = loadCachedArticles();
  onUpdate(localArticles);

  try {
    const colRef = collection(db, 'articles');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Article[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              id: docSnap.id,
              title: data.title || 'Untitled Article',
              slug: data.slug || docSnap.id,
              content: data.content || '',
              excerpt: data.excerpt || '',
              authorName: data.authorName || 'BeginFin Editorial Team',
              authorDetails: data.authorDetails || '',
              imageUrl: data.imageUrl || '',
              category: data.category || 'General',
              publishedAt: data.publishedAt || null,
              updatedAt: data.updatedAt || new Date().toISOString(),
              status: (data.status === 'draft' || data.status === 'published') ? data.status : 'draft',
              isFeatured: Boolean(data.isFeatured)
            });
          });

          // Sort by publishedAt or updatedAt descending
          loaded.sort((a, b) => {
            const timeA = new Date(a.publishedAt || a.updatedAt).getTime();
            const timeB = new Date(b.publishedAt || b.updatedAt).getTime();
            return timeB - timeA;
          });

          saveCachedArticles(loaded);
          onUpdate(loaded);
        } else {
          // If Firestore collection is empty, use seed articles
          onUpdate(localArticles);
        }
      },
      (err) => {
        console.warn('Admin articles Firestore snapshot notice:', err);
        // Fallback to local
        onUpdate(loadCachedArticles());
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up admin articles listener:', err);
    onUpdate(loadCachedArticles());
    return () => {};
  }
}

/**
 * Subscribe to published articles (for public /news page)
 */
export function subscribeToPublishedArticles(
  onUpdate: (articles: Article[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Start with cached published articles
  const initial = loadCachedArticles().filter(a => a.status === 'published');
  onUpdate(initial);

  try {
    const colRef = collection(db, 'articles');
    const q = query(colRef, where('status', '==', 'published'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const loaded: Article[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            loaded.push({
              id: docSnap.id,
              title: data.title || 'Untitled Article',
              slug: data.slug || docSnap.id,
              content: data.content || '',
              excerpt: data.excerpt || '',
              authorName: data.authorName || 'BeginFin Editorial Team',
              authorDetails: data.authorDetails || '',
              imageUrl: data.imageUrl || '',
              category: data.category || 'General',
              publishedAt: data.publishedAt || null,
              updatedAt: data.updatedAt || new Date().toISOString(),
              status: 'published',
              isFeatured: Boolean(data.isFeatured)
            });
          });

          // Sort by publishedAt desc
          loaded.sort((a, b) => {
            const timeA = new Date(a.publishedAt || a.updatedAt).getTime();
            const timeB = new Date(b.publishedAt || b.updatedAt).getTime();
            return timeB - timeA;
          });

          onUpdate(loaded);
        } else {
          // Fallback to published seed articles if Firestore has none
          const fallback = loadCachedArticles().filter(a => a.status === 'published');
          onUpdate(fallback);
        }
      },
      (err) => {
        console.warn('Published articles Firestore snapshot notice:', err);
        const fallback = loadCachedArticles().filter(a => a.status === 'published');
        onUpdate(fallback);
        if (onError) onError(err);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Error setting up published articles listener:', err);
    const fallback = loadCachedArticles().filter(a => a.status === 'published');
    onUpdate(fallback);
    return () => {};
  }
}

/**
 * Save / Create / Update Article in Firestore (and sync locally)
 */
export async function saveArticle(article: Article): Promise<void> {
  const cleanData: Article = {
    id: article.id.trim(),
    title: article.title.trim(),
    slug: article.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-'),
    content: article.content.trim(),
    excerpt: (article.excerpt || '').trim(),
    authorName: (article.authorName || 'BeginFin Editorial Team').trim(),
    authorDetails: (article.authorDetails || '').trim(),
    imageUrl: (article.imageUrl || '').trim(),
    category: (article.category || 'Announcements').trim(),
    publishedAt: article.status === 'published' ? (article.publishedAt || new Date().toISOString()) : null,
    updatedAt: new Date().toISOString(),
    status: article.status,
    isFeatured: Boolean(article.isFeatured)
  };

  // Update local cache first
  const current = loadCachedArticles();
  const existingIdx = current.findIndex(a => a.id === cleanData.id);
  if (existingIdx >= 0) {
    current[existingIdx] = cleanData;
  } else {
    current.unshift(cleanData);
  }
  saveCachedArticles(current);

  // Write to Firestore
  try {
    const docRef = doc(db, 'articles', cleanData.id);
    await setDoc(docRef, cleanData);
  } catch (err) {
    console.warn('Firestore write warning (persisted locally):', err);
  }
}

/**
 * Delete an article
 */
export async function deleteArticle(articleId: string): Promise<void> {
  // Remove from local cache
  const current = loadCachedArticles().filter(a => a.id !== articleId);
  saveCachedArticles(current);

  try {
    const docRef = doc(db, 'articles', articleId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore delete warning (removed locally):', err);
  }
}

/**
 * Direct 1-click toggle publish status from admin panel
 */
export async function togglePublishStatus(article: Article): Promise<'draft' | 'published'> {
  const nextStatus: 'draft' | 'published' = article.status === 'published' ? 'draft' : 'published';
  const updated: Article = {
    ...article,
    status: nextStatus,
    publishedAt: nextStatus === 'published' ? (article.publishedAt || new Date().toISOString()) : null,
    updatedAt: new Date().toISOString()
  };

  await saveArticle(updated);
  return nextStatus;
}

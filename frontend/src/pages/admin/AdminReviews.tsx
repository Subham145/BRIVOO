import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Star, 
  Search, 
  Trash2, 
  MessageSquare, 
  ThumbsUp, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Package
} from 'lucide-react';

interface ReviewItem {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  productId: string;
  productTitle: string;
  productImage?: string;
}

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRating, setSelectedRating] = useState('All');
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getAllReviews();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id: string, author: string) => {
    if (window.confirm(`Delete review from "${author}"?`)) {
      try {
        await api.deleteReview(id);
        fetchReviews();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filtered = reviews.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.userName.toLowerCase().includes(q) ||
        r.productTitle.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedRating !== 'All' && r.rating !== Number(selectedRating)) return false;
    return true;
  });

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) 
    : '5.0';
  const fiveStars = reviews.filter(r => r.rating === 5).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Reviews Header */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            CUSTOMER SATISFACTION & REPUTATION
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Client Reviews & Testimonials</h2>
          <p className="text-xs text-gray-400">Moderate customer feedback, star ratings, and luxury brand impressions.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Average Rating</p>
            <p className="text-xl font-bold text-[#C5A059] flex items-center justify-center gap-1">
              <span>{avgRating}</span>
              <Star className="w-4 h-4 fill-[#C5A059] text-[#C5A059]" />
            </p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">5-Star Reviews</p>
            <p className="text-xl font-bold text-emerald-400">{fiveStars}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Reviews</p>
            <p className="text-xl font-bold text-white">{reviews.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DFC5] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by reviewer, product, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-bold uppercase text-[10px]">Filter Stars:</span>
          <select
            value={selectedRating}
            onChange={e => setSelectedRating(e.target.value)}
            className="bg-white border border-[#E6DFC5] text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            <option value="All">All Ratings</option>
            <option value="5">5 Stars Only</option>
            <option value="4">4 Stars Only</option>
            <option value="3">3 Stars Only</option>
            <option value="2">2 Stars Only</option>
            <option value="1">1 Star Only</option>
          </select>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {filtered.map(r => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-[#E6DFC5] p-5 shadow-sm hover:border-[#C5A059] transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              
              {/* Product Info Bar */}
              <div className="flex items-center space-x-3 pb-3 border-b border-[#FAF7F2]">
                <img
                  src={r.productImage || '/images/linen_resort_shirt.png'}
                  alt={r.productTitle}
                  className="w-10 h-10 object-cover rounded-lg border border-[#E6DFC5]"
                />
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product</span>
                  <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{r.productTitle}</h4>
                </div>
              </div>

              {/* Star Rating & Reviewer */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < r.rating ? 'fill-[#C5A059] text-[#C5A059]' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="font-bold ml-1 text-gray-800">{r.rating}.0</span>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{r.date}</span>
              </div>

              {/* Review Comment */}
              <p className="text-gray-700 italic bg-[#FAF7F2] p-3 rounded-xl border border-[#E6DFC5]">
                "{r.comment}"
              </p>

            </div>

            {/* Reviewer signature and delete action */}
            <div className="pt-3 border-t border-[#FAF7F2] flex justify-between items-center mt-3">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#141414] text-white flex items-center justify-center font-bold text-[10px]">
                  {r.userName.charAt(0)}
                </div>
                <span className="font-bold text-gray-900">{r.userName}</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                  Verified Patron
                </span>
              </div>

              <button
                onClick={() => handleDeleteReview(r.id, r.userName)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Review"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

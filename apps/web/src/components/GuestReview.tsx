import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Calendar, User, CheckCircle2, ThumbsUp, Sparkles, Plus, X } from 'lucide-react';
import { Review, Branch } from '../types';
import { useReviews, useCreateReview } from '../hooks/useReviews';

interface GuestReviewProps {
  targetId: string;
  targetName: string;
  onReviewAdded?: (newReview: Review) => void;
  currentUser?: { name: string };
}

export default function GuestReview({ targetId, targetName, onReviewAdded, currentUser }: GuestReviewProps) {
  // React Query hook for fetching reviews
  const reviewsQuery = useReviews({ apartmentId: targetId });
  const createReviewMutation = useCreateReview();

  // Map API review type to local Review type for UI compatibility
  const reviews = (reviewsQuery.data?.data ?? []).map((r: any) => ({
    id: r.id,
    targetId: r.apartmentId || r.tourId || targetId,
    guestName: r.customerName || r.guestName || '',
    rating: r.rating,
    comment: r.comment || '',
    date: r.date || (r.createdAt ? r.createdAt.split('T')[0] : ''),
  })) as Review[];

  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [guestName, setGuestName] = useState(currentUser?.name || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Sync current user name if available and not custom edited yet
  useEffect(() => {
    if (currentUser?.name && !guestName) {
      setGuestName(currentUser.name);
    }
  }, [currentUser]);

  // Handle Review Submission via API mutation
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Vui lòng nhập tên của bạn');
      return;
    }
    if (!comment.trim()) {
      alert('Vui lòng nhập nhận xét chi tiết');
      return;
    }

    createReviewMutation.mutate(
      {
        apartmentId: targetId,
        customerName: guestName.trim(),
        rating,
        comment: comment.trim(),
      },
      {
        onSuccess: (createdReview: any) => {
          // Reset Form
          setComment('');
          setShowAddForm(false);
          setSuccessMessage('Cảm ơn bạn đã để lại đánh giá quý giá!');
          setTimeout(() => setSuccessMessage(''), 4000);

          // Trigger Callback to update parent (to update rating count and average score)
          if (onReviewAdded) {
            onReviewAdded({
              id: createdReview.id,
              targetId: createdReview.apartmentId || targetId,
              guestName: createdReview.customerName || guestName.trim(),
              rating: createdReview.rating || rating,
              comment: createdReview.comment || comment.trim(),
              date: createdReview.date || (createdReview.createdAt ? createdReview.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
            });
          }
        },
      }
    );
  };

  // Stats Calculations
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const totalReviewsCount = reviews.length;

  // Star distribution helper
  const getRatingCount = (star: number) => {
    return reviews.filter(r => Math.round(r.rating) === star).length;
  };

  const getRatingPercentage = (star: number) => {
    if (reviews.length === 0) return 0;
    return Math.round((getRatingCount(star) / reviews.length) * 100);
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-100" id="guest-reviews-section">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2" id="reviews-header-title">
            <MessageSquare className="w-5 h-5 text-brand-blue" />
            Nhận Xét & Đánh Giá Từ Khách Hàng
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Đánh giá thực tế từ khách hàng đã lưu trú tại {targetName}</p>
        </div>

        {/* Write a review button */}
        {!showAddForm && (
          <button
            type="button"
            id="btn-open-review-form"
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            Viết đánh giá của bạn
          </button>
        )}
      </div>

      {/* Success notification banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold px-4 py-3 rounded-xl flex items-center gap-2 shadow-sm animate-fade-in" id="success-notification-banner">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Review Submission Form Container */}
      {showAddForm && (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4 animate-fade-in relative" id="review-submission-form">
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer"
            id="btn-close-review-form"
          >
            <X className="w-4 h-4" />
          </button>

          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-gold animate-pulse" />
            Chia sẻ trải nghiệm kỳ nghỉ của bạn
          </h5>

          <form onSubmit={handleSubmitReview} className="space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Star Rating Select Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Điểm đánh giá của bạn:</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = hoverRating !== null ? star <= hoverRating : star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        id={`btn-star-select-${star}`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none cursor-pointer transition-transform hover:scale-125"
                      >
                        <Star
                          className={`w-6 h-6 transition-all ${
                            isActive
                              ? 'text-amber-500 fill-amber-500 filter drop-shadow-sm'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-extrabold text-slate-500 ml-2" id="rating-label">
                    {rating === 5 ? 'Tuyệt vời (5/5)' :
                     rating === 4 ? 'Rất tốt (4/5)' :
                     rating === 3 ? 'Bình thường (3/5)' :
                     rating === 2 ? 'Kém (2/5)' : 'Rất tệ (1/5)'}
                  </span>
                </div>
              </div>

              {/* Guest Name Input */}
              <div className="space-y-1.5">
                <label htmlFor="review-guest-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Họ và Tên:</label>
                <input
                  id="review-guest-name"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ví dụ: Trần Minh Anh"
                  className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-blue"
                />
              </div>

            </div>

            {/* Comment input textarea */}
            <div className="space-y-1.5">
              <label htmlFor="review-comment" className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Nhận xét chi tiết về kỳ nghỉ:</label>
              <textarea
                id="review-comment"
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ví dụ: Phòng cực kỳ sạch sẽ, view đẹp, buffet sáng ngon miệng và nhiều món ăn đa dạng. Nhân viên phục vụ nhiệt tình và rất chu đáo..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-brand-blue resize-none leading-relaxed"
              />
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                id="btn-submit-guest-review"
                className="px-5 py-2 bg-brand-blue hover:bg-brand-blue-hover text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Gửi Đánh Giá
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: Rating overview stats + List of Review Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start" id="reviews-analytics-and-list">

        {/* Left Stats Dashboard: 4 cols */}
        <div className="md:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-100/80 space-y-4 text-center sm:text-left" id="reviews-summary-statistics">
          <div className="text-center py-2">
            <span className="text-4xl font-black text-slate-900 block tracking-tight" id="average-reviews-score">{averageRating}</span>
            <div className="flex justify-center my-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFull = star <= Math.floor(parseFloat(averageRating));
                const isHalf = !isFull && star - 0.5 <= parseFloat(averageRating);
                return (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${isFull ? 'text-amber-500 fill-amber-500' : isHalf ? 'text-amber-500 fill-amber-500/50' : 'text-slate-200'}`}
                  />
                );
              })}
            </div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Dựa trên {totalReviewsCount} lượt đánh giá</span>
          </div>

          {/* Progress bar breakdowns */}
          <div className="space-y-2 text-xs font-semibold text-slate-600 border-t border-slate-200/50 pt-4 text-left" id="rating-bars-breakdown">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = getRatingPercentage(star);
              return (
                <div key={star} className="flex items-center gap-2" id={`rating-bar-${star}-stars`}>
                  <span className="w-3 text-slate-400 font-mono text-right">{star}</span>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-slate-400 text-right font-mono text-[10px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right list of review cards: 8 cols */}
        <div className="md:col-span-8 space-y-4 text-left" id="reviews-cards-list-wrapper">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-slate-100 rounded-2xl p-4.5 hover:shadow-md transition-all duration-200 flex flex-col gap-3 relative"
                id={`review-card-${rev.id}`}
              >
                {/* Review Header Card */}
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8.5 h-8.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200/40 shrink-0">
                      {rev.guestName.split(' ').pop()?.substring(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <h6 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        {rev.guestName}
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded font-bold border border-emerald-100">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Đã nghỉ dưỡng
                        </span>
                      </h6>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Đăng ngày: {rev.date}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars Card */}
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-lg shrink-0">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-black text-amber-700">{rev.rating}</span>
                  </div>
                </div>

                {/* Review Body Comment */}
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light pl-1">
                  "{rev.comment}"
                </p>

                {/* Action feedback */}
                <div className="flex items-center gap-3 pt-2 border-t border-slate-50/80 mt-1 pl-1 text-[11px] text-slate-400 font-medium">
                  <button
                    type="button"
                    className="flex items-center gap-1 hover:text-brand-blue transition-colors cursor-pointer"
                    id={`btn-like-review-${rev.id}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Hữu ích ({Math.floor(Math.random() * 8) + 1})
                  </button>
                  <span>•</span>
                  <span>Phản hồi từ Tổng quản lý GrandStay đã ghi nhận</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200/60 p-6" id="empty-reviews-prompt">
              <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h5 className="text-sm font-bold text-slate-700">Chưa có đánh giá nào</h5>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Trở thành khách hàng đầu tiên để lại nhận xét và đánh giá quý giá về phòng nghỉ của chúng tôi để nhận điểm thưởng.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

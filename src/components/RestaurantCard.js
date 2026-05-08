import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

// HTML 태그 제거 및 엔티티 디코딩 유틸리티 함수
const cleanHtmlText = (str) => {
  if (!str) return '';
  const noTags = str.replace(/<[^>]*>?/gm, '');
  return noTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

export default function RestaurantCard({ restaurant }) {
  const cleanTitle = cleanHtmlText(restaurant.title);
  
  // 카테고리 파싱
  const categories = restaurant.category ? restaurant.category.split('>') : [];
  const displayCategory = categories.length > 1 ? categories[1] : (categories[0] || '음식점');

  // 플레이스홀더 이미지 배정
  const FOOD_IMAGES = [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1580651315530-69c8e0026377?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800",
  ];
  const fallbackImage = FOOD_IMAGES[cleanTitle.length % FOOD_IMAGES.length];
  const displayImage = restaurant.imageUrl || fallbackImage;
  const destinationLink = `https://map.naver.com/v5/search/${encodeURIComponent('부산 동구 ' + cleanTitle)}`;

  // 좋아요 상태 관리
  const [likes, setLikes] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Supabase에서 초기 좋아요 수 가져오기
  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from('restaurant_likes')
        .select('likes_count')
        .eq('restaurant_name', cleanTitle)
        .single();
      
      if (data) {
        setLikes(data.likes_count);
      }
    };
    fetchLikes();
  }, [cleanTitle]);

  // 좋아요 클릭 핸들러
  const handleLike = async (e) => {
    e.preventDefault(); // a 태그 링크 이동 방지
    e.stopPropagation();
    
    if (isLiking) return;
    setIsLiking(true);
    
    const newLikes = likes + 1;
    setLikes(newLikes); // Optimistic UI: 먼저 화면 반영
    
    try {
      const { error } = await supabase
        .from('restaurant_likes')
        .upsert({ restaurant_name: cleanTitle, likes_count: newLikes }, { onConflict: 'restaurant_name' });
        
      if (error) {
        console.error('Error updating likes:', error);
        alert('Supabase 에러: ' + error.message);
        setLikes(likes); // 에러 시 롤백
      }
    } catch (err) {
      console.error(err);
      alert('코드 에러: ' + err.message);
      setLikes(likes); // 에러 시 롤백
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <a href={destinationLink} target="_blank" rel="noopener noreferrer" className="card glass-panel">
      <div className="card-image-container">
        <img 
          src={displayImage} 
          alt={cleanTitle} 
          className="card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = fallbackImage;
          }}
        />
      </div>
      <div className="card-content">
        <div className="card-header" style={{ alignItems: 'center' }}>
          <h3 className="card-title">{cleanTitle}</h3>
          
          <button 
            onClick={handleLike}
            className="like-button"
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '20px',
              padding: '4px 10px',
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            <span style={{ fontSize: '1.1rem' }}>❤️</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{likes}</span>
          </button>

        </div>
        <p className="card-category">{displayCategory}</p>
        
        <p className="card-desc">
          {restaurant.description 
            ? cleanHtmlText(restaurant.description) 
            : restaurant.roadAddress || restaurant.address}
        </p>
        
        <div className="card-footer">
          {categories.slice(1).map((tag, index) => (
            <span key={index} className="tag">#{tag}</span>
          ))}
          {restaurant.telephone && (
            <span className="tag" style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
              📞 {restaurant.telephone}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

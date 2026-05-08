"use client";

import React, { useState, useEffect } from 'react';
import RestaurantCard from '../components/RestaurantCard';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 식당 데이터 가져오는 함수
  const fetchRestaurants = async (query = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("네이버 API에서 데이터를 가져오는데 실패했습니다.");
      }
      const data = await response.json();
      setRestaurants(data.items || []);
    } catch (err) {
      setError(err.message);
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 기본 검색어로 데이터 로드
  useEffect(() => {
    fetchRestaurants("");
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRestaurants(searchTerm);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="container">
          <h1 className="hero-title">
            부산 동구의 <br />
            <span className="text-gradient">숨겨진 맛집</span>을 찾아보세요
          </h1>
          <p className="hero-subtitle">
            부산역, 초량동, 차이나타운 등 진짜 맛집을 네이버에서 실시간으로 검색합니다.
          </p>
          
          <form className="search-container" onSubmit={handleSearch}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="식당 이름, 카테고리를 검색해보세요... (예: 밀면, 돼지국밥)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              {isLoading ? "검색 중..." : "검색"}
            </button>
          </form>
        </div>
      </section>

      <section className="restaurant-section container">
        <h2 className="section-title">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {searchTerm ? `'${searchTerm}' 관련 동구 맛집` : '이달의 추천 맛집'}
        </h2>
        
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "4rem 0" }}>
            <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid rgba(255,255,255,0.1)", borderRadius: "50%", borderTopColor: "var(--accent-color)", animation: "spin 1s ease-in-out infinite" }}></div>
            <p style={{ marginTop: "1rem", color: "var(--text-secondary)" }}>맛집 정보를 불러오는 중입니다...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#f87171" }}>
            <p>오류가 발생했습니다: {error}</p>
          </div>
        ) : restaurants.length > 0 ? (
          <div className="grid">
            {restaurants.map((restaurant, index) => (
              <RestaurantCard key={index} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--text-secondary)" }}>
            <p>검색 결과가 없습니다. 다른 검색어를 입력해보세요.</p>
          </div>
        )}
      </section>
    </>
  );
}

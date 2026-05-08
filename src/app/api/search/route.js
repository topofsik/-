import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  // 기본 검색어가 없을 경우 '맛집'으로 기본 설정
  const searchQuery = query ? `${query} 부산 동구 맛집` : '부산 동구 맛집';

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'API keys are missing' }, { status: 500 });
  }

  try {
    // sort=comment를 제거하고 정확도순(기본값)으로 더 많은 결과(최대 50개)를 가져오도록 수정
    const response = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(searchQuery)}&display=50`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Naver API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch data from Naver API' }, { status: response.status });
    }

    const data = await response.json();

    // 주소가 실제로 부산 동구에 속하는 식당만 필터링 (가게 이름에 '부산'이 들어가서 타지역 식당이 검색되는 현상 방지)
    if (data.items) {
      data.items = data.items.filter(item => {
        const addr = item.address || '';
        const roadAddr = item.roadAddress || '';
        return addr.includes('부산광역시 동구') || roadAddr.includes('부산광역시 동구') ||
               addr.includes('부산 동구') || roadAddr.includes('부산 동구');
      });
      // 필터링 후 최대 12개까지만 클라이언트에 반환
      data.items = data.items.slice(0, 12);

      // 각 식당별로 네이버 이미지 검색 API를 호출하여 실제 식당/음식 이미지 가져오기 (병렬 처리)
      const itemsWithImages = await Promise.all(data.items.map(async (item) => {
        try {
          const cleanTitle = item.title.replace(/<[^>]*>?/gm, '');
          // '식당이름 + 부산 동구' 로 검색하여 정확도를 높임
          const imageQuery = `${cleanTitle} 부산 동구`;
          const imgRes = await fetch(`https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(imageQuery)}&display=1&sort=sim`, {
            headers: {
              'X-Naver-Client-Id': clientId,
              'X-Naver-Client-Secret': clientSecret,
            }
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            if (imgData.items && imgData.items.length > 0) {
              item.imageUrl = imgData.items[0].link;
            }
          }
        } catch (e) {
          console.error('Image fetch error for', item.title, e);
        }
        return item;
      }));
      
      data.items = itemsWithImages;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

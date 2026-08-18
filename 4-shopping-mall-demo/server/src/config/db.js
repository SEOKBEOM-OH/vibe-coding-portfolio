const dns = require('dns');
const mongoose = require('mongoose');

// Windows 등에서 기본 DNS가 SRV(mongodb+srv) 조회를 거부하는 경우 대비
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * MongoDB 연결
 *
 * 개발(npm run dev, NODE_ENV=development)
 *   → 로컬 MONGODB_URI 우선 (admin@admin.com)
 * 운영(NODE_ENV=production, Cloudtype)
 *   → Atlas MONGODB_ATLAS_URL 우선 (admin2@admin.com)
 */
const connectDB = async () => {
  const isProd = process.env.NODE_ENV === 'production';
  const uri = isProd
    ? process.env.MONGODB_ATLAS_URL || process.env.MONGODB_URI
    : process.env.MONGODB_URI || process.env.MONGODB_ATLAS_URL;

  if (!uri) {
    throw new Error(
      'MONGODB_URI 또는 MONGODB_ATLAS_URL 이 환경 변수에 없습니다.'
    );
  }

  const source = isProd
    ? process.env.MONGODB_ATLAS_URL
      ? 'MONGODB_ATLAS_URL (production)'
      : 'MONGODB_URI (production fallback)'
    : process.env.MONGODB_URI
      ? 'MONGODB_URI (local)'
      : 'MONGODB_ATLAS_URL (local fallback)';

  await mongoose.connect(uri);
  console.log(`MongoDB 연결 성공: ${mongoose.connection.name} (${source})`);
};

module.exports = connectDB;

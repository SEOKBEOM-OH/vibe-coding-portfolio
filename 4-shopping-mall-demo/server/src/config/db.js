const dns = require('dns');
const mongoose = require('mongoose');

// Windows 등에서 기본 DNS가 SRV(mongodb+srv) 조회를 거부하는 경우 대비
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * MongoDB 연결
 * 우선순위: MONGODB_ATLAS_URL → MONGODB_URI
 *
 * mongodb+srv://user:pass@cluster0....mongodb.net/DB이름
 * → cluster0....mongodb.net 은 호스트(클러스터) 주소
 * → 마지막 / 뒤(shopping-mall-demo 등)가 실제 DB 이름
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_ATLAS_URL || process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_ATLAS_URL 또는 MONGODB_URI 가 환경 변수에 없습니다.'
    );
  }

  const source = process.env.MONGODB_ATLAS_URL
    ? 'MONGODB_ATLAS_URL'
    : 'MONGODB_URI';

  await mongoose.connect(uri);
  console.log(`MongoDB 연결 성공: ${mongoose.connection.name} (${source})`);
};

module.exports = connectDB;

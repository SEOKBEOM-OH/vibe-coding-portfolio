const mongoose = require("mongoose"); // MongoDB 스키마/모델용

// 할일(Todo) 문서 구조 정의
const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String, // 할일 제목
      required: true, // 필수 값
      trim: true, // 앞뒤 공백 제거
    },
    completed: {
      type: Boolean, // 완료 여부
      default: false, // 기본값: 미완료
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 생성
  }
);

// "Todo" 모델로 등록 후 다른 파일에서 사용할 수 있게 내보내기 (컬렉션 이름은 보통 소문자 복수형: todos)
module.exports = mongoose.model("Todo", todoSchema);

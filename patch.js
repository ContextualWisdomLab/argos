const replies = [
  {
    "comment_id": "4170266540",
    "reply": "테스트 케이스에서 RegisterRequestSchema 검증을 통과하도록 수정했습니다. Zod validation error가 발생하는지 검증하도록 테스트 내용을 변경하였으며 테스트가 모두 통과하는 것을 확인했습니다."
  },
  {
    "comment_id": "4170266762",
    "reply": "고정된 cost-10 dummy hash 상수($2a$10$vI8aWBnW3fID.ZQ4/zo1G.q1lRps.9cGLcZEiGDMVr5yUP1KUOYTa)를 도입하여 매 요청마다 hash 연산을 수행하지 않도록 수정하였습니다. unknown user에 대해서도 이 더미 해시를 사용하여 정확히 한 번 bcrypt.compare를 수행하도록 변경하여 해시 증폭을 방지하고 성능을 개선했습니다."
  },
  {
    "comment_id": "4170266312",
    "reply": "registerUser 함수 경계에서 RegisterRequestSchema.parse(input)를 직접 적용하여 1,024 길이 검사를 Zod 스키마 검증으로 대체했습니다."
  }
]
const fs = require('fs');
fs.writeFileSync('replies.json', JSON.stringify(replies));

# CHANGELOG

## [Unreleased]

### Added
- ERD 도구 보안 개선: DDL 생성 시 SQL Injection 취약점 방지를 위한 데이터 타입(valid SQL type) 유효성 검사 로직 추가.
- ERD 도구 새 기능: 테이블 삭제(`removeTable`), 컬럼 삭제(`removeColumn`), 외래 키 삭제(`removeForeignKey`) 기능 구현 및 연쇄 삭제 로직 추가.

### Security
- ERD 모델의 `addColumn` 실행 시, 악의적인 SQL 명령어(예: `; DROP TABLE ...`)가 주입되는 것을 차단하기 위해 엄격한 정규식을 사용하여 데이터 타입 포맷팅을 검증하도록 수정했습니다.

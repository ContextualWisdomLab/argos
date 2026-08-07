# ERD Engineering Tool CHANGELOG

## [Unreleased]

### 🛡️ 보안 수정 (Security Fix)
* **DDL 인젝션 방지 로직 추가:** `ERDModel` 클래스에서 컬럼의 타입을 정의할 때 사용자가 입력한 구문 종료 기호(`;`)를 허용하여 악의적인 SQL 명령이 실행되는 취약점을 해결했습니다. `assertNoStatementTerminator` 검증 함수를 도입하여 DDL 인젝션을 방지합니다.

### ✨ 새로운 기능 (Features)
* **테이블 기능 확장:** 테이블의 이름을 수정하는 `updateTable` 메소드와 테이블을 삭제하는 `removeTable` 메소드를 추가하였습니다.
* **컬럼 기능 확장:** 컬럼 정보를 수정하는 `updateColumn` 메소드와 컬럼을 삭제하는 `removeColumn` 메소드를 추가하였습니다.
* **외래 키 및 인덱스 관리 기능:** 외래 키를 제거할 수 있는 `removeForeignKey` 메소드와, 인덱스를 추가/제거할 수 있는 `addIndex`, `removeIndex` 메소드를 도입하여 세밀한 데이터베이스 설계가 가능해졌습니다.
* **Mermaid 다이어그램 자동 생성:** 테이블 간의 관계와 스키마를 시각화할 수 있도록 `generateMermaid` 메소드를 추가하였습니다.

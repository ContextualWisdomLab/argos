# Product / Technical Gap Baseline

`argos`에서 세션 CSV export는 사용자 제어 문자열을 스프레드시트 호환 파일로 내보내므로, RFC식 CSV quoting과 별도로 **spreadsheet formula interpretation** 경계를 가진다.

## CSV formula interpretation — PR #608

OWASP는 CSV/Formula Injection이 Excel·LibreOffice 같은 스프레드시트가 사용자 제어 cell을 수식으로 해석할 때 발생하며, 실질 영향은 대상 spreadsheet, client 설정과 사용자 상호작용에 따라 달라진다고 설명한다. 특히 `=`, `+`, `-`, `@`, tab, CR/LF와 일부 full-width variant가 formula-triggering prefix가 될 수 있고, separator/quote 처리까지 포함해 raw CSV cell 경계를 검증해야 한다.

현재 `csvField`는 number는 기존 수치 표현을 유지하고, string의 시작이 위험 prefix(앞선 whitespace 포함)에 해당하면 단일 따옴표를 추가한 뒤 기존 CSV quote/quote-doubling 규칙을 적용한다. 이 변경은 일반 CSV field escaping을 보존하면서 흔한 formula interpretation을 줄이는 defense-in-depth로 유효하다.

다만 이를 곧바로 `CRITICAL` 또는 "관리자 PC에서 임의 코드 실행 방지 완료"로 확정하지 않는다. OWASP Web Security Testing Guide도 command execution까지의 escalation은 spreadsheet gadget/legacy feature, client configuration 또는 사용자 상호작용에 의존한다고 명시한다. 또한 Microsoft Excel은 저장 후 재개방 과정에서 quote/escape를 제거할 수 있어 단일 quote 방식이 모든 workflow에서 신뢰 가능한 보편 해법은 아니다.

Reference:
- OWASP Foundation. *CSV Injection*. https://owasp.org/www-community/attacks/CSV_Injection
- OWASP Foundation. *Testing for CSV Injection (WSTG-INPV-21)*. https://wstg.owasp.org/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/21-Testing_for_CSV_Injection/

## 완료 전 acceptance

- raw exported CSV에서 attacker-controlled comma/quote/newline이 새 formula-leading cell을 만들지 않는지 실제 session export route로 검증한다.
- `=`, `+`, `-`, `@`, tab, CR/LF와 적용 대상 locale의 full-width variant를 safe benign formulas로 검증한다.
- 제품에서 실제 지원하는 spreadsheet consumer를 명시하고, 최소 Excel 및/또는 LibreOffice의 isolated test 환경에서 formula bar가 literal text인지 확인한다.
- Excel 저장 후 재개방이 지원 workflow라면 mitigation이 유지되는지 별도로 확인한다. 유지되지 않으면 human-view CSV와 machine-import CSV 계약을 분리하거나 target-specific mitigation을 ADR로 선택한다.
- numeric value의 음수/양수 표기는 number type에 한해 기존 의미를 보존하고, string identifier는 formula-safe text로 취급한다.
- current-head unit/integration test, Security Scan, SAST, CodeQL과 review evidence를 같은 generation에서 확인한다.

현재 판정은 구현 방향 PARTIAL PASS, 실제 spreadsheet acceptance PENDING이다. supported client와 workflow가 정해지기 전에는 보편적인 RCE 방지 완료나 특정 severity를 release claim으로 사용하지 않는다.

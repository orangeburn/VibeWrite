# VibeWrite - AI 기반 장문 쓰기 어시스턴트 `v1.0`

[简体中文](./README.md) | [English](./README_EN.md) | [日本語](./README_JA.md) | 한국어

Next.js와 Vercel AI SDK로 구축된 지능형 글쓰기 도구입니다. VibeWrite는 "합의 우선", "모듈형 생성", "3단 통합" 컨셉을 채택하여 사용자가 고품질의 장문 콘텐츠를 효율적으로 창작할 수 있도록 돕습니다.

## 🌟 핵심 컨셉

- **합의 기반 (Consensus-Driven)**: 콘텐츠 생성 전, 글로벌 팩트와 사용자 의도에 대한 "합의"를 먼저 구축하여 일관성을 확보하고 환각 현상을 제거합니다.
- **모듈형 생성 (Modular Production)**: 긴 글을 독립적인 블루프린트 노드로 분해하여 병렬 생성 및 심층 편집을 지원합니다.
- **3단 통합 인터페이스**: 설정, 제작, 감사를 하나의 뷰에 통합하여 창작 효율을 극대화합니다.

## ✨ 주요 기능

### 1. 3단 구성의 효율적인 워크플로우
- **왼쪽 열 (설정 패널)**: 글쓰기 의도를 실시간으로 분석하고, 원자적 사실(Atomic Facts)을 지능적으로 추출하며, 동적 양식을 생성합니다.
- **중간 열 (작업 캔버스)**: 드래그 앤 드롭 정렬, 잠금 및 수동 조정을 지원하는 블루프린트 프레임워크 설계.
- **오른쪽 열 (미리보기 및 감사)**: 실시간 렌더링 미리보기, 글로벌 일관성 감사 및 다양한 형식의 내보내기를 지원합니다.

### 2. 고도화된 지능형 기능
- **의미론적 중복 제거 (Semantic Deduplication)**: 중복된 소재를 지능적으로 식별하고 병합하여 정제되면서도 풍부한 콘텐츠를 보장합니다.
- **기록 유지 (Persistence)**: 창작 활동의 완전한 버전 관리 기능을 제공하여 언제든지 이전 생성 상태로 되돌릴 수 있습니다.
 Korean 번역 중...
- **노드 레벨 소재 주입**: 특정 챕터에 전용 참고 자료를 업로드하여 정교한 국소 제어가 가능합니다.
- **병렬 비동기 생성**: Vercel AI SDK를 통해 속도와 품질을 모두 잡은 다중 노드 병렬 생성을 구현했습니다.

### 3. 글로벌화 및 맞춤화
- **다국어 지원 (I18n)**: 한국어, 중국어, 영어, 일본어의 공식 지원을 내장하고 있습니다.
- **사용자 지정 지침 (Context Injection)**: 개별 노드에 높은 가중치의 지침을 주입하여 AI의 어조와 스타일을 정밀하게 가이드합니다.
- **유연한 모델 설정**: OpenAI (gpt-4o/gpt-4o-mini) 및 DeepSeek 호환 API를 지원합니다.

## 🛠️ 기술 스택

- **프런트엔드 프레임워크**: Next.js 15+ (App Router + Turbopack)
- **AI 엔진**: Vercel AI SDK
- **상태 관리**: Zustand (지속성 미들웨어 포함)
- **UI 라이브러리**: React 19 + Radix UI + Tailwind CSS + Lucide Icons
- **양식 및 검증**: React Hook Form + Zod
- **국제화**: 자체 제작한 경량 I18n 솔루션

## 🚀 빠른 시작

### 사전 요구 사항

- Node.js 18.17+
- OpenAI API 키 또는 호환 서비스

### 설치 단계

1. **저장소 클론**
   ```bash
   git clone <your-repo-url>
   cd VibeWrite
   ```

2. **종속성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   # 템플릿 복사
   cp .env.local.example .env.local
   
   # .env.local 편집
   OPENAI_API_KEY=sk-your-key-here
   # 선택 사항: 사용자 지정 모델 또는 BASE_URL 설정
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

## 📂 프로젝트 구조

```
VibeWrite/
├── app/                  # Next.js App Router 페이지 및 Server Actions
│   ├── actions/          # 백엔드 AI 로직 (setup, blueprint, production)
│   └── api/              # API 라우트
├── components/           # React 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트 (Shadcn UI)
│   ├── three-column-layout.tsx  # 메인 레이아웃
│   ├── scene-configuration.tsx   # 설정 패널
│   ├── blueprint-editor.tsx     # 블루프린트 편집기
│   └── audit-panel.tsx          # 감사 및 미리보기
├── lib/                  # 유틸리티 및 설정
│   ├── i18n.ts           # 다국어 설정
│   └── ai.ts             # AI 클라이언트 초기화
├── store/                # Zustand 스토어 (useVibeWriteStore)
└── public/               # 정적 자산
```

## 📝 기여

모든 형태의 기여를 환영합니다! 버그 보고부터 기능 제안, PR 제출까지 여러분의 도움이 VibeWrite를 더욱 발전시킵니다.

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE)에 따라 라이선스가 부여됩니다.

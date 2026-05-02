import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

// 레이어 의존성 강제: apis → services → actions → app
// 상위 레이어를 import하는 것을 차단. 자세한 사유는 docs/ARCHITECTURE.md
const LAYER_VIOLATION_MESSAGE =
    "Layer 의존성 위반: apis → services → actions → app 방향만 허용. docs/ARCHITECTURE.md 참조.";

// alias(`@/<layer>/...`)만 검사. 상대 경로(`../<layer>/...`)는 `**/<layer>/**` 패턴이 외부 패키지
// (예: `next/dist/client/components/...`)까지 잡는 false positive 비용이 커서 제외.
// 현재 코드베이스에 layer crossing 상대 경로는 0건. 신규 발생 시 코드 리뷰 또는
// `eslint-plugin-import`의 `no-relative-parent-imports`로 별도 차단 검토.
const layerPatterns = (layers) => layers.map((layer) => `@/${layer}/**`);

export default defineConfig([
    {
        ignores: ["docs/**"],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
    prettier,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    // apis/는 다른 src/ 레이어를 import 할 수 없음 (가장 하위)
    {
        files: ["src/apis/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: layerPatterns(["services", "actions", "app", "components", "hooks"]),
                    message: LAYER_VIOLATION_MESSAGE,
                }],
            }],
        },
    },
    // services/는 actions/·app/·components/·hooks/를 import 할 수 없음
    {
        files: ["src/services/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: layerPatterns(["actions", "app", "components", "hooks"]),
                    message: LAYER_VIOLATION_MESSAGE,
                }],
            }],
        },
    },
    // actions/는 app/·components/·hooks/를 import 할 수 없음
    {
        files: ["src/actions/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: layerPatterns(["app", "components", "hooks"]),
                    message: LAYER_VIOLATION_MESSAGE,
                }],
            }],
        },
    },
    // components/는 apis/·services/를 직접 import 할 수 없음 (UI 순수성)
    // actions/는 일부 admin 컴포넌트에서 직접 호출 — 정책 결정 보류로 강제 안 함
    {
        files: ["src/components/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: layerPatterns(["apis", "services"]),
                    message: "components/는 apis/·services/를 직접 import 할 수 없습니다. props 또는 hooks로 주입받으세요.",
                }],
            }],
        },
    },
    // app/은 apis/를 직접 호출할 수 없음 (services/ 경유 필수)
    // 기존 위반 10건은 line-level disable + tech-debt-tracker 등록 (점진 마이그레이션 대상).
    // error로 강제하므로 신규 위반은 즉시 차단됨.
    {
        files: ["src/app/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["error", {
                patterns: [{
                    group: layerPatterns(["apis"]),
                    message: "app/은 apis/를 직접 호출할 수 없습니다. services/ 경유. (tech-debt-tracker.md 참조)",
                }],
            }],
        },
    },
]);

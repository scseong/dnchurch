import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

// 레이어 의존성 강제: apis → services → actions → app
// 상위 레이어를 import하는 것을 차단. 자세한 사유는 docs/ARCHITECTURE.md
const LAYER_VIOLATION_MESSAGE =
    "Layer 의존성 위반: apis → services → actions → app 방향만 허용. docs/ARCHITECTURE.md 참조.";

export default defineConfig([
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
                    group: [
                        "@/services/**",
                        "@/actions/**",
                        "@/app/**",
                        "@/components/**",
                        "@/hooks/**",
                    ],
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
                    group: [
                        "@/actions/**",
                        "@/app/**",
                        "@/components/**",
                        "@/hooks/**",
                    ],
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
                    group: ["@/app/**", "@/components/**", "@/hooks/**"],
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
                    group: ["@/apis/**", "@/services/**"],
                    message: "components/는 apis/·services/를 직접 import 할 수 없습니다. props 또는 hooks로 주입받으세요.",
                }],
            }],
        },
    },
    // app/은 apis/를 직접 호출할 수 없음 (services/ 경유 필수)
    // 현재 ~10건 위반 존재 (auth 클라이언트 일부 포함) — 점진 마이그레이션 위해 warn
    // 해결 시 error로 격상. tech-debt-tracker.md 참조.
    {
        files: ["src/app/**/*.{ts,tsx}"],
        rules: {
            "no-restricted-imports": ["warn", {
                patterns: [{
                    group: ["@/apis/**"],
                    message: "app/은 apis/를 직접 호출할 수 없습니다. services/ 경유. (tech-debt-tracker.md 참조)",
                }],
            }],
        },
    },
]);
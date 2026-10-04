---
title: Mod (패널 & 밴드)
description: Claude Code mod로 대시보드를 패널 또는 프롬프트 위 밴드로 표시
sidebar:
  order: 6
---

claude-dashboard는 Claude Code **mod**(function-hook 플러그인, 얼리 액세스, Claude Code 2.1.289에서 확인)로도 제공됩니다. 같은 플러그인 안에 `hooks/hooks.json`(`"modules": ["../dist/mod.js"]`)으로 포함되어 있어 따로 설치할 것이 없습니다.

mod는 터미널과 데스크톱 Code 탭에서만 표시됩니다. VS Code 패널이나 `claude -p`에서는 나타나지 않습니다.

## 명령어

| 명령어 | 동작 |
|--------|------|
| `/dashboard` | 대화 기록 옆에 대시보드 패널을 켜고 끕니다. 레이아웃은 `modPane`(기본값 `detailed`)을 따릅니다. |
| `/dashboard-band on\|off` | 프롬프트 위에 대시보드를 표시하고 **현재 세션에서만** statusLine을 숨깁니다. 레이아웃은 `modBand`(기본값: statusLine 레이아웃)를 따릅니다. |

`/dashboard-band`는 `settings.json`을 수정하지 않으며 현재 세션에만 적용됩니다.

## 설정

```json
{
  "modPane": "detailed",
  "modBand": "MC$R|BDO",
  "modBandDefault": true
}
```

- `modPane`, `modBand`에는 디스플레이 모드 이름(`compact`, `normal`, `detailed`) 또는 `"MC$R|BDO"` 같은 프리셋 문자열을 지정할 수 있습니다.
- `"modBandDefault": true`로 설정하면 세션 시작 시 밴드가 자동으로 켜집니다.
- 테마, 언어, `disabledWidgets`는 일반 설정을 그대로 따릅니다.
- `cacheHit`, `tokenBreakdown`, `performance`는 mod API에 요청별 캐시 사용량이 없어 패널과 밴드에서 숨겨집니다.

## statusLine이 숨겨지는 방식

밴드가 켜져 있는 동안 세션별 하트비트 마커(`~/.cache/claude-dashboard/band-<sessionId>`)를 기록합니다. 마커는 렌더링할 때마다(최대 60초 간격) 갱신되며 180초가 지나면 무시됩니다. `/dashboard-band off`를 실행하거나 세션이 끝나면 삭제됩니다. 따라서 모드가 어떤 이유로든 멈추더라도 3분 이내에 statusLine이 자동으로 돌아옵니다.

## 데이터 출처

패널과 밴드는 mod API(Claude Code가 전달하는 컨텍스트, 속도 제한, 비용)와, 변경 없이 서브프로세스로 실행되는 렌더러 `dist/index.js`를 함께 사용합니다.

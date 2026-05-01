# 2026 年

## 2026 年 4 月

### 2026.04.28 Tuesday

- [Storyboard Pipeline]
    - {validation}
        - 【能力升级】完成 storyboard validation 的 schema check / repair loop 拆分。
        - 【问题定位】定位 single-pass validation 会把 panel continuity failure 延迟到 export 阶段才暴露。

### 2026.04.29 Wednesday

- [Storyboard Pipeline]
    - {pipeline orchestration}
        - 【结构变更】确认 panel layout generation 与 dialogue generation 保持独立 stage。
        - 【阶段总结】该设计牺牲少量 orchestration 简洁度，换取 layout-only failure 时不重写 dialogue 的稳定 retry 边界。

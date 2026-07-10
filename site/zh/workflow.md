# 工作流

## 主循环

```text
安装 -> 配置 vault 与项目分组 -> Daily -> Weekly -> Monthly
                                  \-> capture 关键 session
```

1. 安装 `tracework@tracework`。
2. 每个项目运行一次 `/tracework:cold-start-interview`，设置 reporting group。
3. 用 `/tracework:daily`、`/tracework:weekly`、`/tracework:monthly` 完成高频收口。
4. 关键工作结束时说“收工”，保存动机、风险、取舍和证据边界。
5. 只有在工作被追问、继续或长周期复盘时，才使用 Query、Recall、Roadmap。

## 先分区，再选择主线

```text
work     -> 只包含公司项目
personal -> 只包含个人项目
all      -> 私人视图中按组分别叙事
```

每个组通常拥有三条 headline，以及覆盖其余有意义工作的组合状态。三个位置不是整个
vault 共用，也不是工作覆盖上限。

## 复用地图

```text
Capture -> raw/weeks/{week}/{slug}.json
Daily   <- raw entries + limited git fallback
Weekly  <- raw entries + limited git fallback
Monthly <- raw entries + Daily/Weekly 人类判断
Query   <- derived decisions + raw entries
Recall  <- raw entries + artifact/decision navigation
Roadmap <- decision evidence pack
```

Raw entries 是语义真相。报告本地证据编号只属于附录，不进入 raw schema 或口头主叙事。

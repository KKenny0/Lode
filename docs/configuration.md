# 配置

[返回主 README](../README.md)

Lode 所有技能使用统一的配置系统，支持全局和项目级别的灵活配置。

## 基础配置

所有 skills 通过 YAML 配置文件指定知识库路径：

```yaml
# ~/.lode/config.yaml 或 {project}/.lode/config.yaml
knowledge_vault: /path/to/your/knowledge-vault
```

### 配置项说明

- `knowledge_vault`: 知识库的绝对路径
  - 必须是目录，且必须存在（技能不会自动创建）
  - 建议设置为 git 仓库以支持版本控制
  - 建议使用 Obsidian vault 结构
- `project_slug`: 项目标识（可选）
  - 默认从 git repo 目录名推导
  - 可用于稳定多机器或多路径下的项目身份
- `arch_doc.output_dir`: 架构文档输出目录（可选）
  - 默认 `docs`，相对于项目根目录解析
  - 可以设置为绝对路径，例如 vault 中的 `Project Docs/{slug}`
  - 用于适配不希望在项目 repo 内保存 `docs/` 的仓库
- `arch_doc.mirror_to_vault`: 预留字段（可选）
  - 默认 `false`
  - 当前不启用自动镜像，仅保留未来兼容空间
- `artifact_index.enabled`: 是否写入 artifact index（可选）
  - 默认 `true`
  - 当 vault 可用时，producer skills 可写入 `{vault}/raw/artifacts/{slug}.json`
  - 关闭后，primary output 仍然生成，只跳过 artifact index side effect

## 配置解析优先级

系统按以下优先级顺序查找并解析配置：

1. **项目级配置**: `{project}/.lode/config.yaml`
2. **全局配置**: `~/.lode/config.yaml`
3. **环境变量**: `$WEEKLY_PPT_PATH`
4. **Legacy fallback**: `~/.weekly-ppt/`

### 解析规则

- 优先级高的配置覆盖优先级低的配置
- 只要找到任一有效配置即停止查找
- 项目级配置仅在项目根目录下生效

## Legacy Fallback 说明

`$WEEKLY_PPT_PATH` 和 `~/.weekly-ppt/` 是为了兼容旧版本保留的 fallback 机制：

- `$WEEKLY_PPT_PATH`: 环境变量，指向传统的 weekly-ppt 目录
- `~/.weekly-ppt/`: 用户主目录下的默认 fallback 路径

**推荐做法**: 新项目应直接使用 `knowledge_vault` 配置，避免依赖 legacy fallback。

## 验证配置

安装配置后，运行诊断命令验证配置是否正确：

```bash
lode doctor
```

### 诊断内容

`lode doctor` 会检查以下项目：

1. **配置解析**: 能否正确解析配置文件
2. **Vault 权限**: 指定目录是否可写
3. **Skill 安装**: 相关 skills 是否已安装
4. **项目推导**: 能否从 git 仓库推导项目 slug
5. **Raw Entry 写入**: 测试临时文件写入功能
6. **输出目录**: 检查 weekly 输出目录创建权限

### 常见问题

**问题**: "Cannot find config"
**解决**: 检查配置文件路径和权限，确保存在有效的配置文件

**问题**: "Vault is not writable"
**解决**: 检查目录权限，确保 Claude Code 有写入权限

**问题**: "Project slug not found"
**解决**: 确保在 git 仓库中工作，或手动创建 projects.json

## 配置示例

### 项目级配置示例

```yaml
# my-project/.lode/config.yaml
knowledge_vault: /Users/username/projects/my-knowledge-vault
```

### 全局配置示例

```yaml
# ~/.lode/config.yaml
knowledge_vault: /Users/username/knowledge-vault
```

### 带高级配置的示例

如果需要配置多个知识库（不常用），可以通过项目级配置覆盖：

```yaml
# my-project/.lode/config.yaml
knowledge_vault: /Users/username/projects/my-project-vault
```

### Artifact governance 配置示例

```yaml
knowledge_vault: /Users/username/knowledge-vault
project_slug: storyboard-pipeline

arch_doc:
  output_dir: docs
  mirror_to_vault: false

artifact_index:
  enabled: true
```

如果项目策略不允许写入 repo 内的 `docs/`，可以把架构文档输出到 vault 或其他本地目录：

```yaml
knowledge_vault: /Users/username/knowledge-vault

arch_doc:
  output_dir: /Users/username/knowledge-vault/Project Docs/storyboard-pipeline
```

## 最佳实践

1. **使用 Git 管理知识库**: 将 vault 设置为 git 仓库，支持跨设备同步
2. **定期备份**: 定期 push 到远程仓库或使用 git tag 标记重要节点
3. **配置隔离**: 不同项目使用不同的 vault 或项目级配置
4. **权限控制**: 确保 Claude Code 进程有足够权限写入 vault
5. **路径简洁**: 使用短路径避免过长的相对路径问题

## 配置模板

完整配置模板参考：[references/lode-config-template.yaml](../references/lode-config-template.yaml)

包含所有可配置项的详细说明和默认值。

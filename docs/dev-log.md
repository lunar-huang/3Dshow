# 开发日志

## 2026-06-10

### 背景

项目原本更偏向 3D NFT viewer，旧 README 仍带有 Algorand / Pera Wallet 语境。但当前目标已经切换为 Base 上的实体收藏卡 ownership demo。

### 今日决策

- 明确产品方向：不是 NFT marketplace，而是 collectible ownership layer
- 明确部署方向：`Base`
- 明确用户体验：Google 登录 + 自动钱包 + 用户无感区块链
- 明确核心实体：`Card`
- 明确关键配套实体：`CardVersion`、`OwnershipHistory`、`ClaimRequest`
- 明确 NFC 安全分层：MVP 先做版本校验，进阶再做 challenge-response 防伪

### 今日文档调整

- 将原先堆在 `expect.md` 里的内容拆分
- 保留 `expect.md` 作为 demo 描述
- 新增 `docs/requirements.md`
- 新增 `docs/handbook.md`
- 新增 `docs/dev-log.md`
- 新增 `docs/sessions/session-a.md`
- 新增 `docs/guides/entity-writing.md`

### Session A 结论

- `Card` 表示编号身份，不表示实体卡版本
- 挂失与补发必须通过 `CardVersion` 解决
- 历史记录必须单独建模
- Claim 不应假设用户自己付 gas
- 旧卡挂失解决的是“版本失效”
- 防伪解决的是“芯片/标签是否真实”
- 这两件事必须分开设计

### 后续建议

- 下一步应进入 Session B：登录与托管钱包
- 但在此之前，最好先把 Session A 落成数据库 schema

## 2026-06-13

### 今日决策

- Prisma MVP schema 已可用
- 当前优先级从继续扩 schema 转为打通第一条 MVP 垂直切片
- 第一条切片定义为：`claim link -> Privy email login -> claim -> ownership visible`

### 当前策略

- 先做 Privy 登录
- 再做 claim page
- 再接最小 claim transaction
- 最后让用户在自己账户下看到已 claim 的 card

## 2026-06-14

### 今日进展

- Privy 邮箱登录已接通
- 开始进入 claim page 路由阶段
- 当前前端路由目标为：`/card/:slug`

### 当前目标

- 用户可直接打开 claim link
- 未登录时可在 claim page 上完成登录
- 登录后可看到 claim 按钮

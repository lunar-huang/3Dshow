预期实现 demo

## 1. 业务目标

目标不是做 NFT Marketplace，而是给每一张实体收藏卡一个可验证、可转移、可补发的数字身份。区块链只作为底层账本存在，用户不应感知钱包、Gas、助记词等概念。用户体验应接近：

Google Login -> 自动创建托管钱包 -> Claim Card -> 查看持有/历史 -> 转让/挂失/补发

计划部署在 Base 链上。

## 2. Demo 故事线

1. 发行商创建系列 A，限量 99 张，每张卡有唯一编号，例如 `01/99`，并与 99 张 NFC 实体卡一一绑定。
2. 用户 A 购买实体卡后，手机扫描 NFC 打开卡片页面，使用 Google 登录并 claim；Gas 由发行商或平台代付。
3. 朋友扫描该卡时，可以看到卡片详情与历史记录：`Issuer Mint -> User A Claimed`。
4. 用户 A 以 `100` 稳定币卖给用户 E；支付与 NFT 转移需要原子化或至少由平台托管同一笔交易流程。
5. 邮寄过程中实体卡丢失。
6. 用户 E 持有数字卡但丢失实体卡，发起挂失；发行商登记旧卡失效，收取补卡费，重新发行新 NFC 实体卡。
7. 用户 E 收到新卡后，朋友扫描看到当前有效版本及完整历史：`Issuer -> A -> E`。
8. 若有人扫描旧卡，页面显示红色警示：`This card has been replaced`，旧卡版本 `v1`，当前有效版本 `v2`。

## 3. 产品原则

- 用户无感知区块链，只使用常规账号体系登录。
- NFC 只存 URL，不存业务关键数据。
- 链上记录核心所有权与版本状态，链下承载产品逻辑、索引、搜索、后台审核。
- 视觉效果已够用于 demo，后续优先做 Ownership Layer。

## 4. Session A 目标

今天做 Session A，核心是先把数据模型设计对。最关键的 entity 确实是 `Card`，因为它连接了：

- 系列 `Collection`
- 当前有效版本 `CardVersion`
- 链上 NFT / Token
- NFC 标签
- 当前持有人
- 所有权历史
- 挂失 / 补发状态

Session A 输出应是：

1. 实体关系定义
2. `Card` 必需字段清单
3. 关键状态机
4. Base 方案下的技术栈

## 5. 核心实体

建议至少有以下 6 个实体：

### User

表示平台用户，不等于钱包地址。

关键字段：

- `id`
- `email`
- `google_sub`
- `display_name`
- `avatar_url`
- `embedded_wallet_address`
- `role`：`issuer | user | admin`
- `created_at`

### Collection

表示一次发行，例如 `Singapore GP 2026 Limited Card`。

关键字段：

- `id`
- `issuer_id`
- `name`
- `slug`
- `description`
- `cover_image_url`
- `chain_id`
- `contract_address`
- `max_supply`
- `metadata_base_uri`
- `sale_status`
- `created_at`

### Card

这是最重要的业务实体，表示“这张编号卡”的主身份，例如 `Card #001 / 099`。它不是某次补发版本，而是贯穿整个生命周期的主对象。

建议参数如下。

必需字段：

- `id`：数据库主键
- `collection_id`：所属系列
- `serial_number`：纯编号，如 `1`
- `serial_display`：展示编号，如 `001/099`
- `edition_size`：该系列总量，如 `99`
- `token_id`：链上 NFT tokenId
- `current_owner_user_id`：当前平台用户持有人
- `current_version_id`：当前有效实体卡版本
- `status`：`unclaimed | claimed | in_transfer | lost_reported | replaced | archived`
- `claim_status`：`unclaimed | claimed`
- `is_active`：是否仍在系统中有效
- `created_at`
- `updated_at`

强烈建议字段：

- `minted_at`
- `claimed_at`
- `last_transfer_at`
- `last_scanned_at`
- `public_slug`：用于页面路由，如 `/card/sgp-2026-001`
- `metadata_uri`
- `issuer_note`

如果想支持市场/售后流程，建议再加：

- `replacement_count`
- `lost_report_count`
- `current_holder_display_name_cache`
- `price_currency`
- `last_sale_price`

结论：`Card` 应代表“编号身份”，`CardVersion` 应代表“某一张实体卡版本”。不要把补卡做成新的 `Card`，否则历史会断。

### CardVersion

表示实体卡版本，例如原始卡 `v1`、补发卡 `v2`。一个 `Card` 可以有多个 `CardVersion`，但只有一个 `current_version_id`。

关键字段：

- `id`
- `card_id`
- `version_number`
- `nfc_tag_uid`
- `nfc_url`
- `status`：`active | lost | replaced | invalid`
- `printed_at`
- `activated_at`
- `replaced_at`
- `notes`

### OwnershipHistory

记录完整所有权/状态变化。这个表非常关键，因为“可展示历史”是你给发行商和用户的核心价值。

关键字段：

- `id`
- `card_id`
- `from_user_id`
- `to_user_id`
- `event_type`：`mint | claim | transfer | lost_report | replacement | admin_correction`
- `tx_hash`
- `price_amount`
- `price_token`
- `card_version_id`
- `created_at`
- `memo`

### ClaimRequest

因为实际流程里 claim 往往不是即时自动过账，通常会有平台或发行商审核/签名/代付。

关键字段：

- `id`
- `card_id`
- `card_version_id`
- `claimer_user_id`
- `status`：`pending | approved | rejected | completed`
- `requested_at`
- `processed_at`
- `processor_user_id`
- `rejection_reason`

## 6. 最少状态机

### Card 状态

- `unclaimed`：已 mint，未被用户认领
- `claimed`：已认领，当前数字所有权有效
- `in_transfer`：交易处理中
- `lost_reported`：当前持有人已挂失
- `replaced`：存在新版本实体卡，旧版本失效

### CardVersion 状态

- `active`：当前有效实体卡
- `lost`：已挂失
- `replaced`：已被新版本取代
- `invalid`：作废或初始化错误

## 7. Session A 关系结论

建议关系如下：

- `User 1 - n Collection`
- `Collection 1 - n Card`
- `Card 1 - n CardVersion`
- `Card 1 - n OwnershipHistory`
- `Card 1 - n ClaimRequest`
- `User 1 - n owned Cards`

最关键约束：

- 一个 `Card` 只能有一个 `current_version_id`
- 一个 `CardVersion` 只能绑定一个 NFC 标签
- 一个 NFC 标签只能对应一个 `CardVersion`
- 一次补发不创建新 `Card`，只创建新 `CardVersion`
- 页面 URL 最好指向 `Card`，不是 `CardVersion`

## 8. Base 方案下需要的技术栈

你现在已有：

- 前端：React
- 3D：Three.js + React Three Fiber + Drei
- 构建：Vite

如果要把这个项目真正做成可 claim / 可转让 / 可补发 的 demo，后续至少还需要下面这些层。

### 前端层

- `react`
- `vite`
- `react-router-dom`：卡片详情、claim、issuer dashboard 路由
- `three`
- `@react-three/fiber`
- `@react-three/drei`
- `tailwindcss` 或其他 UI 方案：快速搭页面
- `zod`：前后端共享输入校验

### 登录与钱包抽象

- `Privy` 或 `Dynamic`

你这个项目里，这一层很关键，因为你明确要求：

- Google 登录
- 自动创建托管钱包
- 用户无感知钱包
- 后续支持代付 Gas

在你的需求下，`Privy` 会比自己拼 auth + wallet 更合适。

### 链上交互

- `viem`
- `wagmi`（如果前端还需要标准钱包兼容，可选）
- `Base` 主网或 Base Sepolia 测试网

用途：

- 读取 NFT owner
- 发起 claim / transfer / replacement 相关交易
- 查询交易状态

### 合约开发

- `Solidity`
- `Foundry` 或 `Hardhat`
- `OpenZeppelin Contracts`

建议合约最少拆成：

- `CollectionNFT`：ERC-721 主合约
- `IssuerController`：claim / replacement / admin action 控制器
- 可选 `MarketplaceEscrow`：原子化支付 + 转卡

### 后端 / API 层

前端之外，你还需要一个中心化后端，不然这些流程落不了地：

- Google 登录回调
- 用户资料管理
- claim 审核
- 挂失审核
- 补卡流程
- issuer dashboard
- 交易编排
- 代付 gas / relayer

建议：

- `Next.js` 全栈，或
- `Node.js + NestJS/Express`

如果只是 hackathon demo，优先选：

- `Next.js`

原因：前端、API、SSR、部署能放一起，推进更快。

### 数据库

- `PostgreSQL`
- `Prisma`

原因：

- 实体关系明确
- 需要事务
- 需要强约束
- 需要快速迭代 schema

### 链上索引 / 历史同步

仅靠前端直连链不够，历史与后台统计需要索引层：

- `Alchemy` / `Goldsky` / 自建 indexer
- 或后端监听合约事件后写入数据库

至少需要同步：

- `Mint`
- `Claim`
- `Transfer`
- `Replacement`

### Gas 代付 / 交易中继

这是“用户无感知区块链”的核心，不可缺：

- `Privy server wallet / embedded wallet`
- `Defender Relay`、`thirdweb Engine`、或自建 relayer
- 若采用 Account Abstraction，可接 `paymaster`

没有这一层，claim 时用户仍要自己付 gas，你的产品体验会断裂。

### 存储

- 图片与贴图：`Cloudflare R2` / `S3`
- 元数据：链下 JSON，可再映射到合约 tokenURI

NFT 图片、卡面图、版本图、系列封面都不应该直接塞进仓库。

### NFC

- NTAG213 / NTAG215 一类标签
- 写入内容只放 URL，例如：`https://app.xxx.com/card/sgp-2026-001`

不要把 owner、状态、版本号写进 NFC；这些必须实时从后端/链上取。

### 支付

你原文写的是 `100 usdt`。如果跑 Base demo，建议统一成：

- 法币支付：后续再说
- 链上稳定币：优先统一为一个稳定币

Demo 阶段建议不要同时支持太多币种，否则转让流程会变复杂。

## 9. 推荐最小实现栈

如果目标是最快做出能讲故事的 Base demo，我建议直接收敛为：

- 前端：React + Vite + React Router + Tailwind
- 3D：Three.js + React Three Fiber + Drei
- 登录/钱包：Privy
- 合约：Solidity + Foundry + OpenZeppelin
- 链交互：viem
- 后端：Next.js API Routes 或 Next.js fullstack
- 数据库：PostgreSQL + Prisma
- 存储：S3/R2
- 部署链：Base Sepolia -> Base Mainnet

## 10. 开发优先级

顺序建议如下，不要先继续抠视觉细节：

1. Session A：定数据模型与状态机
2. Session B：Google Login + 自动钱包
3. Session C：Card Detail Page
4. Session D：Claim Flow
5. Session E：Ownership History
6. Session F：Issuer Dashboard
7. Session G：Transfer Flow
8. Session H：Lost Report
9. Session I：Replacement Card
10. Session J：Old Card Warning

## 11. 今天的结论

如果只回答“要达到你想要的效果最重要需要什么参数”，答案是：

`Card` 至少必须有：

- `collection_id`
- `serial_number`
- `serial_display`
- `edition_size`
- `token_id`
- `current_owner_user_id`
- `current_version_id`
- `status`
- `claim_status`

同时必须配套：

- `CardVersion`：解决实体卡补发与旧卡失效
- `OwnershipHistory`：解决“可炫耀、可验证、可追踪”
- `ClaimRequest`：解决发行商代付与审核流程

如果只回答“技术栈还缺什么”，答案是：

- 登录/钱包抽象
- 智能合约
- 后端 API
- 数据库
- 链上索引
- Gas 代付 / Relayer
- 对象存储
- NFC 写入/读取流程

这几层里，最不能省的是：

- `Privy`
- `Solidity + OpenZeppelin`
- `viem`
- `Next.js`
- `PostgreSQL + Prisma`
- `Relayer/Paymaster`


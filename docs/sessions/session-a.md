# Session A

## 目标

确定 Ownership MVP 的数据模型。今天不解决视觉效果，不继续扩 3D，只解决后续所有功能的基础结构。

本次输出：

1. 核心实体
2. `Card` 参数清单
3. 状态机
4. 实体关系
5. 实现建议

## 核心判断

`Card` 是最重要的 entity，但它不能同时承担“编号身份”和“实体卡版本”两种职责。

正确拆法：

- `Card`：编号身份，贯穿完整生命周期
- `CardVersion`：某一张实体卡版本，例如 `v1`、`v2`

如果把补卡直接做成新的 `Card`，历史会断，旧卡警告也很难处理。

## 必要实体

### User

- `id`
- `email`
- `google_sub`
- `display_name`
- `avatar_url`
- `embedded_wallet_address`
- `role`
- `created_at`

### Collection

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

`Card` 表示系列中的一个编号身份，例如 `#001/099`。

最少必需字段：

- `id`
- `collection_id`
- `serial_number`
- `serial_display`
- `edition_size`
- `token_id`
- `current_owner_user_id`
- `current_version_id`
- `status`
- `claim_status`
- `is_active`
- `created_at`
- `updated_at`

强烈建议字段：

- `public_slug`
- `metadata_uri`
- `minted_at`
- `claimed_at`
- `last_transfer_at`
- `last_scanned_at`
- `issuer_note`

可选增强字段：

- `replacement_count`
- `lost_report_count`
- `last_sale_price`
- `price_currency`

### CardVersion

`CardVersion` 表示实体卡版本。

- `id`
- `card_id`
- `version_number`
- `nfc_tag_uid`
- `nfc_url`
- `nfc_serial`
- `chip_public_key`
- `anti_clone_mode`
- `status`
- `printed_at`
- `activated_at`
- `replaced_at`
- `notes`

### OwnershipHistory

- `id`
- `card_id`
- `from_user_id`
- `to_user_id`
- `event_type`
- `tx_hash`
- `price_amount`
- `price_token`
- `card_version_id`
- `created_at`
- `memo`

建议 `event_type`：

- `mint`
- `claim`
- `transfer`
- `lost_report`
- `replacement`
- `admin_correction`

### ClaimRequest

- `id`
- `card_id`
- `card_version_id`
- `claimer_user_id`
- `status`
- `requested_at`
- `processed_at`
- `processor_user_id`
- `rejection_reason`

## 状态机

### Card.status

- `unclaimed`
- `claimed`
- `in_transfer`
- `lost_reported`
- `replaced`
- `archived`

### Card.claim_status

- `unclaimed`
- `claimed`

### CardVersion.status

- `active`
- `lost`
- `replaced`
- `invalid`

### NFC 安全级别

- `none`：普通静态 NFC URL，只做跳转
- `version_check`：扫描后校验是否为当前有效 `CardVersion`
- `challenge_response`：安全 NFC 芯片参与动态签名校验

## 实体关系

- `User 1 - n Collection`
- `Collection 1 - n Card`
- `Card 1 - n CardVersion`
- `Card 1 - n OwnershipHistory`
- `Card 1 - n ClaimRequest`
- `User 1 - n owned Cards`

## 关键约束

- 一个 `Card` 只能有一个 `current_version_id`
- 一个 `CardVersion` 只能绑定一个 NFC 标签
- 一个 NFC 标签只能指向一个 `CardVersion`
- 补卡只创建新的 `CardVersion`
- 对外 URL 指向 `Card`，不指向 `CardVersion`
- 旧 `CardVersion` 一旦被替换，不能重新变回 `active`
- 若启用防伪，芯片身份应绑定到 `CardVersion`，而不是只绑定 `Card`

## 挂失与旧卡警示的实现方式

旧卡挂失的关键不在 NFC 本身，而在 `Card.current_version_id` 与 `CardVersion.status` 的联动。

推荐流程：

1. 用户发起挂失
2. 系统将当前版本标为 `lost`
3. 发行商补发新卡，创建新的 `CardVersion`
4. `Card.current_version_id` 切换到新版本
5. 老卡再次被扫描时，只能返回警示页

因此，“旧卡挂失”本质上是版本失效，不是 token 更换。

## 防伪实现建议

### 方案 A：MVP

使用普通 NFC 标签，只写 URL。后端根据 `CardVersion` 判断：

- 是不是当前有效版本
- 是否已挂失
- 是否已被替换

优点：

- 开发快
- 成本低
- 够做 demo

缺点：

- 不能防止 URL 被复制
- 不能防止 NFC 被克隆

### 方案 B：进阶

使用安全 NFC 芯片，加入 challenge-response。

需要新增的数据：

- `chip_public_key`
- `chip_certificate` 或厂商证书引用
- `last_auth_at`
- `last_auth_result`
- `auth_counter` 或设备单调计数器

扫描流程：

1. 前端发起扫描验证
2. 后端生成 challenge
3. 芯片返回签名
4. 后端验证签名
5. 后端确认该芯片绑定的 `CardVersion` 仍为当前版本
6. 返回 `authentic + active`、`authentic + replaced`、或 `unverified`

这个方案里真正的密码学价值在于：

- 防止仅复制 URL 就伪装成真卡
- 提高仿制卡复制成本
- 让“真卡但已失效”和“假卡/未验证”变成两种不同状态

## Base 方案下推荐实现

- 前端：`React + Vite + React Router`
- 3D：`Three.js + React Three Fiber + Drei`
- 登录：`Privy`
- 链交互：`viem`
- 合约：`Solidity + OpenZeppelin + Foundry`
- 后端：`Next.js`
- 数据库：`PostgreSQL + Prisma`
- 存储：`S3/R2`
- Gas 代付：`Relayer/Paymaster`

## Session A 结论

如果后续只围绕一个主表展开，必须选 `Card`。但它必须与 `CardVersion` 配套，不然挂失和补卡逻辑无法成立。

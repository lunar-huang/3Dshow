# 开发手册

## 1. 当前项目方向

当前目标不是继续做“3D NFT Viewer”，而是演化为“实体收藏卡的数字所有权 demo”。

开发判断优先级：

1. Ownership
2. Claim
3. History
4. Lost / Replacement
5. 视觉优化

## 2. 推荐文档使用方式

- `expect.md`：快速理解 demo 目标
- `docs/requirements.md`：查产品需求和范围
- `docs/sessions/session-a.md`：查当前数据模型
- `docs/guides/entity-writing.md`：查 entity 应该怎么写、写到哪里
- `docs/dev-log.md`：记录每天做了什么、改了什么、为什么改

## 3. 技术栈建议

### 建议保留

- React
- Three.js
- React Three Fiber
- Drei
- Vite

### 建议新增

- `react-router-dom`
- `tailwindcss`
- `zod`
- `Privy`
- `viem`
- `Next.js`
- `Prisma`
- `PostgreSQL`
- `OpenZeppelin`
- `Foundry`

## 4. 推荐模块拆分

### 前端

- Landing / Viewer
- Card Detail Page
- Claim Flow
- Profile Page
- Issuer Dashboard
- Warning Page for old cards

### 后端

- Auth / Session
- User Service
- Collection Service
- Card Service
- Claim Service
- Transfer Service
- Replacement Service
- Event Sync Service

### 合约

- NFT Contract
- Issuer Controller
- Optional Escrow Contract

## 5. 数据原则

- `Card` 代表编号身份
- `CardVersion` 代表实体卡版本
- 所有历史写入 `OwnershipHistory`
- 用户主身份是平台账号，不是钱包地址
- 链上状态与数据库状态必须可对账
- 挂失依赖 `CardVersion` 失效，不依赖销毁原 token
- 防伪不能只靠静态 URL，强防伪需要安全 NFC + challenge-response

## 6. 开发顺序

1. Session A：定数据模型
2. Session B：Privy 邮箱登录与托管钱包
3. Session C：Claim Link / Card Page
4. Session D：最小 Claim Flow
5. Session E：用户账户下可见 ownership
6. Session F：ownership history
7. Session G：issuer dashboard
8. Session H：transfer flow
9. Session I：lost report / replacement
10. Session J：old card warning

### 当前 MVP 垂直切片

先做一条能跑通的最小链路：

1. 用户打开 claim link
2. 用户用 Privy 邮箱登录
3. 页面读取 card 信息
4. 用户点击 claim
5. 系统完成 NFT claim
6. 用户在自己的账户下看到该 card

在这条链跑通前，不继续扩 marketplace、挂失或复杂后台。

### 当前正在做

- 已完成 Privy 邮箱登录
- 已完成最小 claim route 与 backend claim endpoint
- 已完成本地链上 claim 打通
- 当前下一步：去掉前后端重复 card 数据，改为后端提供 card detail

## 7. 注意事项

- 不要再引入需要用户自己管理的钱包流程
- 不要把 NFC 当作可信数据库
- 不要把补卡做成新 `Card`
- 不要先做复杂 marketplace
- 不要让 README 与当前链路线继续冲突
- 不要把“旧卡失效”和“真伪校验”混为一件事；这是两个独立问题

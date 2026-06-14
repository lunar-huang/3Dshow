# 详细需求

## 1. 产品定位

这不是一个 NFT marketplace，而是一个面向实体收藏品的 ownership layer。核心能力是：

- 发行
- claim
- 展示
- 转让
- 挂失
- 补发
- 历史追踪

用户不应被教育“如何使用区块链”，而应像使用普通互联网产品一样完成全部流程。

## 2. 用户角色

### 发行商 Issuer

负责：

- 创建系列
- mint 卡片
- 绑定 NFC
- 审核或执行 claim
- 处理挂失
- 发起补卡

### 普通用户 User

负责：

- 登录
- claim 卡片
- 展示卡片
- 发起转让
- 发起挂失

### 扫描访客 Visitor

负责：

- 扫描 NFC
- 查看卡片公开详情
- 查看历史
- 在旧卡失效时看到警示

## 3. 关键业务流程

### 发行

1. 发行商创建 `Collection`
2. 系统生成 `001 ~ 099`
3. 每张 `Card` 对应一个链上 token
4. 每张 `Card` 初始化一个 `CardVersion v1`
5. 每个 `CardVersion` 绑定一个 NFC URL

### Claim

1. 用户扫描 NFC 打开卡片页面
2. 使用 Google 登录
3. 提交 claim
4. 发行商或平台代付 gas 完成链上转移
5. 系统记录 claim 历史

### 展示

访客扫描卡片时可以看到：

- 卡片图像
- 系列名
- 编号
- 当前状态
- 当前有效版本
- 所有权历史

### 转让

1. 当前持有人发起出售
2. 买家支付稳定币
3. 系统完成 NFT 所有权转移
4. 写入历史
5. 线下寄送实体卡

### 挂失与补卡

1. 当前持有人发起挂失
2. 发行商确认挂失
3. 旧版本 `CardVersion` 失效
4. 创建新版本 `CardVersion`
5. 新 NFC 实体卡寄送给持有人
6. 扫描旧卡时显示失效警告

### 挂失后的旧卡处理

旧卡挂失的本质不是“物理销毁旧卡”，而是让旧卡在系统中不可再被当作有效卡使用。

系统行为应为：

1. 将旧 `CardVersion.status` 标记为 `replaced` 或 `lost`
2. 将 `Card.current_version_id` 指向新版本
3. 扫描旧卡时，页面只展示公开信息与红色警告
4. 旧卡不得再次 claim，不得重新激活，不得覆盖当前有效版本

### 防伪与防复制

如果 NFC 里只写一个静态 URL，那么复制标签的人可以低成本克隆一张“看起来能扫”的卡。因此这里最好分两层：

#### MVP 层

先实现“版本校验”，不先承诺“强防复制”：

- NFC 只存一个带 `cardVersionId` 的 URL
- 后端检查该 `CardVersion` 是否为当前有效版本
- 若不是当前版本，则显示 `replaced / invalid / lost` 警告
- 若是当前版本，则显示正常卡页

这一层能解决：

- 旧卡挂失后继续被扫的问题
- 用户看见旧卡时的识别问题

但不能真正解决：

- 标签复制
- URL 复制
- 高仿卡克隆

#### 进阶防伪层

如果要做更可信的防伪，需要安全 NFC 芯片或带芯片签名能力的标签，核心思路是 challenge-response：

1. 用户扫码后，前端向后端请求一次性 challenge
2. NFC 芯片使用芯片内私钥对 challenge 签名，或返回厂商签名材料
3. 后端用预置公钥或证书链验证签名
4. 验证通过后，再检查该芯片绑定的 `CardVersion` 是否仍是当前有效版本

这样才能同时回答两个问题：

- 这是不是“那一张真实出厂的卡”
- 这是不是“当前仍有效的版本”

## 4. 关键产品约束

- 用户不能被要求安装外部钱包
- 用户不能被要求管理助记词
- claim 不能要求用户自己支付 gas
- 一张编号卡的历史不能因为补卡而断裂
- 页面路由应面向 `Card`，不面向一次性的 NFC 标签
- 静态 NFC URL 只能解决“入口”，不能单独承担“防伪”

## 5. MVP 范围

本阶段必须做：

- Google 登录
- 自动托管钱包
- 卡片详情页
- claim flow
- ownership history
- issuer dashboard
- lost report
- replacement warning

本阶段可以暂缓：

- 完整 marketplace
- 多币种支付
- 复杂版税逻辑
- 高级社交能力

## 6. Base 方案下的技术需求

### 已有

- React
- Three.js
- React Three Fiber
- Drei
- Vite

### 还需要

- 登录与钱包抽象：`Privy` 优先
- 合约：`Solidity + OpenZeppelin`
- 链交互：`viem`
- 后端：`Next.js`
- 数据库：`PostgreSQL + Prisma`
- 索引：事件同步或 indexer
- Gas 代付：relayer / paymaster
- 存储：`S3` 或 `R2`
- NFC：URL 写卡流程

### 若要做强防伪，还需要

- 支持芯片签名或安全元素的 NFC 标签
- challenge-response 校验接口
- 芯片公钥 / 证书链管理
- 扫描校验日志

## 7. 文档索引

- demo 描述：[`../expect.md`](/Users/gg/Downloads/github/3Dshow/expect.md:1)
- Session A：[`sessions/session-a.md`](/Users/gg/Downloads/github/3Dshow/docs/sessions/session-a.md:1)
- 开发手册：[`handbook.md`](/Users/gg/Downloads/github/3Dshow/docs/handbook.md:1)
- 开发日志：[`dev-log.md`](/Users/gg/Downloads/github/3Dshow/docs/dev-log.md:1)

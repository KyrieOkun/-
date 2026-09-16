import { l, type L10n } from "@/lib/i18n/types";

export interface LegalSection {
  id: string;
  title: L10n;
  paragraphs: L10n[];
  bullets?: L10n[];
}

export interface LegalDoc {
  title: L10n;
  updated: string;
  intro: L10n;
  sections: LegalSection[];
}

export const privacyPolicy: LegalDoc = {
  title: l("隐私政策", "Privacy Policy"),
  updated: "2026-09-15",
  intro: l(
    "本隐私政策适用于「小米汽车 × 特斯拉 高级定制中心」网站及相关服务（以下简称「本平台」）。我们依据《中华人民共和国个人信息保护法》《网络安全法》《数据安全法》及相关法规处理您的个人信息。请在使用本平台前仔细阅读。",
    "This Privacy Policy applies to the Xiaomi EV × Tesla Atelier website and related services (the 'Platform'). We process personal information in accordance with the PRC Personal Information Protection Law, Cybersecurity Law, Data Security Law and related regulations. Please read it carefully before use.",
  ),
  sections: [
    {
      id: "collect",
      title: l("一、我们收集的信息", "1. Information we collect"),
      paragraphs: [l("我们仅收集为实现服务目的所必需的最少信息：", "We collect only the minimum information necessary for each service:")],
      bullets: [
        l("账户信息：姓名、手机号或邮箱、密码（加盐哈希存储）、所在城市。", "Account: name, mobile or email, password (salted hash), city."),
        l("订单与预约：购车人姓名、手机号、证件类型与证件号后 4 位、交付中心、配置与支付方式（支付由持牌支付机构处理，我们不存储完整卡号）。", "Orders & bookings: buyer name, mobile, ID type and last 4 characters, delivery centre, configuration and payment method (payments are processed by licensed providers; we never store full card numbers)."),
        l("车辆与联动数据：在您明确授权绑定品牌账号后，同步车架号、车辆基础状态（电量、续航、位置、锁车状态）、充电记录与软件版本，仅用于车库、充电与服务功能。", "Vehicle & connect data: after you explicitly link a brand account, we sync VIN, basic vehicle state (charge, range, location, lock state), charging history and software version, solely for Garage, charging and service features."),
        l("设备与日志：IP 地址、浏览器类型、访问时间、页面路径、语言偏好 Cookie，用于安全防护与性能优化。", "Device & logs: IP address, browser type, timestamps, page paths and the language-preference cookie, used for security and performance."),
      ],
    },
    {
      id: "use",
      title: l("二、我们如何使用信息", "2. How we use information"),
      paragraphs: [l("用于提供车辆选配、订购、试驾、置换、服务预约、跨品牌联动等功能；用于身份核验、风险控制与合规义务；在获得您单独同意的前提下用于向您推送新车与活动信息（可随时退订）。", "To provide configuration, ordering, demo drives, trade-in, service booking and cross-brand connect features; for identity verification, risk control and legal compliance; and, with your separate consent, to send vehicle and event updates (unsubscribe at any time).")],
    },
    {
      id: "share",
      title: l("三、信息的共享与委托处理", "3. Sharing and entrusted processing"),
      paragraphs: [l("为履行订单与服务，我们会将必要信息同步至小米汽车与特斯拉的官方系统及其授权交付、服务中心，以及持牌支付机构、短信服务商与云基础设施提供商。我们与受托方签署数据处理协议，要求其仅按我们的指示处理信息。除法律要求外，我们不会向任何第三方出售您的个人信息。", "To fulfil orders and services, necessary information is shared with the official systems of Xiaomi EV and Tesla and their authorised delivery and service centres, as well as licensed payment providers, SMS providers and cloud infrastructure vendors. Processors are bound by data processing agreements and act only on our instructions. We never sell personal information.")],
    },
    {
      id: "storage",
      title: l("四、存储地点与期限", "4. Storage location and retention"),
      paragraphs: [l("您的个人信息存储于中华人民共和国境内的服务器。账户信息在账户存续期间保留；订单信息依税务与消费者保护法规保留至少 5 年；撤销品牌账号授权后，相关车辆数据将在 30 天内删除或匿名化；日志数据保留不超过 6 个月。", "Personal information is stored on servers within mainland China. Account data is retained while the account exists; order records are retained for at least 5 years under tax and consumer-protection rules; after you revoke a brand-account authorisation, related vehicle data is deleted or anonymised within 30 days; logs are kept for no more than 6 months.")],
    },
    {
      id: "rights",
      title: l("五、您的权利", "5. Your rights"),
      paragraphs: [l("您有权查阅、复制、更正、补充、删除个人信息，撤回同意、注销账户，以及要求我们解释处理规则。您可在账户页面的隐私中心自助操作，或通过 privacy@mitesla-atelier.com 联系我们，我们将在 15 个工作日内响应。", "You may access, copy, correct, supplement and delete your personal information, withdraw consent, close your account and request an explanation of our processing rules. Use the Privacy Centre in your account or contact privacy@mitesla-atelier.com; we respond within 15 business days.")],
    },
    {
      id: "cookies",
      title: l("六、Cookie 与同类技术", "6. Cookies and similar technologies"),
      paragraphs: [l("我们使用严格必要的 Cookie 维持登录状态（mta_session）与语言偏好（mta_locale），以及本地存储保存您的选配与场景草稿。我们不使用第三方广告追踪 Cookie。您可以通过浏览器设置清除或阻止 Cookie，但部分功能可能因此不可用。", "We use strictly necessary cookies for session state (mta_session) and language preference (mta_locale), and local storage for configuration and scene drafts. We do not use third-party advertising trackers. You may clear or block cookies in your browser; some features may then be unavailable.")],
    },
    {
      id: "minors",
      title: l("七、未成年人保护", "7. Minors"),
      paragraphs: [l("本平台面向具备完全民事行为能力的成年人。若我们发现在未获得监护人同意的情况下收集了未成年人信息，将尽快删除。", "The Platform is intended for adults with full civil capacity. If we learn that we have collected a minor's information without guardian consent, we will delete it promptly.")],
    },
    {
      id: "security",
      title: l("八、安全措施", "8. Security"),
      paragraphs: [l("我们采用 TLS 传输加密、密码加盐哈希、最小权限访问控制、操作审计与异常监测等措施保护信息安全，并制定个人信息安全事件应急预案。发生安全事件时，我们将依法及时告知您并向监管部门报告。", "We protect information with TLS in transit, salted password hashing, least-privilege access control, audit logging and anomaly monitoring, and maintain an incident response plan. In the event of a security incident we will notify you and the regulator as required by law.")],
    },
    {
      id: "contact",
      title: l("九、联系我们", "9. Contact"),
      paragraphs: [l("个人信息保护负责人邮箱：privacy@mitesla-atelier.com；客服热线：400-800-0000。本政策更新时，我们将在本页面公布并以显著方式提示重大变更。", "Personal information protection officer: privacy@mitesla-atelier.com; hotline 400-800-0000. Updates are published on this page and material changes are prominently notified.")],
    },
  ],
};

export const termsOfService: LegalDoc = {
  title: l("服务条款", "Terms of Service"),
  updated: "2026-09-15",
  intro: l(
    "欢迎使用「小米汽车 × 特斯拉 高级定制中心」。本条款是您与本平台运营方之间关于使用本平台服务的协议。注册、下单或使用任何功能即视为您已阅读并同意本条款。",
    "Welcome to the Xiaomi EV × Tesla Atelier. These Terms form the agreement between you and the Platform operator regarding your use of the services. By registering, ordering or using any feature you confirm that you have read and accept these Terms.",
  ),
  sections: [
    {
      id: "role",
      title: l("一、平台性质", "1. Nature of the Platform"),
      paragraphs: [l("本平台为联名高级定制服务平台，提供车辆信息展示、在线选配、定金支付、预约与跨品牌联动服务。车辆的生产、销售合同签订、交付与质保由小米汽车或特斯拉及其授权渠道依各自官方政策履行。本平台展示的价格、续航与配置以品牌官方最新公布为准。", "The Platform is a co-branded bespoke service platform offering vehicle information, online configuration, deposit payment, bookings and cross-brand connect services. Production, sales contracts, delivery and warranty are fulfilled by Xiaomi EV or Tesla and their authorised channels under their official policies. Prices, range and specifications shown are subject to the brands' latest official announcements.")],
    },
    {
      id: "account",
      title: l("二、账户", "2. Accounts"),
      paragraphs: [l("您应提供真实、准确的注册信息并妥善保管密码。通过您账户进行的操作视为您本人行为。绑定小米账号或 Tesla 账号采用 OAuth 2.0 授权，您可随时在账户页面解绑。", "You must provide accurate registration details and keep your password secure. Actions taken through your account are deemed yours. Linking a Xiaomi or Tesla account uses OAuth 2.0 and can be revoked at any time in your account.")],
    },
    {
      id: "deposit",
      title: l("三、定金与订单", "3. Deposits and orders"),
      paragraphs: [l("支付定金即表示您确认所选配置。定金支付后 7 天内可无理由全额退款；配置锁定并进入排产后，定金不可退。定金在购车尾款中全额抵扣。SU7 Ultra 纽北限量版、定制工坊项目及现车车型可能适用专属条款，以下单页面提示为准。", "Paying a deposit confirms your chosen configuration. Deposits are fully refundable within 7 days; once the configuration is locked and production begins, deposits are non-refundable and are credited in full against the final payment. The SU7 Ultra Nürburgring Edition, Atelier programs and inventory vehicles may carry specific terms shown at checkout.")],
    },
    {
      id: "pricing",
      title: l("四、价格、税费与交付", "4. Pricing, taxes and delivery"),
      paragraphs: [l("本平台展示的购置税、月供与交付周期均为估算，最终以税务机关核定、金融机构审批与品牌官方排产为准。因政策调整、原材料价格变动导致的官方价格变化，以下单时锁定价格为准。", "Purchase tax, monthly payments and delivery windows are estimates; final figures are determined by the tax authority, the financing institution and the brand's production schedule. Official price changes due to policy or material costs do not affect prices locked at order.")],
    },
    {
      id: "connect",
      title: l("五、联动服务", "5. Connect services"),
      paragraphs: [l("跨品牌车库、远程控制、数字钥匙、行程规划等功能依赖品牌开放接口与车辆软件版本，可能因网络、车辆状态或品牌政策而暂时不可用。远程控制指令由您发出并自行承担相应责任；数字钥匙共享请仅授予您信任的人员。行程规划结果为参考，实际能耗受环境影响。", "Garage, remote controls, digital keys and trip planning depend on brand APIs and vehicle software and may be temporarily unavailable due to connectivity, vehicle state or brand policy. Remote commands are issued at your responsibility; share digital keys only with people you trust. Trip plans are estimates and real consumption varies with conditions.")],
    },
    {
      id: "ip",
      title: l("六、知识产权", "6. Intellectual property"),
      paragraphs: [l("小米、Xiaomi、SU7、YU7、澎程为小米集团商标；Tesla、Model 3、Model Y、Model S、Model X、Cybertruck 为 Tesla, Inc. 商标。本平台的页面设计、文案与代码受著作权法保护，未经许可不得复制或用于商业目的。", "Xiaomi, SU7, YU7 and SkyNomad are trademarks of Xiaomi Corporation; Tesla, Model 3, Model Y, Model S, Model X and Cybertruck are trademarks of Tesla, Inc. The Platform's design, copy and code are protected by copyright and may not be reproduced or used commercially without permission.")],
    },
    {
      id: "liability",
      title: l("七、责任限制", "7. Limitation of liability"),
      paragraphs: [l("在法律允许的范围内，本平台对因不可抗力、第三方服务中断或您自身原因造成的损失不承担责任；本平台对您的赔偿责任以您就相关服务实际支付的费用为限。本条款不排除法律规定不得排除的消费者权利。", "To the extent permitted by law, the Platform is not liable for losses caused by force majeure, third-party service interruptions or your own actions, and our liability is limited to the fees you actually paid for the relevant service. Nothing in these Terms excludes consumer rights that cannot be excluded by law.")],
    },
    {
      id: "law",
      title: l("八、法律适用与争议解决", "8. Governing law and disputes"),
      paragraphs: [l("本条款适用中华人民共和国法律。因本条款产生的争议，双方应友好协商；协商不成的，提交本平台运营方所在地有管辖权的人民法院解决。", "These Terms are governed by the laws of the People's Republic of China. Disputes shall first be resolved through consultation; failing that, they shall be submitted to the competent people's court where the Platform operator is domiciled.")],
    },
    {
      id: "changes",
      title: l("九、条款变更", "9. Changes"),
      paragraphs: [l("我们可能适时更新本条款，更新后的条款将在本页面公布并注明生效日期。重大变更将通过站内通知或短信提示。继续使用服务即视为接受更新后的条款。", "We may update these Terms from time to time; updates are published here with an effective date. Material changes are notified in-app or by SMS. Continued use constitutes acceptance of the updated Terms.")],
    },
  ],
};

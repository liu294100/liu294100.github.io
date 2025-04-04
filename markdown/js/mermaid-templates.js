/**
 * Mermaid图表模板集合
 * 提供各种类型的Mermaid图表模板供用户选择
 */

const mermaidTemplates = {
    // 流程图模板
    flowchart: {
        basic: `flowchart TD
    A[开始] --> B{判断条件}
    B -->|是| C[处理1]
    B -->|否| D[处理2]
    C --> E[结束]
    D --> E`,
        
        complex: `flowchart TD
    A[开始] --> B{条件1}
    B -->|是| C[处理1]
    B -->|否| D{条件2}
    C --> E[结束]
    D -->|是| F[处理2]
    D -->|否| G[处理3]
    F --> E
    G --> E`,
        
        lr: `flowchart LR
    A[开始] --> B(处理)
    B --> C{判断}
    C -->|是| D[结果1]
    C -->|否| E[结果2]`
    },
    
    // 时序图模板
    sequence: {
        basic: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    
    用户->>系统: 请求数据
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 显示数据`,
        
        loop: `sequenceDiagram
    participant A as 客户端
    participant B as 服务器
    
    A->>B: 请求数据
    B-->>A: 响应数据
    
    loop 每5分钟
        A->>B: 发送心跳包
        B-->>A: 确认心跳
    end`
    },
    
    // 类图模板
    classDiagram: {
        basic: `classDiagram
    class Animal {
        +String name
        +int age
        +makeSound()
    }
    
    class Dog {
        +fetch()
    }
    
    class Cat {
        +climb()
    }
    
    Animal <|-- Dog
    Animal <|-- Cat`,
        
        relationships: `classDiagram
    class Order {
        +OrderStatus status
    }
    class OrderItem {
        +String productName
        +int quantity
        +float price
    }
    class Customer {
        +String name
        +String address
    }
    
    Order "1" *-- "many" OrderItem : contains
    Customer "1" --> "many" Order : places`
    },
    
    // 状态图模板
    stateDiagram: {
        basic: `stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中 : 开始处理
    处理中 --> 已完成 : 完成处理
    处理中 --> 已取消 : 取消
    已完成 --> [*]
    已取消 --> [*]`,
        
        complex: `stateDiagram-v2
    [*] --> 待付款
    待付款 --> 已付款 : 支付
    待付款 --> 已取消 : 超时/取消
    已付款 --> 配送中 : 发货
    配送中 --> 已签收 : 签收
    已签收 --> 已完成 : 确认
    已签收 --> 退款中 : 申请退款
    退款中 --> 已退款 : 退款成功
    已完成 --> [*]
    已取消 --> [*]
    已退款 --> [*]`
    },
    
    // 实体关系图模板
    erDiagram: {
        basic: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    CUSTOMER }|..|{ DELIVERY_ADDRESS : uses`,
        
        detailed: `erDiagram
    CUSTOMER {
        string id PK
        string name
        string email
    }
    ORDER {
        string id PK
        string customerId FK
        date orderDate
        string status
    }
    PRODUCT {
        string id PK
        string name
        float price
    }
    ORDER_ITEM {
        string orderId FK
        string productId FK
        int quantity
    }
    
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"`
    },
    
    // 旅程图模板
    journey: {
        basic: `journey
    title 用户购买流程
    section 浏览阶段
      访问网站: 5: 用户
      浏览商品: 4: 用户
      查看详情: 3: 用户
    section 购买阶段
      加入购物车: 5: 用户
      结算: 3: 用户
      支付: 2: 用户, 系统
    section 售后阶段
      确认收货: 5: 用户
      评价: 3: 用户`
    },
    
    // 甘特图模板
    gantt: {
        basic: `gantt
    title 项目计划
    dateFormat  YYYY-MM-DD
    section 规划阶段
    需求分析        :a1, 2023-01-01, 7d
    系统设计        :a2, after a1, 10d
    section 开发阶段
    编码实现        :a3, after a2, 15d
    单元测试        :a4, after a3, 5d
    section 发布阶段
    系统测试        :a5, after a4, 7d
    用户验收        :a6, after a5, 3d
    上线部署        :a7, after a6, 2d`,
        
        withStatus: `gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 设计
    完成设计文档     :done, des1, 2023-01-01, 2023-01-05
    UI设计         :active, des2, 2023-01-06, 3d
    section 开发
    前端开发        :crit, dev1, after des2, 5d
    后端开发        :dev2, after dev1, 7d
    section 测试
    功能测试        :test1, after dev2, 3d
    性能测试        :test2, after test1, 2d`
    },

    // 饼状图模板
    pie: {
        basic: `pie
    title 项目资源分配
    "开发" : 40
    "测试" : 20
    "设计" : 15
    "运维" : 15
    "其他" : 10`,

        detailed: `pie
    title 季度销售业绩
    "产品A" : 30.5
    "产品B" : 25.8
    "产品C" : 20.2
    "产品D" : 15.5
    "其他产品" : 8.0`
    },

    // 思维导图模板
    mindmap: {
        basic: `mindmap
    root((思维导图))
        软件开发
            前端
                HTML
                CSS
                JavaScript
            后端
                Java
                Python
                数据库
            运维
                部署
                监控
                优化`,

        project: `mindmap
    root((项目规划))
        需求分析
            用户需求
            系统需求
            功能需求
        系统设计
            架构设计
            数据库设计
            接口设计
        开发实现
            前端开发
            后端开发
            测试验证
        运维部署
            环境配置
            性能优化
            监控告警`
    },
    
    // 饼图模板
    pie: {
        basic: `pie title 网站流量来源
    "搜索引擎" : 45.2
    "直接访问" : 30.5
    "社交媒体" : 15.3
    "邮件营销" : 9.0`,
        
        showData: `pie showData
    title 项目预算分配
    "开发" : 40
    "营销" : 20
    "运维" : 25
    "其他" : 15`
    },
    
    // 思维导图模板
    mindmap: {
        basic: `mindmap
    root((思维导图))
      项目管理
        ::icon(fa fa-calendar)
        范围管理
        时间管理
        成本管理
      软件开发
        ::icon(fa fa-code)
        前端
          HTML
          CSS
          JavaScript
        后端
          数据库
          API
          服务器
      团队协作
        ::icon(fa fa-users)
        沟通
        文档
        版本控制`
    },
    
    // 时间轴模板
    timeline: {
        basic: `timeline
    title 公司发展历程
    section 创立阶段
      公司成立 : 2010
      首轮融资 : 2011
      产品发布 : 2012
    section 成长阶段
      市场扩张 : 2013-2015
      二轮融资 : 2016
      国际化   : 2017-2018
    section 成熟阶段
      上市     : 2019
      多元化   : 2020-至今`
    }
};

// 导出模板对象供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = mermaidTemplates;
}
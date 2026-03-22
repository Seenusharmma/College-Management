# Technical Diagrams

This document contains all technical diagrams for the AcademicHub project.

## Table of Contents

1. [Architecture Diagrams](#architecture-diagrams)
2. [Sequence Diagrams](#sequence-diagrams)
3. [Entity Relationship Diagrams](#entity-relationship-diagrams)
4. [State Diagrams](#state-diagrams)
5. [Deployment Diagrams](#deployment-diagrams)

---

## Architecture Diagrams

### System Architecture Overview

```mermaid
flowchart TB
    subgraph Client["👤 Client Layer"]
        WEB[🌐 Web Browser]
        PWA[📱 Progressive Web App]
    end
    
    subgraph CDN["🌐 CDN & Edge"]
        CLOUDFLARE[Cloudflare CDN]
        WAF[Web Application Firewall]
    end
    
    subgraph Frontend["🎨 Frontend - Next.js 16"]
        NEXT[Next.js Server]
        COMPONENTS[React Components]
        STATE[Zustand State]
        QUERY[TanStack Query]
        STORE[(Redux/Persist)]
    end
    
    subgraph LoadBalancer["⚖️ Load Balancer"]
        NGINX[NGINX Reverse Proxy]
    end
    
    subgraph Backend["⚙️ Backend - Express.js"]
        API[Express Server]
        MIDDLEWARE[Middleware Stack]
        ROUTES[API Routes]
        SERVICES[Business Logic]
    end
    
    subgraph DataLayer["🗄️ Data Layer"]
        MONGODB[(🗃️ MongoDB 7)]
        REDIS[(⚡ Redis Cache)]
    end
    
    subgraph Storage["💾 Storage Layer"]
        CLOUDINARY[☁️ Cloudinary CDN]
        S3[(📦 AWS S3 Backup)]
    end
    
    subgraph External["🔗 External Services"]
        CLERK[🔐 Clerk Authentication]
        SMTP[📧 Email Service]
        ANALYTICS[📊 Analytics]
    end
    
    Client --> CDN
    CDN --> Frontend
    Frontend --> LoadBalancer
    LoadBalancer --> Backend
    Backend --> DataLayer
    Backend --> Storage
    Backend --> External
    
    style Frontend fill:#e1f5fe
    style Backend fill:#fff3e0
    style DataLayer fill:#e8f5e9
```

### Data Flow Architecture

```mermaid
flowchart LR
    subgraph Input["📥 Input Flow"]
        USER[User Action]
        FORM[Form Data]
        FILE[File Upload]
    end
    
    subgraph Processing["⚙️ Processing"]
        VALIDATE[Validate]
        TRANSFORM[Transform]
        AUTH[Authenticate]
        BUSINESS[Business Logic]
    end
    
    subgraph Storage["💾 Storage"]
        DB[(MongoDB)]
        CDN[(Cloudinary)]
        CACHE[(Redis)]
    end
    
    subgraph Output["📤 Output Flow"]
        RESPONSE[API Response]
        UI[UI Update]
        NOTIFICATION[Notification]
    end
    
    Input --> Processing
    Processing --> Storage
    Storage --> Output
    
    VALIDATE -.->|Fail| ERROR[Error Response]
    AUTH -.->|Fail| ERROR
```

---

## Sequence Diagrams

### User Authentication Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 🎨 Frontend
    participant C as 🔐 Clerk
    participant B as ⚙️ Backend
    participant D as 🗄️ Database
    
    U->>F: Click "Sign In"
    F->>C: Redirect to Clerk
    C->>U: Show Login Form
    U->>C: Enter Credentials
    C->>C: Validate Credentials
    C->>F: Return JWT Token
    F->>B: Request with JWT
    B->>C: Verify Token
    C->>B: Return User Data
    B->>D: Find/Create User
    D-->>B: User Record
    B->>B: Update Session
    B-->>F: Success + User
    F-->>U: Redirect to Dashboard
```

### Content Upload Flow

```mermaid
sequenceDiagram
    participant U as 👤 Teacher
    participant F as 🎨 Frontend
    participant B as ⚙️ Backend
    participant M as 📦 Multer
    participant C as ☁️ Cloudinary
    participant D as 🗄️ MongoDB
    
    U->>F: Fill Upload Form
    F->>F: Client-side Validation
    U->>F: Select File
    F->>F: Preview File
    U->>F: Click Submit
    F->>B: POST /api/content (multipart)
    B->>M: Process File Upload
    M->>M: Buffer File
    M->>C: Upload to Cloudinary
    C-->>M: Return URL
    M-->>B: File Metadata
    B->>B: Validate with Zod
    B->>D: Create Content Document
    D-->>B: Saved Content
    B-->>F: Success Response
    F-->>U: Show Success Toast
```

### Content Search Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant F as 🎨 Frontend
    participant B as ⚙️ Backend
    participant R as ⚡ Redis Cache
    participant D as 🗄️ MongoDB
    
    U->>F: Enter Search Query
    F->>F: Debounce Input (300ms)
    U->>F: Apply Filters
    F->>F: Build Query Params
    U->>F: Click Search
    F->>B: GET /api/content?q=&filters=
    B->>R: Check Cache
    R-->>B: Cache Hit?
    
    alt Cache Hit
        B->>R: Get Cached Results
        R-->>B: Return Cached Data
    else Cache Miss
        B->>D: Query MongoDB
        D-->>B: Return Results
        B->>R: Cache Results (TTL: 5min)
    end
    
    B-->>F: Return Results
    F->>F: Render Results List
    F-->>U: Display Content Cards
```

---

## Entity Relationship Diagrams

### Complete Data Model

```mermaid
erDiagram
    USER ||--o{ CONTENT : "creates"
    USER ||--o{ SESSION : "has"
    USER {
        string _id PK
        string clerkUserId UK
        string email UK NN
        string name
        string avatar_url
        enum role FK
        datetime created_at
        datetime updated_at
    }
    
    ROLE ||--o{ USER : "assigned to"
    ROLE {
        string _id PK
        string name UK NN
        string permissions JSON
    }
    
    CONTENT ||--o{ CONTENT_TAG : "tagged with"
    CONTENT ||--|| USER : "uploaded by"
    CONTENT ||--o| CATEGORY : "belongs to"
    CONTENT {
        string _id PK
        string title NN
        string description
        enum type FK
        string file_url
        string file_type
        int file_size
        string branch FK
        int semester
        string subject
        ObjectId uploaded_by FK
        int downloads default 0
        int views default 0
        bool is_active default true
        datetime created_at
        datetime updated_at
    }
    
    CATEGORY ||--o{ CONTENT : "categorizes"
    CATEGORY {
        string _id PK
        string name UK NN
        string type NN
        bool is_active default true
    }
    
    TAG ||--o{ CONTENT_TAG : "used in"
    TAG {
        string _id PK
        string name UK
        int usage_count default 0
    }
    
    CONTENT_TAG ||--|| CONTENT : ""
    CONTENT_TAG ||--|| TAG : ""
    CONTENT_TAG {
        ObjectId content_id FK
        ObjectId tag_id FK
    }
    
    SESSION ||--|| USER : "belongs to"
    SESSION {
        string _id PK
        ObjectId user_id FK
        string token
        datetime expires_at
        string ip_address
        string user_agent
    }
    
    AUDIT_LOG ||--|| USER : "performed by"
    AUDIT_LOG {
        string _id PK
        ObjectId user_id FK
        string action
        string resource
        string details JSON
        datetime created_at
    }
```

---

## State Diagrams

### Content Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Draft : Create
    
    Draft --> Review : Submit
    Review --> Draft : Reject
    Review --> Published : Approve
    Review --> Archived : Archive
    
    Published --> Archived : Archive
    Published --> Draft : Unpublish
    Published --> Published : Update
    
    Archived --> Published : Restore
    Archived --> [*] : Permanent Delete
    
    Draft --> [*] : Delete
    
    note right of Published : Visible to all users
    note right of Draft : Only creator
    note right of Archived : Hidden but preserved
```

### User Authentication States

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Authenticating : Login Click
    Authenticating --> Authenticated : Success
    Authenticating --> Failed : Invalid Credentials
    Failed --> Authenticating : Retry
    Failed --> Unauthenticated : Cancel
    
    Authenticated --> SessionActive : Token Received
    SessionActive --> SessionExpired : Token Expired
    SessionActive --> Refreshing : Refresh Token
    Refreshing --> SessionActive : Success
    Refreshing --> Unauthenticated : Fail
    
    SessionExpired --> Refreshing : Auto Refresh
    SessionExpired --> Unauthenticated : Logout
    
    Authenticated --> Unauthenticated : Logout
    SessionActive --> Unauthenticated : Logout
```

---

## Deployment Diagrams

### Production Infrastructure

```mermaid
flowchart TB
    subgraph Internet["🌐 Internet"]
        USERS[👥 End Users]
    end
    
    subgraph AWS["☁️ AWS Cloud"]
        subgraph Edge["Edge Layer"]
            CLOUDFRONT[CloudFront CDN]
            WAF[AWS WAF]
            ROUTE53[Route 53]
        end
        
        subgraph Compute["Compute Layer"]
            ECS_F[ECS - Frontend]
            ECS_B1[ECS - Backend 1]
            ECS_B2[ECS - Backend 2]
            ECS_B3[ECS - Backend 3]
            LB[Application LB]
        end
        
        subgraph Data["Data Layer"]
            DOCDB[(DocumentDB)]
            ELASTICACHE[(ElastiCache)]
            S3[(S3 Bucket)]
        end
        
        subgraph Monitoring["Monitoring"]
            CLOUDWATCH[CloudWatch]
            XRAY[X-Ray]
            GUARDIAN[CloudWatch Guardian]
        end
    end
    
    subgraph External["External Services"]
        CLERK[🔐 Clerk.com]
        CLOUDINARY[☁️ Cloudinary]
    end
    
    USERS --> ROUTE53
    ROUTE53 --> CLOUDFRONT
    CLOUDFRONT --> WAF
    WAF --> LB
    LB --> ECS_F
    LB --> ECS_B1
    LB --> ECS_B2
    ECS_B1 --> DOCDB
    ECS_B1 --> ELASTICACHE
    ECS_B1 --> S3
    ECS_B2 --> DOCDB
    ECS_B2 --> ELASTICACHE
    ECS_B2 --> S3
    ECS_B3 --> DOCDB
    ECS_B3 --> ELASTICACHE
    ECS_B3 --> S3
    
    ECS_F --> CLERK
    ECS_B1 --> CLERK
    ECS_B1 --> CLOUDINARY
    
    ECS_F --> CLOUDWATCH
    ECS_B1 --> CLOUDWATCH
    ECS_B2 --> CLOUDWATCH
    ECS_B3 --> CLOUDWATCH
    
    style AWS fill:#ff9900,stroke:#333
    style Compute fill:#232f3e,stroke:#333,color:#fff
    style Data fill:#3b48cc,stroke:#333,color:#fff
```

### CI/CD Pipeline

```mermaid
flowchart LR
    subgraph Code["💻 Code Stage"]
        DEV[Developer]
        IDE[VS Code]
        GIT[GitHub]
    end
    
    subgraph Build["🔨 Build Stage"]
        ACTIONS[GitHub Actions]
        TEST[Test Suite]
        BUILD[Build]
        DOCKER[Docker Build]
    end
    
    subgraph Quality["✅ Quality Stage"]
        SONAR[SonarQube]
        SEC[Security Scan]
        DEP[Dependency Check]
    end
    
    subgraph Registry["📦 Registry Stage"]
        ECR[ECR Registry]
        SCAN[Vulnerability Scan]
    end
    
    subgraph Deploy["🚀 Deploy Stage"]
        STAGING[Staging]
        APPROVAL[Manual Approval]
        PROD[Production]
    end
    
    subgraph Monitor["📊 Monitor Stage"]
        CLOUDWATCH[CloudWatch]
        ALERT[Alerting]
        DASHBOARD[Dashboard]
    end
    
    DEV --> IDE
    IDE --> GIT
    GIT --> ACTIONS
    ACTIONS --> TEST
    TEST --> BUILD
    BUILD --> DOCKER
    DOCKER --> SONAR
    SONAR --> SEC
    SEC --> DEP
    DEP --> ECR
    ECR --> SCAN
    SCAN --> STAGING
    STAGING --> APPROVAL
    APPROVAL --> PROD
    PROD --> CLOUDWATCH
    CLOUDWATCH --> ALERT
    ALERT --> DASHBOARD
```

---

## Network Diagrams

### Request/Response Flow

```mermaid
flowchart TD
    subgraph Request["📤 Outgoing Request"]
        A[Client App]
        B[TLS Handshake]
        C[HTTP Request]
        D[Headers]
        E[Body/Payload]
    end
    
    subgraph Gateway["🚪 API Gateway"]
        F[Load Balancer]
        G[Rate Limiter]
        H[Auth Validator]
        I[CORS Check]
    end
    
    subgraph AppServer["⚙️ Application Server"]
        J[Router]
        K[Middleware]
        L[Controller]
        M[Service]
        N[Repository]
    end
    
    subgraph Data["🗄️ Data Store"]
        O[(Database)]
        P[(Cache)]
    end
    
    subgraph Response["📥 Incoming Response"]
        Q[JSON Response]
        R[HTTP Status]
        S[Client Update]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    J --> K
    K --> L
    L --> M
    M --> N
    N --> O
    N --> P
    O --> Q
    P --> Q
    Q --> R
    R --> S
```

---

## Security Diagrams

### Security Architecture

```mermaid
flowchart TB
    subgraph Threats["🚨 Threat Landscape"]
        INJECTION[SQL/NoSQL Injection]
        XSS[Cross-Site Scripting]
        CSRF[CSRF Attacks]
        DDOS[DDoS Attacks]
        MITM[Man-in-the-Middle]
        LEAK[Data Leakage]
    end
    
    subgraph Defenses["🛡️ Security Layers"]
        subgraph Perimeter["Perimeter Security"]
            WAF[Web Application Firewall]
            DDOS[DDoS Protection]
            SSL[SSL/TLS Termination]
        end
        
        subgraph Application["Application Security"]
            AUTH[Authentication]
            RBAC[Role-Based Access]
            INPUT[Input Validation]
            OUTPUT[Output Encoding]
        end
        
        subgraph Data["Data Security"]
            ENCRYPT[Encryption at Rest]
            SANITIZE[Data Sanitization]
            BACKUP[Secure Backups]
        end
        
        subgraph Monitoring["Security Monitoring"]
            LOG[Audit Logging]
            ALERT[Real-time Alerts]
            SIEM[SIEM Integration]
        end
    end
    
    subgraph Responses["🔄 Security Responses"]
        BLOCK[Block Attack]
        ALERT[Alert Security Team]
        LOG_THREAT[Log Incident]
        AUTO_RESPONSE[Automated Response]
    end
    
    Threats --> Perimeter
    Perimeter --> Application
    Application --> Data
    Data --> Monitoring
    Monitoring --> Responses
    Responses --> BLOCK
    Responses --> ALERT
    
    style Threats fill:#ffebee
    style Defenses fill:#e8f5e9
    style Responses fill:#fff3e0
```

---

## Monitoring Diagrams

### Observability Stack

```mermaid
flowchart LR
    subgraph Collect["📊 Collection"]
        METRICS[Metrics]
        LOGS[Logs]
        TRACES[Traces]
    end
    
    subgraph Store["💾 Storage"]
        PROM[Prometheus]
        ELASTIC[Elasticsearch]
        JAEGER[Jaeger]
    end
    
    subgraph Visualize["📈 Visualization"]
        GRAFANA[Grafana]
        KIBANA[Kibana]
        GRAFANA_TRACE[Trace UI]
    end
    
    subgraph Alert["⚠️ Alerting"]
        ALERT_MANAGER[Alert Manager]
        PAGERDUTY[PagerDuty]
        SLACK[Slack Notifications]
    end
    
    subgraph Respond["🔧 Response"]
        RUNBOOK[Runbooks]
        AUTO_HEAL[Auto-healing]
        ESCALATE[Escalation]
    end
    
    Collect --> Store
    Store --> Visualize
    Store --> Alert
    Alert --> Respond
    Alert --> SLACK
    
    style Collect fill:#e3f2fd
    style Store fill:#f3e5f5
    style Visualize fill:#e8f5e9
    style Alert fill:#fff3e0
```

---

*End of Diagrams Document*

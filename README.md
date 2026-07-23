# AetherAuth

> Cổng xác thực người dùng hiện đại gồm **Đăng ký, Đăng nhập và Hồ sơ cá nhân**, được xây dựng bằng React, Firebase và Vite. Giao diện sử dụng phong cách **Liquid Obsidian Glass** với nền WebGL tương tác, glassmorphism đơn sắc và trải nghiệm responsive.

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61dafb" />
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-ffca28?logo=firebase&logoColor=black" />
  <img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" />
  <img alt="Vitest" src="https://img.shields.io/badge/Test-Vitest-6e9f18?logo=vitest&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel" />
</p>

## Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng](#tính-năng)
- [Luồng hệ thống](#luồng-hệ-thống)
- [Công nghệ](#công-nghệ)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt local](#cài-đặt-local)
- [Cấu hình Firebase](#cấu-hình-firebase)
- [Mô hình dữ liệu](#mô-hình-dữ-liệu)
- [Bảo mật](#bảo-mật)
- [Kiểm thử và chất lượng](#kiểm-thử-và-chất-lượng)
- [Triển khai Vercel](#triển-khai-vercel)
- [Khả năng truy cập và hiệu năng](#khả-năng-truy-cập-và-hiệu-năng)
- [Giới hạn hiện tại](#giới-hạn-hiện-tại)

---

## Tổng quan

AetherAuth tập trung vào ba luồng chính:

1. Tạo tài khoản bằng email và mật khẩu.
2. Đăng nhập bằng Firebase Authentication.
3. Quản lý hồ sơ cá nhân và ảnh đại diện được lưu bền vững trên Firebase.

Ứng dụng không sử dụng dữ liệu hồ sơ giả hoặc cơ chế xác thực dự phòng bằng `localStorage`. Firebase Authentication là nguồn xác định phiên đăng nhập; Cloud Firestore lưu dữ liệu hồ sơ và Firebase Storage lưu tệp avatar.

### Liên kết

- **Repository:** <https://github.com/anhduyalpha/Login-Page>
- **Tài liệu thiết kế:** [`docs/DESIGN_IMPLEMENTATION.md`](./docs/DESIGN_IMPLEMENTATION.md)
- **Tài liệu triển khai:** [`DEPLOYMENT.md`](./DEPLOYMENT.md)
- **Tài liệu sử dụng AI:** [`Skill.md`](./Skill.md)
- **Production:** thêm URL public sau khi cấu hình domain Vercel chính thức

---

## Tính năng

### Đăng ký

- Kiểm tra email bắt buộc và đúng định dạng.
- Yêu cầu mật khẩu tối thiểu 8 ký tự.
- Yêu cầu ít nhất một chữ hoa, một chữ thường và một ký tự đặc biệt.
- Kiểm tra `Confirm Password` khớp mật khẩu.
- Hiển thị trạng thái yêu cầu mật khẩu theo thời gian thực.
- Chặn submit lặp trong lúc xử lý.
- Tạo tài khoản bằng Firebase Authentication.
- Tạo tài liệu hồ sơ tại `users/{uid}` trong Cloud Firestore.
- Rollback tài khoản Authentication nếu ghi hồ sơ Firestore thất bại.
- Đăng xuất tài khoản vừa tạo và chuyển về màn hình đăng nhập sau khi hoàn tất.

### Đăng nhập

- Đăng nhập bằng email và mật khẩu.
- Chuyển lỗi Firebase thành thông báo tiếng Việt dễ hiểu.
- Chỉ tải hồ sơ Firestore sau khi Authentication xác nhận người dùng.
- Khôi phục phiên đăng nhập bằng listener `onAuthStateChanged`.
- Không dùng `localStorage` làm nguồn xác thực.

### Hồ sơ người dùng

Người dùng đã đăng nhập có thể:

- xem và chỉnh sửa họ, tên, số điện thoại, địa chỉ và giới thiệu cá nhân;
- đồng bộ tên hiển thị với Firebase Authentication;
- xem avatar hiện tại hoặc chữ viết tắt khi chưa có ảnh;
- chọn và xem trước avatar mới trước khi lưu;
- theo dõi tiến trình tải ảnh;
- thay avatar mà không xóa ảnh cũ trước khi cập nhật thành công;
- giữ dữ liệu sau khi refresh, đăng xuất và đăng nhập lại.

### Avatar bảo mật

- Định dạng hỗ trợ: JPEG, PNG và WebP.
- Dung lượng tối đa: 5 MB.
- Kiểm tra cả MIME type và chữ ký nhị phân của tệp.
- Không lưu ảnh Base64 trong Firestore.
- Đường dẫn Storage:

```text
avatars/{uid}/{timestamp}-{safeFilename}
```

- Firestore chỉ lưu metadata:

```text
photoURL
photoPath
photoUpdatedAt
```

- Ảnh cũ chỉ được xóa sau khi ảnh mới, Firebase Auth và Firestore đều cập nhật thành công.
- Chỉ xóa đường dẫn thuộc thư mục `avatars/{currentUid}/`.

---

## Luồng hệ thống

### Đăng ký

```text
Register form
  → Firebase Authentication tạo tài khoản
  → Firestore tạo users/{uid}
  → Nếu Firestore lỗi: xóa Auth user vừa tạo
  → Nếu thành công: đăng xuất
  → Chuyển sang Login
```

### Đăng nhập và tải hồ sơ

```text
Login form
  → Firebase Authentication xác thực
  → Firestore đọc users/{uid}
  → AuthContext cập nhật người dùng hiện tại
  → Mở Profile
```

### Cập nhật avatar

```text
Chọn ảnh
  → Kiểm tra MIME, dung lượng và file signature
  → Hiển thị preview tạm thời
  → Upload Firebase Storage
  → Lấy download URL
  → Cập nhật Firebase Auth photoURL
  → Cập nhật Firestore photoURL, photoPath, photoUpdatedAt
  → Cập nhật AuthContext
  → Best-effort xóa avatar cũ thuộc đúng UID
```

---

## Thiết kế giao diện

### Liquid Obsidian Glass

- Nền WebGL toàn màn hình.
- Chuyển động bề mặt nước bằng noise và displacement.
- Ripple theo hover, click và tap.
- Phản ứng theo vị trí và vận tốc con trỏ.
- Khúc xạ ánh sáng graphite và highlight bề mặt.
- Panel form được tách khỏi vùng tương tác nền để giữ khả năng đọc.
- Hỗ trợ `prefers-reduced-motion`.
- Fallback tĩnh khi WebGL không khả dụng.
- Giảm độ phức tạp shader trên thiết bị mobile.

### Nguyên tắc UX

- Form và nội dung luôn là điểm tập trung chính.
- Hiệu ứng nền không chặn thao tác người dùng.
- Trạng thái loading, lỗi và thành công được thể hiện rõ bằng văn bản.
- Touch target quan trọng có kích thước tối thiểu khoảng 44 px.
- Điều hướng bàn phím và focus state được hỗ trợ.

---

## Công nghệ

| Nhóm | Công nghệ |
|---|---|
| Frontend | React 19, JSX |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 4, CSS tùy chỉnh |
| Animation | Framer Motion |
| Icons | Lucide React |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| File storage | Firebase Storage |
| Visual effect | WebGL fragment shader |
| Unit test | Vitest |
| Browser automation | Puppeteer |
| Lint | ESLint |
| Deployment | Vercel |

---

## Cấu trúc dự án

```text
Login-Page/
├── docs/
│   ├── screenshots/
│   └── DESIGN_IMPLEMENTATION.md
├── public/
├── scripts/
│   ├── capture_screenshots.js
│   └── verify_firebase_emulator.mjs
├── src/
│   ├── components/
│   │   ├── AlertMessage.jsx
│   │   ├── AuthLayout.jsx
│   │   ├── LiquidGlassBackground.jsx
│   │   ├── NotificationToast.jsx
│   │   └── PrimaryButton.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── ProfilePage.jsx
│   │   └── RegisterPage.jsx
│   ├── services/
│   │   ├── firebase.js
│   │   └── firebase.test.js
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── storage.rules
├── package.json
├── vite.config.js
├── vitest.config.js
└── README.md
```

---

## Yêu cầu hệ thống

- Node.js 18 trở lên.
- npm 9 trở lên.
- Một Firebase project đã tạo Web App.
- Email/Password Authentication đã bật.
- Cloud Firestore đã được tạo.
- Firebase Storage đã được tạo.

Kiểm tra phiên bản:

```bash
node --version
npm --version
```

---

## Cài đặt local

### 1. Clone repository

```bash
git clone https://github.com/anhduyalpha/Login-Page.git
cd Login-Page
```

### 2. Cài dependency

```bash
npm install
```

### 3. Tạo file môi trường

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

CMD:

```cmd
copy .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

### 4. Điền biến Firebase

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Tùy chọn
VITE_FIREBASE_MEASUREMENT_ID=
```

Không commit `.env.local` hoặc bất kỳ tệp nào chứa giá trị thật.

### 5. Chạy development server

```bash
npm run dev
```

Ứng dụng mặc định chạy tại:

```text
http://localhost:3000
```

---

## Cấu hình Firebase

### 1. Tạo Web App

```text
Firebase Console
→ Project settings
→ General
→ Your apps
→ Add app / Web
→ SDK setup and configuration
```

Ánh xạ Firebase config sang biến Vite:

| Firebase config | Biến môi trường |
|---|---|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |
| `measurementId` | `VITE_FIREBASE_MEASUREMENT_ID` — tùy chọn |

### 2. Bật Email/Password Authentication

```text
Firebase Console
→ Authentication
→ Sign-in method
→ Email/Password
→ Enable
```

### 3. Tạo Cloud Firestore

```text
Firebase Console
→ Firestore Database
→ Create database
```

### 4. Tạo Firebase Storage

```text
Firebase Console
→ Storage
→ Get started
→ Tạo default bucket trong cùng Firebase project
```

### 5. Deploy security rules

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only firestore:rules,storage
```

`firebase.json` đã liên kết:

```text
firestore.rules
storage.rules
```

---

## Mô hình dữ liệu

Tài liệu người dùng nằm tại:

```text
users/{uid}
```

Ví dụ:

```js
{
  uid: "firebase-auth-uid",
  email: "user@example.com",
  displayName: "Nguyen Van A",
  firstName: "Nguyen Van",
  lastName: "A",
  phone: "+84...",
  address: "...",
  bio: "...",
  photoURL: "https://...",
  photoPath: "avatars/{uid}/{timestamp}-avatar.webp",
  photoUpdatedAt: Timestamp,
  createdAt: "ISO timestamp",
  updatedAt: "ISO timestamp"
}
```

Các trường avatar là tùy chọn để tài khoản cũ không bị ảnh hưởng.

Ứng dụng không lưu trong Firestore:

- mật khẩu hoặc confirm password;
- dữ liệu ảnh Base64;
- Firebase access token;
- private key hoặc service-account credential;
- GitHub token.

---

## Bảo mật

### Firestore Rules

- Người dùng chỉ được đọc và ghi `users/{uid}` của chính mình.
- Document ID phải khớp Firebase Auth UID.
- `uid` và `email` không được thay đổi sau khi tạo.
- Mọi collection khác bị từ chối mặc định.

### Storage Rules

- Chỉ người đã đăng nhập được đọc avatar.
- Chỉ UID sở hữu được create, update hoặc delete trong `avatars/{uid}/`.
- Dung lượng server-side tối đa 5 MB.
- Chỉ chấp nhận `image/jpeg`, `image/png` và `image/webp`.
- Mọi đường dẫn Storage khác bị từ chối mặc định.

### Nguyên tắc quan trọng

- Firebase Web config không phải private key; quyền truy cập dữ liệu được bảo vệ bằng Authentication và Security Rules.
- Không đưa Firebase Admin SDK hoặc service account vào frontend.
- Không sử dụng rule dạng `allow read, write: if true` trong production.
- Không commit `.env`, `.env.local`, file credential hoặc dữ liệu người dùng thật.

---

## Các lệnh phát triển

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy Vite development server tại port 3000 |
| `npm run build` | Tạo production bundle trong `dist/` |
| `npm run preview` | Chạy thử production bundle |
| `npm run lint` | Kiểm tra source bằng ESLint |
| `npm run test` | Chạy unit test bằng Vitest |
| `npm run test:watch` | Chạy Vitest ở chế độ watch |
| `npm run verify:firebase` | Kiểm tra Auth và Firestore với Firebase Emulator Suite |
| `npm run capture-screenshots` | Chụp trạng thái giao diện bằng Puppeteer |

Quality gate đề xuất trước khi commit:

```bash
npm run lint
npm run test
npm run build
```

---

## Firebase Emulator Suite

Các cổng mặc định:

| Dịch vụ | Port |
|---|---:|
| Authentication Emulator | 9099 |
| Firestore Emulator | 8080 |
| Storage Emulator | 9199 |

Các biến local tùy chọn:

```env
VITE_FIREBASE_USE_EMULATOR=true
VITE_FIREBASE_AUTH_EMULATOR_URL=http://127.0.0.1:9099
VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=127.0.0.1
VITE_FIREBASE_FIRESTORE_EMULATOR_PORT=8080
VITE_FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1
VITE_FIREBASE_STORAGE_EMULATOR_PORT=9199
```

Không đặt các biến emulator này trên Vercel Production.

---

## Kiểm thử và chất lượng

### Unit tests hiện có

- Kiểm tra biến môi trường Firebase bắt buộc.
- Luồng đăng ký và rollback khi Firestore thất bại.
- Luồng đăng nhập và tải hồ sơ.
- Cập nhật hồ sơ và đồng bộ Firebase Auth.
- Chấp nhận JPEG, PNG và WebP hợp lệ.
- Từ chối MIME không hỗ trợ và tệp lớn hơn 5 MB.
- Từ chối tệp có MIME giả mạo.
- Kiểm tra đường dẫn avatar an toàn.
- Kiểm tra upload, cập nhật Auth/Firestore và cleanup avatar cũ.
- Kiểm tra avatar cũ vẫn được giữ khi upload thất bại.

### Kiểm thử thủ công đề xuất

1. Đăng ký tài khoản mới.
2. Xác nhận user xuất hiện trong Firebase Authentication.
3. Xác nhận `users/{uid}` được tạo trong Firestore.
4. Đăng nhập và mở Profile.
5. Chỉnh sửa trường hồ sơ và lưu.
6. Chọn avatar hợp lệ, xem preview và lưu.
7. Refresh trang và xác nhận avatar vẫn còn.
8. Đăng xuất, đăng nhập lại và xác nhận avatar vẫn còn.
9. Thay avatar lần hai và kiểm tra ảnh mới xuất hiện.
10. Thử GIF, SVG, file trên 5 MB và file giả MIME.
11. Kiểm tra mobile, keyboard navigation và reduced motion.
12. Kiểm tra console không có lỗi blocking hoặc WebGL error.

---

## Build production

```bash
npm run build
npm run preview
```

Production bundle được tạo tại:

```text
dist/
```

Không commit thư mục `dist/` lên GitHub.

---

## Triển khai Vercel

### Cấu hình project

| Thiết lập | Giá trị |
|---|---|
| Framework Preset | Vite |
| Root Directory | `./` |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Environment Variables

Thêm đầy đủ vào Vercel Project Settings:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Áp dụng cho môi trường phù hợp:

```text
Production
Preview
Development
```

Sau khi thay đổi biến môi trường, cần redeploy để Vite build lại bundle.

> Nếu thiếu một biến bắt buộc, ứng dụng chủ động dừng khởi tạo thay vì sử dụng Firebase giả hoặc dữ liệu fallback không an toàn.

---

## Khả năng truy cập và hiệu năng

### Accessibility

- Label và `aria-label` rõ ràng cho form và avatar picker.
- Focus ring có độ tương phản cao.
- Trạng thái upload avatar được thông báo qua `aria-live`.
- Trạng thái không chỉ được truyền đạt bằng màu sắc.
- Avatar có alt text và fallback chữ viết tắt.
- Hỗ trợ điều hướng bằng bàn phím.
- Hỗ trợ `prefers-reduced-motion`.

### Hiệu năng

- Chỉ sử dụng một WebGL canvas toàn màn hình.
- Giới hạn device pixel ratio.
- Giảm độ phức tạp shader trên mobile.
- Không cập nhật React state ở mỗi animation frame.
- Tạm dừng animation khi tab bị ẩn.
- Giới hạn số ripple hoạt động đồng thời.
- Revoke object URL của preview avatar khi thay đổi hoặc unmount.
- Chặn upload và submit trùng lặp.

---

## Screenshots

Ảnh giao diện hiện có được lưu tại [`docs/screenshots`](./docs/screenshots/).

Một số trạng thái chính:

- [`register-default.png`](./docs/screenshots/register-default.png)
- [`login-default.png`](./docs/screenshots/login-default.png)
- [`profile-view.png`](./docs/screenshots/profile-view.png)
- [`profile-edit.png`](./docs/screenshots/profile-edit.png)
- [`profile-mobile.png`](./docs/screenshots/profile-mobile.png)

> Screenshots có thể cần chụp lại sau các thay đổi UI mới để phản ánh chính xác avatar upload và hiệu ứng Liquid Glass hiện tại.

---

## Giới hạn hiện tại

- Register, Login và Profile đang chuyển bằng state nội bộ thay vì URL route riêng.
- Chưa có chức năng quên mật khẩu.
- Chưa có email verification workflow hoàn chỉnh.
- Chưa hỗ trợ Google hoặc các OAuth provider khác.
- Chưa có giao diện crop ảnh; avatar dùng `object-fit: cover` trong khung tròn.
- Ảnh được upload nguyên bản sau khi kiểm tra, chưa resize hoặc nén tự động.
- Chưa có nút xóa avatar riêng; người dùng có thể thay avatar mới.
- WebGL có thể giảm độ phức tạp hoặc dùng fallback trên thiết bị yếu.
- URL production public chưa được ghi cố định trong README.

---

## Quy trình đóng góp

```bash
git checkout -b feature/ten-tinh-nang
npm install

# chỉnh sửa code
npm run lint
npm run test
npm run build

git add .
git commit -m "feat: mô tả thay đổi"
git push -u origin feature/ten-tinh-nang
```

Không commit secret, file môi trường, ảnh upload thử hoặc credential kiểm thử.

---

## Mục đích sử dụng

Dự án được xây dựng phục vụ học tập và thực hành tích hợp React với Firebase. Không sử dụng dữ liệu người dùng thật hoặc thông tin nhạy cảm trong môi trường kiểm thử.

© 2026 AetherAuth Team.

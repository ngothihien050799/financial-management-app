# Hướng Dẫn Deploy lên Vercel

## Cách 1: Deploy qua Web UI (CÁCH DỄ NHẤT)

### Bước 1: Tạo tài khoản Vercel

1. Truy cập: **https://vercel.com/signup**
2. Đăng ký bằng GitHub (chọn GitHub nếu có sẵn)
3. Xác thực email

### Bước 2: Kết nối GitHub

1. Sau khi đăng nhập, click **Settings** → **Integrations**
2. Tìm **GitHub** và click **Connect**
3. Chọn tài khoản GitHub của bạn
4. Cấp quyền cho Vercel truy cập repositories

### Bước 3: Import Project

1. Quay về Dashboard Vercel
2. Click **+ New Project**
3. Chọn **Import Repository**
4. Tìm repository: `ngothihien050799/financial-management-app`
5. Click **Import**

### Bước 4: Cấu hình Project

Vercel sẽ tự động phát hiện:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

Chỉ cần click **Deploy**!

### Bước 5: Đợi Deploy

- Vercel sẽ tự động build và deploy
- Sau 2-3 phút, bạn sẽ nhận được URL như: `https://financial-management-app.vercel.app`

---

## Cách 2: Deploy qua CLI (Nếu muốn tự động)

### Bước 1: Đăng nhập Vercel CLI

```bash
vercel login
```

- Chọn GitHub nếu được hỏi
- Trình duyệt sẽ mở, click **Confirm** để xác thực

### Bước 2: Deploy

```bash
vercel --prod
```

### Bước 3: Trả lời các câu hỏi

- **Set up and deploy?**: `y`
- **Which scope do you want to deploy to?**: Chọn tài khoản của bạn
- **Link to existing project?**: `n` (nếu lần đầu)
- **What's your project's name?**: `financial-management-app`
- **In which directory is your code located?**: `.` (enter)
- **Want to modify these settings?**: `n`

App sẽ được deploy ngay!

---

## Cách 3: GitHub Actions (Tự động deploy khi push)

### Tạo workflow file:

1. Tạo thư mục: `.github/workflows`
2. Tạo file: `deploy.yml`

### Nội dung file:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      - name: Pull Vercel Environment
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Cấu hình Secrets:

1. GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. Thêm 3 secrets:
   - `VERCEL_TOKEN`: Lấy từ https://vercel.com/account/tokens
   - `VERCEL_ORG_ID`: Lấy từ dashboard Vercel
   - `VERCEL_PROJECT_ID`: Lấy từ project settings

---

## Kiểm Tra Deploy

Sau khi deploy thành công:

1. URL của bạn: `https://financial-management-app.vercel.app`
2. Bạn có thể thay đổi domain trong Vercel Settings
3. HTTPS được setup tự động (miễn phí)

---

## Troubleshooting

### Nếu build fail:

```bash
# Kiểm tra lỗi
npm run build

# Xóa node_modules và cài lại
rm -r node_modules
npm install
npm run build
```

### Nếu không thấy app:

- Chắc chắn `dist/` folder được tạo
- Kiểm tra `vercel.json` có đúng không

---

## Tips

- Mỗi push lên `main` sẽ tự động re-deploy (nếu dùng Web UI)
- Bạn có thể set environment variables trong Vercel Dashboard
- Miễn phí hỗ trợ HTTPS, CDN, analytics cơ bản

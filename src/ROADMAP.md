## Vinyl Request App Roadmap

### ✅ Hosting Plan: Public, Low-Traffic Vinyl Night Use

**Use Case:**

* Customers access the app to make vinyl music requests
* Events are sporadic during late spring to early fall
* Weekly usage resumes late October through early May
* Hosting must be low-to-no-cost, reliable, and easy to maintain

**Decision:** Use **Fly.io** for free, event-driven hosting with dynamic SSR support

#### 🔧 Setup Tasks:

1. **Install Fly CLI**

   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Launch Fly project from repo**

   ```bash
   fly launch
   ```

   * Say **No** to creating Postgres
   * Say **Yes** to creating a `Dockerfile` (or configure for Node adapter if preferred)

3. **Set environment variables** (from Supabase):

   ```bash
   fly secrets set NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

4. **Deploy to Fly**

   ```bash
   fly deploy
   ```

5. **(Optional)** Add custom domain and enable HTTPS (Fly handles certs)

#### 💰 Cost Summary:

| Resource       | Cost        |
| -------------- | ----------- |
| Fly.io Hosting | Free        |
| Supabase       | Free Tier   |
| Custom Domain  | \~\$10/year |

**Status:** Planned for migration post-testing phase on Vercel

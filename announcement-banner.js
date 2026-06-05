// announcement-banner.js — NextStep Dynamic Client-Side Banner Engine
(function () {
  const BANNER_KEY = 'nextstep-global-banner-dismissed';
  if (sessionStorage.getItem(BANNER_KEY)) return;

  // Asynchronously grab required client infrastructure packages directly from CDN paths
  import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js').then((FirebaseApp) => {
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js').then((Firestore) => {
      
      const firebaseConfig = {
        apiKey: "AIzaSyArZYz6UMheUgBVrNeWvxWml-0zDTbNur0",
        authDomain: "nextstep-12b9a.firebaseapp.com",
        projectId: "nextstep-12b9a",
        storageBucket: "nextstep-12b9a.firebasestorage.app",
        messagingSenderId: "630600034259",
        appId: "1:630600034259:web:6b6284e147a6f79cda7126"
      };

      const app = FirebaseApp.getApps().length ? FirebaseApp.getApps()[0] : FirebaseApp.initializeApp(firebaseConfig);
      const db = Firestore.getFirestore(app);

      document.addEventListener('DOMContentLoaded', async function () {
        try {
          // Fetch entries sorted chronologically to pull freshest metrics blocks
          const q = Firestore.query(Firestore.collection(db, 'announcements'), Firestore.orderBy('createdAt', 'desc'));
          const snap = await Firestore.getDocs(q);
          
          let targetBanner = null;
          const currentTimestamp = new Date();

          // Evaluate document arrays to find the active banner
          snap.forEach((docSnap) => {
            if (targetBanner) return; // Exit logic loop processing once structural instance satisfies conditions
            const data = docSnap.data();
            if (data.type && data.type !== 'banner') return;

            if (data.isActive === true) {
              if (data.expiresAt) {
                const expirationDate = new Date(data.expiresAt.toDate ? data.expiresAt.toDate() : data.expiresAt);
                if (expirationDate > currentTimestamp) {
                  targetBanner = data;
                }
              } else {
                targetBanner = data;
              }
            }
          });

          // Terminate runtime execution cleanly if null values resolve 
          if (!targetBanner) return;

          // Assemble DOM nodes using layout elements
          const banner = document.createElement('div');
          banner.id = 'announcement-banner';
          banner.innerHTML = `
            <span class="announcement-emoji">${targetBanner.emoji || '📢'}</span>
            <div class="announcement-text">
              <span>${targetBanner.text}</span>
              <a href="${targetBanner.link}" target="_blank" rel="noopener" class="announcement-link">
                Sign Up <i class="fas fa-arrow-right"></i>
              </a>
            </div>
            <button class="announcement-close" id="banner-close" aria-label="Dismiss banner">
              <i class="fas fa-times"></i>
            </button>
          `;
          
          document.body.prepend(banner);
          document.body.classList.add('banner-visible');

          // Trigger transition effect animation sequence profiles
          setTimeout(() => { banner.classList.add('visible'); }, 400);

          document.getElementById('banner-close').addEventListener('click', function () {
            banner.classList.remove('visible');
            banner.classList.add('hidden');
            document.body.classList.remove('banner-visible');
            sessionStorage.setItem(BANNER_KEY, 'true');
            setTimeout(() => { banner.remove(); }, 400);
          });

        } catch (err) {
          console.error("Layout notification generation processing error: ", err);
        }
      });
    });
  });
})();

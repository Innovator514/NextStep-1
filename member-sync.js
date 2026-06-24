/**
 * member-sync.js — keeps a lightweight `members/{uid}` directory doc in sync.
 *
 * Why this exists: the admin dashboard's recipient search needs a way to
 * list/search registered users. The Firebase Auth client SDK has no
 * "list all users" call (that only exists in the Admin SDK, which requires
 * a paid Cloud Functions backend), and the old top-level `users/{uid}` docs
 * were never actually written (only their subcollections were), so that
 * collection was always empty.
 *
 * This writes/merges a `members/{uid}` doc — uid, name, email, lastSeenAt —
 * every time onAuthStateChanged fires for a signed-in user. Called from
 * auth-check.js (loaded sitewide, so this covers every page, every existing
 * account included) and from signup.js (so brand-new accounts show up
 * immediately, without waiting for the next page load).
 */
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export async function syncMemberRecord(user) {
  if (!user) return;
  try {
    const db = getFirestore();
    const name = user.displayName || (user.email ? user.email.split('@')[0] : '');
    await setDoc(
      doc(db, 'members', user.uid),
      {
        uid: user.uid,
        name: name,
        email: user.email || '',
        lastSeenAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('[member-sync] Could not sync members record:', e);
  }
}
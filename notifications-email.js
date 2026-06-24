/**
 * notifications-email.js — NextStep Email & Kit Integration (Kit-only)
 * -----------------------------------------------------------------------
 * ALL outbound email goes through Kit. There is no separate transactional
 * email service (no SendGrid) anywhere in this system.
 *
 * See functions/src/notifications.js for the full explanation of how Kit
 * actually sends individual emails (tags + Kit Automations, since Kit
 * doesn't have a "send one custom email right now" endpoint).
 *
 * The short version for THIS file: "sending" a notification just means
 * writing it to Firestore. A Cloud Function (onNewUserNotification, in
 * functions/src/notifications.js) notices that write and handles tagging
 * the person in Kit automatically — nothing else to call from here.
 *
 * ──────────────────────────────────────────────────────────────
 * IMPORTANT: Never put the Kit API key in client JS. All Kit API
 * calls happen in Cloud Functions (httpsCallable), server-side.
 * ──────────────────────────────────────────────────────────────
 */

import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';
import { getFirestore, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const functions = getFunctions();
const db        = getFirestore();

// ─── Cloud Function callable stubs ───────────────────────────────────────────
// These call your deployed Firebase Cloud Functions (functions/src/notifications.js).

const _subscribeToKit     = httpsCallable(functions, 'kitSubscribe');
const _unsubscribeFromKit = httpsCallable(functions, 'kitUnsubscribe');
const _tagSelfInKit       = httpsCallable(functions, 'kitTagSelf');       // tags the signed-in user
const _tagKitSubscriber   = httpsCallable(functions, 'kitTagSubscriber'); // admin only, tags ANYONE

// ─── "Sending" a notification ────────────────────────────────────────────────
// There's no email-sending call here on purpose. Writing the notification
// doc IS the send — onNewUserNotification picks it up from there.

/**
 * Write an event-registration confirmation notification for the
 * currently signed-in user. Call this right after writing their
 * registration to Firestore.
 *
 * This does two things at once: it shows up in their in-app inbox
 * immediately, AND it triggers their "event registered" Kit Automation
 * email (tag: notif-event) — both from this one write.
 *
 * @param {object} event — { id, title, date, location, description }
 */
export async function sendRegistrationConfirmation(event) {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const dateStr = event.date
        ? new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })
        : '';

    try {
        await setDoc(
            doc(db, 'users', uid, 'notifications', `registration_${event.id}`),
            {
                type: 'event',
                title: `You're registered: ${event.title}`,
                body: dateStr ? `${event.title} — ${dateStr}` : event.title,
                detail: `<p>You're confirmed for <strong>${event.title}</strong>` +
                        `${dateStr ? ` on ${dateStr}` : ''}` +
                        `${event.location ? ` at ${event.location}` : ''}.</p>` +
                        `${event.description ? `<p>${event.description}</p>` : ''}`,
                actionLabel: 'View Event',
                actionUrl: `/events/${event.id}`,
                createdAt: serverTimestamp(),
                targetAll: false,
            },
            { merge: true }
        );
    } catch (e) {
        console.error('sendRegistrationConfirmation error:', e);
    }
}

// Event reminders need no client call at all — the scheduledEventReminders
// Cloud Function (functions/src/notifications.js) writes the reminder doc
// itself, on a timer, which triggers the email the same way.

// ─── Kit (ConvertKit) subscriber management ───────────────────────────────────

/**
 * Subscribe an email to the Kit list. Call after sign-up or when the
 * user enables the newsletter toggle.
 *
 * @param {string} email
 * @param {string} firstName
 * @param {object} fields   — Kit custom fields, e.g. { city: 'Boca Raton' }
 */
export async function kitSubscribe(email, firstName, fields = {}) {
    try {
        const result = await _subscribeToKit({ email, firstName, fields });
        return result.data;
    } catch (e) {
        console.error('kitSubscribe error:', e);
    }
}

/**
 * Unsubscribe an email from Kit entirely.
 * Call when the user turns off the newsletter toggle.
 */
export async function kitUnsubscribe(email) {
    try {
        await _unsubscribeFromKit({ email });
    } catch (e) {
        console.error('kitUnsubscribe error:', e);
    }
}

/**
 * Tag the CURRENTLY SIGNED-IN user in Kit — for self-service preference
 * toggles (e.g. "event-alerts-enabled"). Safe for any user to call: the
 * backend only ever tags the caller's own verified email, never someone
 * else's.
 *
 * @param {string} tag — exact Kit tag name
 */
export async function kitTagSelf(tag) {
    try {
        await _tagSelfInKit({ tag });
    } catch (e) {
        console.error('kitTagSelf error:', e);
    }
}

/**
 * Admin-only: tag ANY subscriber by email (e.g. segmenting Town Hall
 * attendees for a follow-up sequence). Throws/logs if the caller isn't
 * an admin — see functions/src/notifications.js.
 *
 * @param {string} email
 * @param {string} tag    — exact Kit tag name
 */
export async function kitTagSubscriber(email, tag) {
    try {
        await _tagKitSubscriber({ email, tag });
    } catch (e) {
        console.error('kitTagSubscriber error:', e);
    }
}

// ─── Notification preference sync ────────────────────────────────────────────

/**
 * Sync notification preferences (from profile toggles) to Kit. Firestore
 * sync is handled separately by profile.js's saveNotificationPreferences.
 *
 * @param {object} prefs
 * @param {string} userEmail
 * @param {string} firstName
 */
export async function syncNotificationPreferences(prefs, userEmail, firstName) {
    if (prefs.newsletter === true) {
        await kitSubscribe(userEmail, firstName, { notifications: 'true' });
    } else if (prefs.newsletter === false) {
        await kitUnsubscribe(userEmail);
    }

    // Segment by event interest — tags the current user only.
    if (prefs.emailNotif) {
        await kitTagSelf('event-alerts-enabled');
    }
}
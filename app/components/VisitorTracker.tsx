"use client";

import { useEffect } from "react";
import { doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Module-level flag prevents double-tracking in React StrictMode (dev only)
let _tracked = false;

export default function VisitorTracker() {
  useEffect(() => {
    if (_tracked) return;
    _tracked = true;

    async function track() {
      try {
        let visitorId = localStorage.getItem("_tramar_vid");
        const isNew = !visitorId;

        if (!visitorId) {
          visitorId = crypto.randomUUID();
          localStorage.setItem("_tramar_vid", visitorId);
        }

        const originHost = document.referrer
          ? (() => {
              try {
                return new URL(document.referrer).hostname;
              } catch {
                return "unknown";
              }
            })()
          : "direct";

        const today = new Date().toISOString().split("T")[0];

        await Promise.all([
          // Summary counters
          setDoc(
            doc(db, "analytics", "summary"),
            {
              totalVisits: increment(1),
              ...(isNew ? { totalUniqueVisitors: increment(1) } : {}),
            },
            { merge: true }
          ),
          // Daily visits
          setDoc(
            doc(db, "dailyVisits", today),
            { count: increment(1) },
            { merge: true }
          ),
          // Traffic origin (dots replaced with dashes for valid doc ID)
          setDoc(
            doc(db, "origins", originHost.replace(/\./g, "-")),
            { host: originHost, count: increment(1) },
            { merge: true }
          ),
          // Visitor session
          setDoc(
            doc(db, "visitors", visitorId),
            {
              lastSeen: serverTimestamp(),
              visitCount: increment(1),
              ...(isNew ? { firstSeen: serverTimestamp() } : {}),
            },
            { merge: true }
          ),
        ]);
      } catch {
        // Silently ignore — tracking must never break the app
      }
    }

    track();
  }, []);

  return null;
}

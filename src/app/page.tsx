"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const FOOD_FACTS = [
  "NYC has over 27,000 restaurants — more than any other city 🍕",
  "The first US pizzeria opened in NYC in 1905 on Spring Street 🍕",
  "NYC's Chinatown is one of the oldest in the Western hemisphere 🥢",
  "There are over 900 food trucks roaming NYC streets 🚚",
  "Brooklyn alone has more Michelin stars than most entire countries ⭐",
  "More than 80 cuisines are represented in Queens alone 🌍",
  "The NYC bagel's unique taste comes from the city's water 🥯",
  "Hell's Kitchen was once home to the city's meatpacking district 🥩",
];

const HERO_DISHES = [
  { emoji: "🍕", label: "Pizza", delay: "0s" },
  { emoji: "🍣", label: "Sushi", delay: "0.3s" },
  { emoji: "🌮", label: "Tacos", delay: "0.6s" },
  { emoji: "🥩", label: "Steak", delay: "0.9s" },
  { emoji: "🍜", label: "Ramen", delay: "1.2s" },
  { emoji: "🥐", label: "Brunch", delay: "1.5s" },
];

export default function Home() {
  const [factVisible, setFactVisible] = useState(false);
  const randomFact = useMemo(() => FOOD_FACTS[Math.floor(Math.random() * FOOD_FACTS.length)], []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0700",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "#fff8f0",
      paddingTop: "56px",
      overflowX: "hidden",
    }}>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
      `}</style>

      {}
      <section style={{
        minHeight: "90vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", padding: "60px 24px",
        textAlign: "center",
      }}>

        {}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 40% at 50% 60%, rgba(180,60,0,0.2) 0%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(100,30,0,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(150,50,0,0.1) 0%, transparent 60%)
          `,
        }} />

        {}
        <div style={{
          display: "flex", gap: "24px", marginBottom: "48px",
          justifyContent: "center", flexWrap: "wrap",
        }}>
          {HERO_DISHES.map((d, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
            }}>
              <div style={{
                width: "72px", height: "72px",
                background: "rgba(255,255,255,0.05)",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.08)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "36px",
                backdropFilter: "blur(4px)",
              }}>{d.emoji}</div>
              <span style={{ fontSize: "11px", color: "rgba(255,248,240,0.3)", letterSpacing: "1px", fontFamily: "system-ui" }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>

        {}
        <div className="fade-up">
          <div style={{
            fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase",
            color: "#c2410c", marginBottom: "20px", fontFamily: "system-ui",
          }}>
            NYC Bites — New York City's Food Guide
          </div>

          <h1 style={{
            fontSize: "clamp(42px, 7vw, 80px)",
            fontWeight: "normal",
            lineHeight: 1.05,
            margin: "0 0 24px",
            letterSpacing: "-1px",
          }}>
            Every craving.<br />
            <span style={{
              fontStyle: "italic", color: "#fb923c",
            }}>Every neighborhood.</span>
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "rgba(255,248,240,0.45)",
            maxWidth: "480px", margin: "0 auto 40px",
            lineHeight: 1.7, fontFamily: "system-ui",
          }}>
            Stop scrolling through endless apps. Tell us what you're craving
            and we'll find the perfect NYC restaurant — fast.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{
              padding: "16px 36px",
              background: "linear-gradient(135deg, #c2410c, #ea580c)",
              color: "white", textDecoration: "none",
              borderRadius: "999px", fontSize: "15px", fontWeight: 700,
              fontFamily: "system-ui",
              boxShadow: "0 4px 24px rgba(234,88,12,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
              display: "inline-block",
            }}>
              Find My Restaurant →
            </Link>
            <Link href="/about-us" style={{
              padding: "16px 28px",
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,248,240,0.6)", textDecoration: "none",
              borderRadius: "999px", fontSize: "15px",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "system-ui", display: "inline-block",
            }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {}
      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div
          onMouseEnter={() => setFactVisible(true)}
          onMouseLeave={() => setFactVisible(false)}
          style={{ position: "relative", borderRadius: "24px", overflow: "hidden", cursor: "pointer" }}
        >
          <img
            src="/daytime.png"
            alt="NYC"
            style={{ width: "100%", height: "auto", display: "block", filter: "brightness(0.75)" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, #0c0700 0%, transparent 50%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: "24px", left: "24px",
            color: "white",
          }}>
            <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", opacity: 0.5, fontFamily: "system-ui" }}>
              New York City
            </div>
            <div style={{ fontSize: "22px", fontWeight: "normal", marginTop: "4px" }}>
              27,000+ restaurants waiting
            </div>
          </div>

          {factVisible && (
            <div style={{
              position: "absolute", bottom: "24px", right: "24px",
              background: "rgba(12,7,0,0.9)",
              border: "1px solid rgba(251,146,60,0.3)",
              borderRadius: "14px", padding: "12px 18px",
              maxWidth: "280px", textAlign: "left",
              backdropFilter: "blur(8px)",
              animation: "fadeUp 0.2s ease",
            }}>
              <div style={{ fontSize: "11px", color: "#fb923c", letterSpacing: "1px", marginBottom: "4px", fontFamily: "system-ui" }}>
                DID YOU KNOW
              </div>
              <div style={{ fontSize: "13px", lineHeight: 1.5, color: "rgba(255,248,240,0.8)", fontFamily: "system-ui" }}>
                {randomFact}
              </div>
            </div>
          )}
        </div>
      </section>

      {}
      <section style={{
        maxWidth: "900px", margin: "0 auto", padding: "0 24px 80px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#c2410c", marginBottom: "12px", fontFamily: "system-ui" }}>
            How it works
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: "normal", margin: 0 }}>
            From craving to table<br />
            <em style={{ color: "#fb923c" }}>in seconds</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          {[
            { emoji: "📍", title: "Your Location", desc: "Enter your neighborhood or address to find restaurants nearby" },
            { emoji: "🎯", title: "Set Preferences", desc: "Choose cuisine, dining style, and budget that match your mood" },
            { emoji: "🗺️", title: "See the Map", desc: "Browse results on a live map with ratings and details" },
            { emoji: "🍽️", title: "Go Eat", desc: "Get directions in one tap and enjoy your meal" },
          ].map((f, i) => (
            <div key={i} style={{
              padding: "24px 20px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: "16px",
            }}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{f.emoji}</div>
              <div style={{ fontSize: "16px", marginBottom: "8px", color: "#fff8f0" }}>{f.title}</div>
              <div style={{ fontSize: "13px", lineHeight: 1.6, color: "rgba(255,248,240,0.4)", fontFamily: "system-ui" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{
          maxWidth: "700px", margin: "0 auto",
          background: "linear-gradient(135deg, rgba(180,60,0,0.3), rgba(120,40,0,0.2))",
          border: "1px solid rgba(251,146,60,0.2)",
          borderRadius: "24px", padding: "48px 40px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "36px", marginBottom: "16px" }}>🗽</div>
          <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: "normal", margin: "0 0 12px" }}>
            Ready to eat?
          </h2>
          <p style={{ color: "rgba(255,248,240,0.45)", fontFamily: "system-ui", fontSize: "15px", margin: "0 0 28px" }}>
            Join thousands of New Yorkers who found their next favorite spot
          </p>
          <Link href="/signup" style={{
            padding: "14px 32px",
            background: "#ea580c", color: "white",
            textDecoration: "none", borderRadius: "999px",
            fontSize: "15px", fontWeight: 700, fontFamily: "system-ui",
            display: "inline-block",
          }}>
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px", textAlign: "center",
        fontSize: "12px", color: "rgba(255,248,240,0.2)",
        fontFamily: "system-ui",
      }}>
        🍽️ NYC Bites — Find your next perfect meal
      </footer>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const CUISINES = [
  { label: "Italian",       value: "italian_restaurant",        emoji: "🍕" },
  { label: "Japanese",      value: "japanese_restaurant",       emoji: "🍣" },
  { label: "Mexican",       value: "mexican_restaurant",        emoji: "🌮" },
  { label: "Chinese",       value: "chinese_restaurant",        emoji: "🥢" },
  { label: "Indian",        value: "indian_restaurant",         emoji: "🍛" },
  { label: "Thai",          value: "thai_restaurant",           emoji: "🍜" },
  { label: "Greek",         value: "greek_restaurant",          emoji: "🥙" },
  { label: "American",      value: "american_restaurant",       emoji: "🍔" },
  { label: "French",        value: "french_restaurant",         emoji: "🥐" },
  { label: "Korean",        value: "korean_restaurant",         emoji: "🍖" },
  { label: "Mediterranean", value: "mediterranean_restaurant",  emoji: "🫒" },
  { label: "Vietnamese",    value: "vietnamese_restaurant",     emoji: "🍲" },
  { label: "Halal",         value: "halal_restaurant",          emoji: "🌙" },
  { label: "Sushi",         value: "sushi_restaurant",          emoji: "🍱" },
  { label: "Pizza",         value: "pizza_restaurant",          emoji: "🍕" },
  { label: "Sandwiches",    value: "sandwich_shop",             emoji: "🥪" },
  { label: "Seafood",       value: "seafood_restaurant",        emoji: "🦞" },
  { label: "Steakhouse",    value: "steak_house",               emoji: "🥩" },
];

const DINING_STYLES = [
  { label: "Sit-Down",    value: "restaurant",           emoji: "🪑", desc: "Full table service" },
  { label: "Fast Food",   value: "fast_food_restaurant", emoji: "⚡", desc: "Quick & easy" },
  { label: "Café",        value: "cafe",                 emoji: "☕", desc: "Relaxed & casual" },
  { label: "Bar & Grill", value: "bar",                  emoji: "🍺", desc: "Food + drinks" },
  { label: "Bakery",      value: "bakery",               emoji: "🥐", desc: "Fresh baked goods" },
  { label: "Takeout",     value: "meal_takeaway",        emoji: "🥡", desc: "Take it with you" },
];

const BUDGETS = [
  { label: "$",    value: "1", desc: "Under $15" },
  { label: "$$",   value: "2", desc: "$15 – $35" },
  { label: "$$$",  value: "3", desc: "$35 – $70" },
  { label: "$$$$", value: "4", desc: "$70+" },
];

const DISTANCES = [
  { label: "0.5 mi", value: "0.5" },
  { label: "1 mi",   value: "1" },
  { label: "2 mi",   value: "2" },
  { label: "5 mi",   value: "5" },
  { label: "Any",    value: "10" },
];

const RATINGS = [
  { label: "Any",    value: "0",   stars: "" },
  { label: "3.0+",  value: "3.0", stars: "⭐⭐⭐" },
  { label: "3.5+",  value: "3.5", stars: "⭐⭐⭐½" },
  { label: "4.0+",  value: "4.0", stars: "⭐⭐⭐⭐" },
  { label: "4.5+",  value: "4.5", stars: "⭐⭐⭐⭐½" },
];

const HOURS = [
  { label: "Any time",     value: "any" },
  { label: "Open now",     value: "open_now" },
  { label: "Open tonight", value: "open_tonight" },
  { label: "Open weekends",value: "open_weekends" },
];

const RATING_COUNTS = [
  { label: "Any",    value: "0" },
  { label: "50+",    value: "50" },
  { label: "100+",   value: "100" },
  { label: "500+",   value: "500" },
  { label: "1000+",  value: "1000" },
];

export default function PreferencesPage() {
  const router = useRouter();
  const [selectedCuisines,  setSelectedCuisines]  = useState<string[]>([]);
  const [selectedStyles,    setSelectedStyles]    = useState<string[]>([]);
  const [selectedBudget,    setSelectedBudget]    = useState("");
  const [selectedDistance,  setSelectedDistance]  = useState("2");
  const [selectedRating,    setSelectedRating]    = useState("0");
  const [selectedHours,     setSelectedHours]     = useState("any");
  const [selectedRatingCount, setSelectedRatingCount] = useState("0");
  const [address,           setAddress]           = useState("");
  const [addressError,      setAddressError]      = useState("");
  const [loading,           setLoading]           = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "us" },
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.formatted_address) return;

      setAddress(place.formatted_address);
    });
  }, []);

  const toggle = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];

  const handleSubmit = async () => {
    if (!address.trim()) {
      setAddressError("Please enter your address or neighborhood");
      return;
    }
    setLoading(true);
    setAddressError("");

    try {
      const geoRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ", New York City")}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const geoData = await geoRes.json();

      if (!geoData.results?.length) {
        setAddressError("Address not found. Try a neighborhood like 'Williamsburg' or 'Midtown'");
        setLoading(false);
        return;
      }

      const { lat, lng } = geoData.results[0].geometry.location;
      const allTypes = [...selectedCuisines, ...selectedStyles];

      const prefs = {
        cuisines:       selectedCuisines,
        diningStyles:   selectedStyles,
        budget:         selectedBudget,
        distance:       selectedDistance,
        minRating:      selectedRating,
        hours:          selectedHours,
        minRatingCount: selectedRatingCount,
        activityTypes:  allTypes.length > 0 ? allTypes : ["restaurant"],
        location:       { latitude: lat, longitude: lng },
        address,
      };

      localStorage.setItem("userPreferences", JSON.stringify(prefs));
      router.push("/select_activities");
    } catch {
      setAddressError("Could not look up address. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0a00",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      paddingTop: "56px",
      position: "relative",
      overflow: "hidden",
    }}>
      {}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse at 10% 20%, rgba(180,60,0,0.18) 0%, transparent 50%),
          radial-gradient(ellipse at 90% 80%, rgba(120,40,0,0.15) 0%, transparent 50%)
        `,
      }} />

      {}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {["🍕","🍣","🌮","🍜","🥩","🍷","🥗","🍱","🥐","🍔","🫕","🥘"].map((emoji, i) => (
          <div key={i} style={{
            position: "absolute", fontSize: `${24 + (i % 3) * 10}px`,
            opacity: 0.04 + (i % 4) * 0.015,
            top: `${(i * 17 + 5) % 90}%`, left: `${(i * 23 + 8) % 92}%`,
            transform: `rotate(${(i * 37) % 60 - 30}deg)`, userSelect: "none",
          }}>{emoji}</div>
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "680px", margin: "0 auto", padding: "40px 20px 60px" }}>

        {}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#c2410c", marginBottom: "12px", fontFamily: "system-ui" }}>
            NYC Bites
          </div>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: "normal", color: "#fff8f0", lineHeight: 1.1, margin: "0 0 12px", letterSpacing: "-0.5px" }}>
            What are you<br />
            <em style={{ color: "#fb923c", fontStyle: "italic" }}>hungry for?</em>
          </h1>
          <p style={{ fontSize: "15px", color: "rgba(255,248,240,0.45)", margin: 0, fontFamily: "system-ui" }}>
            Tell us your cravings and we'll find the perfect spot
          </p>
        </div>

        {}
        <Section step="01" title="Where are you?">
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", fontSize: "18px", pointerEvents: "none" }}>📍</div>
            <input
              ref={inputRef}
              value={address}
              onChange={e => { setAddress(e.target.value); setAddressError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="Neighborhood or address (e.g. Williamsburg, Brooklyn)"
              autoComplete="off"
              style={{
                width: "100%", padding: "16px 16px 16px 48px",
                background: "rgba(255,255,255,0.06)",
                border: `1.5px solid ${addressError ? "#ef4444" : "rgba(255,255,255,0.12)"}`,
                borderRadius: "12px", color: "#fff8f0", fontSize: "15px",
                outline: "none", fontFamily: "system-ui", boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={e => e.target.style.borderColor = "#fb923c"}
              onBlur={e => e.target.style.borderColor = addressError ? "#ef4444" : "rgba(255,255,255,0.12)"}
            />
          </div>
          {addressError && <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#f87171", fontFamily: "system-ui" }}>{addressError}</p>}
        </Section>

        {}
        <Section step="02" title="Cuisine type" subtitle="Pick as many as you like">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {CUISINES.map(c => (
              <button key={c.value} onClick={() => setSelectedCuisines(toggle(selectedCuisines, c.value))}
                style={{
                  padding: "8px 16px", borderRadius: "999px",
                  border: `1.5px solid ${selectedCuisines.includes(c.value) ? "#fb923c" : "rgba(255,255,255,0.12)"}`,
                  background: selectedCuisines.includes(c.value) ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.04)",
                  color: selectedCuisines.includes(c.value) ? "#fb923c" : "rgba(255,248,240,0.6)",
                  fontSize: "13px", cursor: "pointer", fontFamily: "system-ui",
                  fontWeight: selectedCuisines.includes(c.value) ? 600 : 400,
                  transition: "all 0.12s", display: "flex", alignItems: "center", gap: "6px",
                }}>
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </Section>

        {}
        <Section step="03" title="Dining experience" subtitle="What kind of vibe?">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {DINING_STYLES.map(s => (
              <button key={s.value} onClick={() => setSelectedStyles(toggle(selectedStyles, s.value))}
                style={{
                  padding: "14px 10px", borderRadius: "12px",
                  border: `1.5px solid ${selectedStyles.includes(s.value) ? "#fb923c" : "rgba(255,255,255,0.10)"}`,
                  background: selectedStyles.includes(s.value) ? "rgba(251,146,60,0.12)" : "rgba(255,255,255,0.03)",
                  color: selectedStyles.includes(s.value) ? "#fb923c" : "rgba(255,248,240,0.55)",
                  cursor: "pointer", fontFamily: "system-ui", textAlign: "center", transition: "all 0.12s",
                }}>
                <div style={{ fontSize: "22px", marginBottom: "6px" }}>{s.emoji}</div>
                <div style={{ fontSize: "12px", fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "2px" }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {}
        <Section step="04" title="Budget per person">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {BUDGETS.map(b => (
              <button key={b.value} onClick={() => setSelectedBudget(b.value === selectedBudget ? "" : b.value)}
                style={{
                  padding: "16px 8px", borderRadius: "12px",
                  border: `1.5px solid ${selectedBudget === b.value ? "#fb923c" : "rgba(255,255,255,0.10)"}`,
                  background: selectedBudget === b.value ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.03)",
                  cursor: "pointer", fontFamily: "system-ui", textAlign: "center", transition: "all 0.12s",
                }}>
                <div style={{ fontSize: "20px", fontWeight: 700, color: selectedBudget === b.value ? "#fb923c" : "rgba(255,248,240,0.7)", fontFamily: "Georgia, serif" }}>{b.label}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,248,240,0.35)", marginTop: "4px" }}>{b.desc}</div>
              </button>
            ))}
          </div>
        </Section>

        {}
        <Section step="05" title="Distance">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {DISTANCES.map(d => (
              <button key={d.value} onClick={() => setSelectedDistance(d.value)}
                style={{
                  padding: "10px 18px", borderRadius: "999px",
                  border: `1.5px solid ${selectedDistance === d.value ? "#fb923c" : "rgba(255,255,255,0.10)"}`,
                  background: selectedDistance === d.value ? "#fb923c" : "rgba(255,255,255,0.03)",
                  color: selectedDistance === d.value ? "#0f0a00" : "rgba(255,248,240,0.6)",
                  fontSize: "13px", fontWeight: selectedDistance === d.value ? 700 : 400,
                  cursor: "pointer", fontFamily: "system-ui", transition: "all 0.12s",
                }}>
                {d.label}
              </button>
            ))}
          </div>
        </Section>

        {}
        <Section step="06" title="Minimum rating">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {RATINGS.map(r => (
              <button key={r.value} onClick={() => setSelectedRating(r.value)}
                style={{
                  padding: "10px 16px", borderRadius: "999px",
                  border: `1.5px solid ${selectedRating === r.value ? "#fb923c" : "rgba(255,255,255,0.10)"}`,
                  background: selectedRating === r.value ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.03)",
                  color: selectedRating === r.value ? "#fb923c" : "rgba(255,248,240,0.6)",
                  fontSize: "13px", fontWeight: selectedRating === r.value ? 700 : 400,
                  cursor: "pointer", fontFamily: "system-ui", transition: "all 0.12s",
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </Section>

        {}
        <Section step="07" title="Minimum number of reviews">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {RATING_COUNTS.map(r => (
              <button key={r.value} onClick={() => setSelectedRatingCount(r.value)}
                style={{
                  padding: "10px 18px", borderRadius: "999px",
                  border: `1.5px solid ${selectedRatingCount === r.value ? "#fb923c" : "rgba(255,255,255,0.10)"}`,
                  background: selectedRatingCount === r.value ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.03)",
                  color: selectedRatingCount === r.value ? "#fb923c" : "rgba(255,248,240,0.6)",
                  fontSize: "13px", fontWeight: selectedRatingCount === r.value ? 700 : 400,
                  cursor: "pointer", fontFamily: "system-ui", transition: "all 0.12s",
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </Section>

        {}
        <Section step="08" title="Opening hours">
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {HOURS.map(h => (
              <button key={h.value} onClick={() => setSelectedHours(h.value)}
                style={{
                  padding: "10px 18px", borderRadius: "999px",
                  border: `1.5px solid ${selectedHours === h.value ? "#fb923c" : "rgba(255,255,255,0.10)"}`,
                  background: selectedHours === h.value ? "rgba(251,146,60,0.15)" : "rgba(255,255,255,0.03)",
                  color: selectedHours === h.value ? "#fb923c" : "rgba(255,248,240,0.6)",
                  fontSize: "13px", fontWeight: selectedHours === h.value ? 700 : 400,
                  cursor: "pointer", fontFamily: "system-ui", transition: "all 0.12s",
                }}>
                {h.label}
              </button>
            ))}
          </div>
        </Section>

        {}
        <div style={{ marginTop: "32px", display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            flex: 1, padding: "16px",
            background: loading ? "rgba(251,146,60,0.4)" : "linear-gradient(135deg, #c2410c, #ea580c)",
            color: "white", border: "none", borderRadius: "12px",
            fontSize: "15px", fontWeight: 700, cursor: loading ? "default" : "pointer",
            fontFamily: "system-ui", boxShadow: loading ? "none" : "0 4px 20px rgba(234,88,12,0.4)",
            transition: "all 0.15s",
          }}>
            {loading ? "Finding location..." : "Find Restaurants →"}
          </button>
          <button onClick={() => { localStorage.removeItem("userPreferences"); router.push("/select_activities"); }}
            style={{
              padding: "16px 20px", background: "transparent",
              color: "rgba(255,248,240,0.4)", border: "1.5px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", fontSize: "14px", cursor: "pointer", fontFamily: "system-ui",
            }}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ step, title, subtitle, children }: {
  step: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "12px" }}>
        <span style={{ fontSize: "11px", color: "#c2410c", fontFamily: "system-ui", fontWeight: 600, letterSpacing: "1px" }}>{step}</span>
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "normal", color: "#fff8f0", letterSpacing: "-0.2px" }}>{title}</h3>
        {subtitle && <span style={{ fontSize: "12px", color: "rgba(255,248,240,0.35)", fontFamily: "system-ui" }}>— {subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

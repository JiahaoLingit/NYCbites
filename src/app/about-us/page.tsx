"use client";

import Link from "next/link";

const TEAM = [
    { name: "Jiahao Lin",       role: "Full Stack Developer" },
    { name: "Angel Christian",  role: "Full Stack Developer" },
    { name: "Moises Teutle",    role: "Full Stack Developer" },
];

export default function AboutUs() {
    return (
        <div style={{
            minHeight: "100vh",
            background: "#0c0700",
            fontFamily: "'Georgia', 'Times New Roman', serif",
            color: "#fff8f0",
            paddingTop: "56px",
        }}>
            <div style={{ maxWidth: "720px", margin: "0 auto", padding: "60px 24px" }}>

                <div style={{ marginBottom: "56px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#c2410c", marginBottom: "16px", fontFamily: "system-ui" }}>
                        About the Project
                    </div>
                    <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: "normal", lineHeight: 1.1, margin: "0 0 20px", letterSpacing: "-0.5px" }}>
                        NYC Bites
                    </h1>
                    <p style={{ fontSize: "17px", lineHeight: 1.8, color: "rgba(255,248,240,0.55)", fontFamily: "system-ui", margin: 0, maxWidth: "560px" }}>
                        A restaurant recommendation platform built to help New Yorkers
                        discover great dining options without the noise. Enter your neighborhood,
                        set your preferences, and find your next perfect meal — fast.
                    </p>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: "48px" }} />

                <div style={{ marginBottom: "48px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#c2410c", marginBottom: "20px", fontFamily: "system-ui" }}>
                        Course Info
                    </div>
                    <div style={{
                        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "16px", padding: "28px 32px",
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px",
                    }}>
                        {[
                            { label: "Institution", value: "Hunter College" },
                            { label: "Course",      value: "CSCI 39548" },
                            { label: "Section",     value: "Practical Web Development" },
                            { label: "Group",       value: "Group 4" },
                        ].map(item => (
                            <div key={item.label}>
                                <div style={{ fontSize: "11px", color: "rgba(255,248,240,0.3)", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "system-ui", marginBottom: "6px" }}>
                                    {item.label}
                                </div>
                                <div style={{ fontSize: "16px", color: "#fff8f0" }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: "48px" }} />

                <div style={{ marginBottom: "48px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#c2410c", marginBottom: "20px", fontFamily: "system-ui" }}>
                        The Team
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {TEAM.map((member, i) => (
                            <div key={i} style={{
                                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                                borderRadius: "12px", padding: "20px 24px",
                                display: "flex", alignItems: "center", gap: "14px",
                            }}>
                                <div style={{
                                    width: "40px", height: "40px", borderRadius: "50%",
                                    background: "linear-gradient(135deg, #c2410c, #ea580c)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "16px", fontWeight: 700, color: "white", fontFamily: "system-ui",
                                    flexShrink: 0,
                                }}>
                                    {member.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: "16px", color: "#fff8f0" }}>{member.name}</div>
                                    <div style={{ fontSize: "12px", color: "rgba(255,248,240,0.4)", fontFamily: "system-ui", marginTop: "2px" }}>{member.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", marginBottom: "48px" }} />

                <div style={{ marginBottom: "56px" }}>
                    <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: "#c2410c", marginBottom: "20px", fontFamily: "system-ui" }}>
                        Tech Stack
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {["Next.js 15","React 19","TypeScript","Node.js","Express.js","Firebase Auth","Firestore","Google Places API","Google Maps API","Chakra UI","Axios"].map(tech => (
                            <span key={tech} style={{
                                padding: "6px 14px",
                                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "999px", fontSize: "12px", color: "rgba(255,248,240,0.55)", fontFamily: "system-ui",
                            }}>{tech}</span>
                        ))}
                    </div>
                </div>

                <Link href="/" style={{
                    display: "inline-block", padding: "14px 28px",
                    background: "linear-gradient(135deg, #c2410c, #ea580c)",
                    color: "white", textDecoration: "none",
                    borderRadius: "999px", fontSize: "14px", fontWeight: 700, fontFamily: "system-ui",
                }}>
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
